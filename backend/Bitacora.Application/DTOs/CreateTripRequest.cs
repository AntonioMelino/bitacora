namespace Bitacora.Application.DTOs;

public class CreateTripRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsInternational { get; set; }
}
