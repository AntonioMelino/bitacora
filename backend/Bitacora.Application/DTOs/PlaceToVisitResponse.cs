namespace Bitacora.Application.DTOs;

public class PlaceToVisitResponse
{
    public int Id { get; set; }
    public int CityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PlaceId { get; set; }
    public string? MapsLink { get; set; }
    public string? Notes { get; set; }
    public bool Visited { get; set; }
    public DateTime CreatedAt { get; set; }
}
