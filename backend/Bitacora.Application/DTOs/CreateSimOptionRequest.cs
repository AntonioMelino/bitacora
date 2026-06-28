namespace Bitacora.Application.DTOs;

public class CreateSimOptionRequest
{
    public string Company { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Coverage { get; set; }
    public string? Notes { get; set; }
    public bool Decided { get; set; } = false;
}
