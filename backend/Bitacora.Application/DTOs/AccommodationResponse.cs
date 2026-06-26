namespace Bitacora.Application.DTOs;

public class AccommodationResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string? Observations { get; set; }
    public DateTime CreatedAt { get; set; }
}
