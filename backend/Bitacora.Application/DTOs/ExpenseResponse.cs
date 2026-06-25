namespace Bitacora.Application.DTOs;

public class ExpenseResponse
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public int PaymentMethodId { get; set; }
    public string PaymentMethodName { get; set; } = string.Empty;
    public int CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencySymbol { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal? ExchangeRate { get; set; }
    public string? Observations { get; set; }
    public DateTime CreatedAt { get; set; }
}
