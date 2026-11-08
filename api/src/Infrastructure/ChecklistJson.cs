using System.Text.Json;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infrastructure;

/* How a list of ChecklistItem goes into its jsonb column and back: plain JSON serialization through a
   value converter, giving [{ "Text": "…", "Done": true }, …] in order.

   Why not EF's own JSON mapping: in EF Core 10.0, ComplexCollection(...).ToJson() throws on insert
   when the list lives on a TPT subclass, and OwnsMany(...).ToJson() is refused outright ("Only TPH
   inheritance is supported"). A converter has neither problem. What it costs: EF cannot look inside
   the array in a query, so the checklist counts of the ticket list are computed after reading (see
   TicketRepository.GetSummariesAsync). Revisit if EF lifts those limits. */
internal static class ChecklistJson
{
    private static readonly JsonSerializerOptions Options = new();

    public static readonly ValueConverter<List<ChecklistItem>, string> Converter = new(
        items => JsonSerializer.Serialize(items, Options),
        json => JsonSerializer.Deserialize<List<ChecklistItem>>(json, Options) ?? new List<ChecklistItem>());

    /* Lists are compared by content, not by reference: without this, ticking an item inside the same
       List instance would go unnoticed and never be saved. The snapshot is a deep copy for the same
       reason. */
    public static readonly ValueComparer<List<ChecklistItem>> Comparer = new(
        (left, right) => JsonSerializer.Serialize(left, Options) == JsonSerializer.Serialize(right, Options),
        items => JsonSerializer.Serialize(items, Options).GetHashCode(),
        items => items.Select(item => new ChecklistItem { Text = item.Text, Done = item.Done }).ToList());
}
