namespace Bitacora.Domain.Entities;

public class PlaceToVisit
{
    public int Id { get; set; }
    public int CityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PlaceId { get; set; }
    public string? MapsLink { get; set; }
    public string? Notes { get; set; }
    public bool Visited { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
}
