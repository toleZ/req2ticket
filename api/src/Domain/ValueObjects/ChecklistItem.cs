namespace Domain.ValueObjects;

/* One line of a list on a ticket: acceptance criteria, definition of ready or done, a task's
   checklist, a fix's verification steps. A value, not an entity: no Id, no table, no DbSet.
   It lives inside a jsonb column of the ticket it belongs to, and the order of the list is the
   order of the array.

   That was a choice over a ChecklistItems table: nothing ever needs to query or point at a
   single item, and editing a list is "replace the whole array" — no Position column, no
   delete-and-reinsert on every save. */
public class ChecklistItem
{
    public const int MaxItemsPerList = 30;

    public const int MaxTextLength = 300;

    public string Text { get; set; } = string.Empty;

    public bool Done { get; set; }
}
