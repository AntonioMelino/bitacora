namespace Bitacora.Domain.Entities;

public class ChecklistItem
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Item { get; set; } = string.Empty;
    public bool Status { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
}
