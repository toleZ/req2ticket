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

        // Restrict and not Cascade, even though a subtask really cannot outlive its parent:
        // SQLite would accept a self-referencing cascade, but SQL Server rejects one
        // outright, and the swap to SQL Server is still on the table (see Program.cs).
        // TicketService.DeleteAsync removes the children first, which behaves the same and
        // works on either provider.
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Parent)
            .WithMany()
            .HasForeignKey(t => t.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // SQLite has no json or jsonb type, so this lands in TEXT either way. Saying it out
        // loud keeps the intent readable, and keeps the column from silently becoming
        // something else if the provider changes.
        modelBuilder.Entity<Ticket>()
            .Property(t => t.ExtraFields)
            .HasColumnType("TEXT");

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.Code)
            .IsUnique();

        // NOCASE so logging in does not depend on how the email was typed. SQLite compares
        // strings case-sensitively by default, and the unique index inherits the collation,
        // so two users cannot differ only in capitalization either.
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .UseCollation("NOCASE");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        SeedData.Apply(modelBuilder);
    }
}
