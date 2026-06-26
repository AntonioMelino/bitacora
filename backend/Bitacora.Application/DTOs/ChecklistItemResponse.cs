namespace Bitacora.Application.DTOs;

public class ChecklistItemResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Item { get; set; } = string.Empty;
    public bool Status { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
}
