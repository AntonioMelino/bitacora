namespace Bitacora.Application.DTOs;

public class UpdateAccommodationRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string? Observations { get; set; }
}
