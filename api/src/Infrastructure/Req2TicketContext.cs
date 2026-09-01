using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure;

public class Req2TicketContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<Epic> Epics { get; set; }

    public DbSet<Ticket> Tickets { get; set; }

    public DbSet<Sprint> Sprints { get; set; }

    public Req2TicketContext(DbContextOptions<Req2TicketContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Deleting a user does not delete their epics: they are left without an owner.
        modelBuilder.Entity<Epic>()
            .HasOne(e => e.Owner)
            .WithMany()
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Epic>()
            .HasIndex(e => e.Code)
            .IsUnique();

        // A ticket cannot outlive its epic: deleting the epic deletes its tickets.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Epic)
            .WithMany()
            .HasForeignKey(t => t.EpicId)
            .OnDelete(DeleteBehavior.Cascade);

        // Deleting a user does not delete the tickets assigned to them: they are left
        // without an assignee, same rule as Epic.OwnerId.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Assignee)
            .WithMany()
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Same rule again for whoever raised the ticket. Two foreign keys from Ticket to
        // User is fine as long as neither declares a navigation back on User, which is why
        // both are configured with WithMany() and no argument.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Reporter)
            .WithMany()
            .HasForeignKey(t => t.ReporterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Deleting a sprint does not delete its tickets: they go back to the backlog,
        // same rule as Epic.OwnerId and Ticket.AssigneeId. A ticket outlives the sprint it
        // was planned into.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Sprint)
            .WithMany()
            .HasForeignKey(t => t.SprintId)
            .OnDelete(DeleteBehavior.SetNull);

        // Restrict and not Cascade, even though a subtask cannot outlive its parent:
        // TicketService.DeleteAsync already removes the children, and a cascade here would be a
        // second, invisible copy of that rule.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Parent)
            .WithMany()
            .HasForeignKey(t => t.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // text and not jsonb: jsonb reorders the keys, and TicketExtrasValidator emits them in
        // schema order on purpose so two tickets of a type read the same way. What guarantees the
        // text is valid for its type is the validator, not the database.
        modelBuilder.Entity<Ticket>()
            .Property(t => t.ExtraFields)
            .HasColumnType("text");

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.Code)
            .IsUnique();

        // Plain case-sensitive index. Case-insensitivity used to be SQLite's NOCASE collation
        // here; PostgreSQL could do it with citext or an ICU collation, but the rule lives in the
        // services now — they lowercase the email on every write and every lookup. Skip that in a
        // new write path and two users can differ by capitalization again.
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        SeedData.Apply(modelBuilder);
    }
}
