using System.ComponentModel.DataAnnotations;

namespace Bitacora.Application.DTOs;

public class CreatePlaceToVisitRequest
{
    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PlaceId { get; set; }

    [MaxLength(1000)]
    public string? MapsLink { get; set; }

    public string? Notes { get; set; }
}
