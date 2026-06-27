namespace Bitacora.Application.DTOs;

public class CityResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PlaceToVisitResponse> Places { get; set; } = new();
}
