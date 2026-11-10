using Domain.Entities;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure;

public class Req2TicketContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<Project> Projects { get; set; }

    public DbSet<ProjectMember> ProjectMembers { get; set; }

    public DbSet<Epic> Epics { get; set; }

    public DbSet<Ticket> Tickets { get; set; }

    public DbSet<Sprint> Sprints { get; set; }

    public DbSet<Workflow> Workflows { get; set; }

    public Req2TicketContext(DbContextOptions<Req2TicketContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUsersAndProjects(modelBuilder);
        ConfigureEpicsAndSprints(modelBuilder);
        ConfigureTickets(modelBuilder);
        ConfigureWorkflows(modelBuilder);
    }

    private static void ConfigureUsersAndProjects(ModelBuilder modelBuilder)
    {
        // Plain case-sensitive index: the services lowercase the email on every write and lookup.
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Project>(project =>
        {
            project.HasIndex(p => p.Key).IsUnique();

            /* The key and the counters are never written by an update. Key is immutable, and the
               counters only move through ProjectRepository.TakeNextNumberAsync: without this, saving
               a project that was loaded before someone took a number would rewind its counter and
               hand the same number out twice. */
            foreach (string property in new[]
            {
                nameof(Project.Key),
                nameof(Project.NextEpicNumber),
                nameof(Project.NextUserStoryNumber),
                nameof(Project.NextTaskNumber),
                nameof(Project.NextBugNumber),
                nameof(Project.NextFixNumber)
            })
            {
                project.Property(property).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);
            }

            // Deleting a project deletes its memberships. The user rows stay.
            project.HasMany(p => p.Members)
                .WithOne(m => m.Project)
                .HasForeignKey(m => m.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProjectMember>(member =>
        {
            member.HasKey(m => new { m.ProjectId, m.UserId });

            // "My projects" reads by user, so the second column of the key gets its own index.
            member.HasIndex(m => m.UserId);

            // Deleting a user removes them from every project.
            member.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureEpicsAndSprints(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Epic>(epic =>
        {
            // Deleting a project deletes its epics, and with them their tickets.
            epic.HasOne<Project>()
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Deleting a user does not delete their epics: they are left without an owner.
            epic.HasOne(e => e.Owner)
                .WithMany()
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.SetNull);

            epic.HasIndex(e => new { e.ProjectId, e.Number }).IsUnique();
            epic.HasIndex(e => e.Code).IsUnique();
        });

        modelBuilder.Entity<Sprint>(sprint =>
        {
            sprint.HasOne<Project>()
                .WithMany()
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            /* One active sprint per project, guaranteed by the database. SprintService checks first
               to give a readable message, but two "Start" clicks at once both pass that check: this
               index is what stops the second. 1 is SprintStatus.Active. */
            sprint.HasIndex(s => s.ProjectId)
                .IsUnique()
                .HasFilter("\"Status\" = 1")
                .HasDatabaseName("IX_Sprints_OneActivePerProject");
        });
    }

    private static void ConfigureTickets(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(ticket =>
        {
            // Table-per-type: Tickets holds the common columns, each subclass its own table whose
            // key is also a foreign key to Tickets.Id (with ON DELETE CASCADE).
            ticket.UseTptMappingStrategy();
            ticket.ToTable("Tickets");

            ticket.HasOne<Project>()
                .WithMany()
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // The epic is optional: deleting it leaves its tickets without one, never deletes them.
            ticket.HasOne(t => t.Epic)
                .WithMany()
                .HasForeignKey(t => t.EpicId)
                .OnDelete(DeleteBehavior.SetNull);

            // Deleting a user leaves their tickets without assignee or reporter.
            ticket.HasOne(t => t.Assignee)
                .WithMany()
                .HasForeignKey(t => t.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);

            ticket.HasOne(t => t.Reporter)
                .WithMany()
                .HasForeignKey(t => t.ReporterId)
                .OnDelete(DeleteBehavior.SetNull);

            // Deleting a sprint sends its tickets back to the backlog.
            ticket.HasOne(t => t.Sprint)
                .WithMany()
                .HasForeignKey(t => t.SprintId)
                .OnDelete(DeleteBehavior.SetNull);

            /* NO ACTION and not RESTRICT or CASCADE. Deleting one ticket takes its descendants with
               it, and TicketService does that explicitly so the rule is visible. But when a project
               goes, the database cascades over parents and children in one statement: NO
               ACTION checks the reference at the end of that statement, when both are gone, while
               RESTRICT would refuse halfway. */
            ticket.HasOne(t => t.Parent)
                .WithMany()
                .HasForeignKey(t => t.ParentId)
                .OnDelete(DeleteBehavior.NoAction);

            // Numbers count per project and per type (R2T-BUG-3 and R2T-UH-3 coexist).
            ticket.HasIndex(t => new { t.ProjectId, t.Type, t.Number }).IsUnique();
            ticket.HasIndex(t => t.Code).IsUnique();
        });

        // Each list is its own jsonb column, an array of { "Text", "Done" } in order. See ChecklistJson
        // for why it is a value converter and not EF's JSON mapping.
        modelBuilder.Entity<UserStory>(story =>
        {
            story.ToTable("UserStories");
            ChecklistColumn(story.Property(s => s.AcceptanceCriteria));
            ChecklistColumn(story.Property(s => s.DefinitionOfReady));
            ChecklistColumn(story.Property(s => s.DefinitionOfDone));
        });

        modelBuilder.Entity<TicketTask>(task =>
        {
            task.ToTable("Tasks");
            ChecklistColumn(task.Property(t => t.Checklist));
        });

        modelBuilder.Entity<Bug>().ToTable("Bugs");

        modelBuilder.Entity<Fix>(fix =>
        {
            fix.ToTable("Fixes");
            ChecklistColumn(fix.Property(f => f.VerificationSteps));
        });
    }

    private static void ChecklistColumn(PropertyBuilder<List<ChecklistItem>> property) =>
        property
            .HasColumnType("jsonb")
            .HasConversion(ChecklistJson.Converter, ChecklistJson.Comparer)
            .IsRequired();

    private static void ConfigureWorkflows(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Workflow>(workflow =>
        {
            workflow.HasIndex(w => w.ProjectId).IsUnique();

            workflow.HasOne<Project>()
                .WithMany()
                .HasForeignKey(w => w.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            workflow.HasMany(w => w.Transitions)
                .WithOne()
                .HasForeignKey(t => t.WorkflowId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkflowTransition>(transition =>
        {
            transition.HasKey(t => new { t.WorkflowId, t.FromStatus, t.ToStatus });

            transition.ToTable("WorkflowTransitions", table => table.HasCheckConstraint(
                "CK_WorkflowTransitions_FromNotTo",
                "\"FromStatus\" <> \"ToStatus\""));
        });
    }
}
