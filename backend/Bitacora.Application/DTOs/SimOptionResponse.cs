namespace Bitacora.Application.DTOs;

public class SimOptionResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Coverage { get; set; }
    public string? Notes { get; set; }
    public bool Decided { get; set; }
    public DateTime CreatedAt { get; set; }
}
