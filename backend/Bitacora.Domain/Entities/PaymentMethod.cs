namespace Bitacora.Domain.Entities;

public class PaymentMethod
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}
