namespace Bitacora.Application.DTOs;

public class CreateChecklistItemRequest
{
    public string Item { get; set; } = string.Empty;
    public int Order { get; set; }
}
