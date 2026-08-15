using Bitacora.Domain.Entities;

namespace Bitacora.Infrastructure.Tests.Common;

/// <summary>
/// Builders for the entities ExpenseService/ExcelExportService validate ownership
/// against. Every entity requires a UserId, so tests can build both the "owner"
/// and "another user" side of an ownership check with minimal boilerplate.
/// </summary>
public static class TestData
{
    public const string OwnerUserId = "owner-user-id";
    public const string OtherUserId = "other-user-id";

    public static Trip Trip(string userId = OwnerUserId, bool isInternational = false, decimal? budget = null)
        => new()
        {
            Name = "Test Trip",
            Description = "Trip used for testing",
            StartDate = new DateTime(2026, 1, 1),
            EndDate = new DateTime(2026, 1, 10),
            IsInternational = isInternational,
            Budget = budget,
            UserId = userId
        };

    public static ExpenseCategory ExpenseCategory(string userId = OwnerUserId, string name = "Comida")
        => new() { Name = name, UserId = userId };

    public static PaymentMethod PaymentMethod(string userId = OwnerUserId, string name = "Efectivo")
        => new() { Name = name, UserId = userId };

    public static Currency Currency(string userId = OwnerUserId, string code = "USD", string symbol = "$")
        => new() { Code = code, Name = "Dollar", Symbol = symbol, UserId = userId };

    public static Expense Expense(
        int tripId,
        int categoryId,
        int paymentMethodId,
        int currencyId,
        string userId = OwnerUserId,
        string description = "Test expense",
        decimal amount = 100m,
        DateTime? paymentDate = null)
        => new()
        {
            TripId = tripId,
            CategoryId = categoryId,
            Description = description,
            City = "Buenos Aires",
            PaymentDate = paymentDate ?? new DateTime(2026, 1, 5),
            PaymentMethodId = paymentMethodId,
            CurrencyId = currencyId,
            Amount = amount,
            UserId = userId
        };

    public static SimOption SimOption(int tripId, string userId = OwnerUserId, bool decided = false)
        => new()
        {
            TripId = tripId,
            Company = "Test Carrier",
            Type = "eSIM",
            Coverage = "Europe",
            Decided = decided,
            UserId = userId
        };
}
