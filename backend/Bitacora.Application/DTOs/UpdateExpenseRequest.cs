namespace Bitacora.Application.DTOs;

public class UpdateExpenseRequest
{
    public int CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public int PaymentMethodId { get; set; }
    public int CurrencyId { get; set; }
    public decimal Amount { get; set; }
    public decimal? ExchangeRate { get; set; }
    public string? Observations { get; set; }
}
