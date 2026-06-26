namespace Bitacora.Application.DTOs;

public class UpdateChecklistItemRequest
{
    public string Item { get; set; } = string.Empty;
    public bool Status { get; set; }
    public int Order { get; set; }
}
