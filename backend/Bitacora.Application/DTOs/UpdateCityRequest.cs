using System.ComponentModel.DataAnnotations;

namespace Bitacora.Application.DTOs;

public class UpdateCityRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int Order { get; set; } = 0;
}
