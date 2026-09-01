using Application.Validation;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class TicketService
{
    // With 32^8 possible codes, two collisions in a row would mean a bug, not bad luck.
    private const int MaxCodeAttempts = 5;

    private readonly ITicketRepository _ticketRepository;
    private readonly IEpicRepository _epicRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISprintRepository _sprintRepository;

    public TicketService(
        ITicketRepository ticketRepository,
        IEpicRepository epicRepository,
        IUserRepository userRepository,
        ISprintRepository sprintRepository)
    {
        _ticketRepository = ticketRepository;
        _epicRepository = epicRepository;
        _userRepository = userRepository;
        _sprintRepository = sprintRepository;
    }

    public async Task<List<Ticket>> GetAllAsync() =>
        await _ticketRepository.GetAllAsync();

    public async Task<Ticket?> GetByIdAsync(int id) =>
        await _ticketRepository.GetByIdWithRelationsAsync(id);

    public async Task<Ticket?> GetByCodeAsync(string code) =>
        await _ticketRepository.GetByCodeAsync(code);

    public async Task<List<Ticket>> GetByEpicIdAsync(int epicId) =>
        await _ticketRepository.GetByEpicIdAsync(epicId);

    // A null sprintId returns the backlog.
    public async Task<List<Ticket>> GetBySprintIdAsync(int? sprintId) =>
        await _ticketRepository.GetBySprintIdAsync(sprintId);

    // The tickets this one divides into.
    public async Task<List<Ticket>> GetChildrenAsync(int parentId) =>
        await _ticketRepository.GetByParentIdAsync(parentId);

    public async Task<Ticket> CreateAsync(Ticket ticket)
    {
        await EnsureEpicExistsAsync(ticket.EpicId);
        await EnsureUserExistsAsync(ticket.AssigneeId, "responsable");
        await EnsureUserExistsAsync(ticket.ReporterId, "reporter");
        await EnsureSprintExistsAsync(ticket.SprintId);

        // childId is null because the ticket has no Id yet, and a row that does not exist
        // cannot be its own parent.
        await EnsureParentIsValidAsync(ticket.ParentId, ticket.Type, childId: null);

        // What came in is whatever the client sent; what goes to the repository is the
        // canonical document for this type.
        ticket.ExtraFields = TicketExtrasValidator.Normalize(ticket.Type, ticket.ExtraFields);

        ticket.Code = await GenerateUniqueCodeAsync(ticket.Type);

        // Set here and not in a SaveChanges override: every other rule in this project lives
        // in a service, and an override would be invisible to whoever is reading this class
        // trying to work out why UpdatedAt moved. Same reasoning as assigning Code here.
        ticket.CreatedAt = DateTimeOffset.UtcNow;
        ticket.UpdatedAt = ticket.CreatedAt;

        await _ticketRepository.AddAsync(ticket);
        return ticket;
    }

    // Returns false when the ticket does not exist.
    public async Task<bool> UpdateAsync(int id, Ticket changes)
    {
        Ticket? ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket is null)
        {
            return false;
        }

        await EnsureEpicExistsAsync(changes.EpicId);
        await EnsureUserExistsAsync(changes.AssigneeId, "responsable");
        await EnsureUserExistsAsync(changes.ReporterId, "reporter");
        await EnsureSprintExistsAsync(changes.SprintId);

        // The type is the ticket's own, not the caller's: Type cannot be updated, so the
        // parent and the extras are both checked against what this ticket already is.
        await EnsureParentIsValidAsync(changes.ParentId, ticket.Type, childId: id);

        string? normalizedExtras = TicketExtrasValidator.Normalize(ticket.Type, changes.ExtraFields);

        // Code and Type are deliberately absent, and CreatedAt with them: all three are
        // assigned once on create. Type in particular cannot change, because Code carries its
        // prefix — converting a ticket means creating a new one.
        ticket.Title = changes.Title;
        ticket.Description = changes.Description;
        ticket.EpicId = changes.EpicId;
        ticket.Priority = changes.Priority;
        ticket.Status = changes.Status;
        ticket.Points = changes.Points;
        ticket.AssigneeId = changes.AssigneeId;
        ticket.ReporterId = changes.ReporterId;
        ticket.SprintId = changes.SprintId;
        ticket.ParentId = changes.ParentId;
        ticket.ExtraFields = normalizedExtras;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);
        return true;
    }

    // Returns false when the ticket does not exist.
    public async Task<bool> DeleteAsync(int id)
    {
        Ticket? ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket is null)
        {
            return false;
        }

        // The children go with the parent: a task that was split out of a story has no
        // meaning once the story is gone, which is why the self-relation is the one optional
        // FK here that does not behave like Epic.OwnerId.
        //
        // Done in code because the relationship is configured with Restrict, so the database
        // would refuse this delete while a child still points at it. One call per child,
        // matching what BaseRepository already does; a ticket has a handful of children at
        // most, and the day that stops being true this becomes one ExecuteDeleteAsync.
        List<Ticket> children = await _ticketRepository.GetByParentIdAsync(id);
        foreach (Ticket child in children)
        {
            await _ticketRepository.DeleteAsync(child.Id);
        }

        await _ticketRepository.DeleteAsync(id);
        return true;
    }

    // The pre-check is check-then-act, so the unique index is the real guarantee: two racing
    // writers get past this and the index stops them, as a 500 rather than a readable message.
    // Catching DbUpdateException would drag EF Core into Application, which only knows Domain.
    private async Task<string> GenerateUniqueCodeAsync(TicketType type)
    {
        for (int attempt = 0; attempt < MaxCodeAttempts; attempt++)
        {
            string code = TicketCode.Generate(type);
            if (!await _ticketRepository.CodeExistsAsync(code))
            {
                return code;
            }
        }

        throw new InvalidOperationException("No se pudo generar un código único para el ticket.");
    }

    private async Task EnsureEpicExistsAsync(int epicId)
    {
        Epic? epic = await _epicRepository.GetByIdAsync(epicId);
        if (epic is null)
        {
            throw new ArgumentException($"No existe una épica con Id {epicId}.");
        }
    }

    // Shared by AssigneeId and ReporterId: both are optional, both point at Users, and both
    // report the field by name so a 400 says which one was wrong.
    private async Task EnsureUserExistsAsync(int? userId, string field)
    {
        if (userId is null)
        {
            return;
        }

        User? user = await _userRepository.GetByIdAsync(userId.Value);
        if (user is null)
        {
            throw new ArgumentException($"No existe un usuario con Id {userId} para el {field}.");
        }
    }

    // Null is valid and means the backlog, so only a sprint that was named has to exist.
    private async Task EnsureSprintExistsAsync(int? sprintId)
    {
        if (sprintId is null)
        {
            return;
        }

        Sprint? sprint = await _sprintRepository.GetByIdAsync(sprintId.Value);
        if (sprint is null)
        {
            throw new ArgumentException($"No existe un sprint con Id {sprintId}.");
        }
    }

    /* Which parent a ticket may hang from, by type:

         userStory -> nothing. A user story hangs off an epic, and that is EpicId.
         task      -> a user story, or nothing.
         bug       -> a user story, or nothing (a bug found while building it).
         fix       -> a bug, or nothing.

       That table is doing more work than it looks. Follow any chain of legal parents and it
       ends: fix -> bug -> userStory -> nothing. A cycle would need a type that can be its own
       ancestor and there is none, so there is no ancestor walk here and no maximum-depth
       constant — the depth is three, and it is three because of the types.

       Add a type that may parent its own kind and that reasoning dies: this method would then
       need a real walk up the chain. Better said out loud here than discovered later. */
    private static TicketType[] AllowedParentTypes(TicketType childType) => childType switch
    {
        TicketType.UserStory => [],
        TicketType.Task => [TicketType.UserStory],
        TicketType.Bug => [TicketType.UserStory],
        TicketType.Fix => [TicketType.Bug],
        _ => []
    };

    private async Task EnsureParentIsValidAsync(int? parentId, TicketType childType, int? childId)
    {
        if (parentId is null)
        {
            return;
        }

        if (childId is not null && parentId == childId)
        {
            throw new ArgumentException("Un ticket no puede ser su propio padre.");
        }

        Ticket? parent = await _ticketRepository.GetByIdAsync(parentId.Value);
        if (parent is null)
        {
            throw new ArgumentException($"No existe un ticket con Id {parentId}.");
        }

        TicketType[] allowed = AllowedParentTypes(childType);
        if (allowed.Length == 0)
        {
            throw new ArgumentException($"Un ticket de tipo {childType} no puede tener un ticket padre.");
        }

        if (!allowed.Contains(parent.Type))
        {
            throw new ArgumentException(
                $"Un ticket de tipo {childType} solo puede colgar de: {string.Join(", ", allowed)}.");
        }
    }
}
