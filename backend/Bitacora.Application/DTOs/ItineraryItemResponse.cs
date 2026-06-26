namespace Bitacora.Application.DTOs;

public class ItineraryItemResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public DateTime Date { get; set; }
    public int DayNumber { get; set; }
    public string City { get; set; } = string.Empty;
    public string? Accommodation { get; set; }
    public string? Activities { get; set; }
    public string? Transport { get; set; }
    public string? Flight { get; set; }
    public string? Observations { get; set; }
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
}
