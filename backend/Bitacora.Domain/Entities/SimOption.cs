namespace Bitacora.Domain.Entities;

public class SimOption
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Coverage { get; set; }
    public string? Notes { get; set; }
    public bool Decided { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
}
