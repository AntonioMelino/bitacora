using Bitacora.Application.DTOs;
using Bitacora.Infrastructure.Services;
using Bitacora.Infrastructure.Tests.Common;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Tests.Services;

public class ExpenseServiceTests
{
    private static (ExpenseService Service, TestDbContextFactory Factory) CreateService()
    {
        var factory = new TestDbContextFactory();
        return (new ExpenseService(factory.Context), factory);
    }

    [Fact]
    public async Task GetByTripAsync_ReturnsOnlyExpensesForTripAndUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var matchingExpense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        var otherTripExpense = TestData.Expense(trip.Id + 999, category.Id, paymentMethod.Id, currency.Id);
        context.AddRange(matchingExpense, otherTripExpense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        var single = Assert.Single(result);
        Assert.Equal(matchingExpense.Id, single.Id);
    }

    [Fact]
    public async Task GetByTripAsync_DoesNotReturnExpensesOfAnotherUser_EvenWhenTripIdMatches()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var otherUserExpense = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id, userId: TestData.OtherUserId);
        context.Add(otherUserExpense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByTripAsync_OrdersByPaymentDateDescending()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var older = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id,
            description: "Older", paymentDate: new DateTime(2026, 1, 1));
        var newer = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id,
            description: "Newer", paymentDate: new DateTime(2026, 1, 9));
        context.AddRange(older, newer);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        Assert.Equal(new[] { "Newer", "Older" }, result.Select(r => r.Description));
    }

    [Fact]
    public async Task GetByTripAsync_ReturnsEmptyList_WhenTripHasNoExpenses()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;

        // Act
        var result = await service.GetByTripAsync(1, TestData.OwnerUserId);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByTripAsync_DenormalizesLookupNamesIntoResponse()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory(name: "Transporte");
        var paymentMethod = TestData.PaymentMethod(name: "Tarjeta");
        var currency = TestData.Currency(code: "EUR", symbol: "€");
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        var response = Assert.Single(result);
        Assert.Equal("Transporte", response.CategoryName);
        Assert.Equal("Tarjeta", response.PaymentMethodName);
        Assert.Equal("EUR", response.CurrencyCode);
        Assert.Equal("€", response.CurrencySymbol);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsExpense_WhenOwnedByUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByIdAsync(expense.Id, TestData.OwnerUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expense.Id, result!.Id);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenExpenseBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip(userId: TestData.OtherUserId);
        var category = TestData.ExpenseCategory(userId: TestData.OtherUserId);
        var paymentMethod = TestData.PaymentMethod(userId: TestData.OtherUserId);
        var currency = TestData.Currency(userId: TestData.OtherUserId);
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id, userId: TestData.OtherUserId);
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetByIdAsync(expense.Id, TestData.OwnerUserId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenIdDoesNotExist()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;

        // Act
        var result = await service.GetByIdAsync(999, TestData.OwnerUserId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_PersistsAndReturnsEnrichedResponse()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var request = new CreateExpenseRequest
        {
            CategoryId = category.Id,
            Description = "Almuerzo",
            City = "Roma",
            PaymentDate = new DateTime(2026, 1, 3),
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 42.50m,
            ExchangeRate = null,
            Observations = null
        };

        // Act
        var result = await service.CreateAsync(trip.Id, request, TestData.OwnerUserId);

        // Assert
        Assert.Equal("Almuerzo", result.Description);
        Assert.Equal("Comida", result.CategoryName);
        Assert.Null(result.ExchangeRate);
        Assert.Null(result.Observations);
        var persisted = await context.Expenses.FirstOrDefaultAsync(e => e.Id == result.Id);
        Assert.NotNull(persisted);
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenTripBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip(userId: TestData.OtherUserId);
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var request = new CreateExpenseRequest
        {
            CategoryId = category.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 10m,
            PaymentDate = DateTime.Today
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(trip.Id, request, TestData.OwnerUserId));
        Assert.Equal("Viaje no encontrado.", ex.Message);
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenCategoryBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory(userId: TestData.OtherUserId);
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var request = new CreateExpenseRequest
        {
            CategoryId = category.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 10m,
            PaymentDate = DateTime.Today
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(trip.Id, request, TestData.OwnerUserId));
        Assert.Equal("Categoría no encontrada.", ex.Message);
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenPaymentMethodBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod(userId: TestData.OtherUserId);
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var request = new CreateExpenseRequest
        {
            CategoryId = category.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 10m,
            PaymentDate = DateTime.Today
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(trip.Id, request, TestData.OwnerUserId));
        Assert.Equal("Método de pago no encontrado.", ex.Message);
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenCurrencyBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency(userId: TestData.OtherUserId);
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var request = new CreateExpenseRequest
        {
            CategoryId = category.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 10m,
            PaymentDate = DateTime.Today
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(trip.Id, request, TestData.OwnerUserId));
        Assert.Equal("Moneda no encontrada.", ex.Message);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFields_WhenOwnedByUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id, amount: 10m);
        context.Add(expense);
        await context.SaveChangesAsync();

        var request = new UpdateExpenseRequest
        {
            CategoryId = category.Id,
            Description = "Actualizado",
            City = "Madrid",
            PaymentDate = new DateTime(2026, 1, 6),
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 999m
        };

        // Act
        var result = await service.UpdateAsync(expense.Id, request, TestData.OwnerUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Actualizado", result!.Description);
        Assert.Equal(999m, result.Amount);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenExpenseBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip(userId: TestData.OtherUserId);
        var category = TestData.ExpenseCategory(userId: TestData.OtherUserId);
        var paymentMethod = TestData.PaymentMethod(userId: TestData.OtherUserId);
        var currency = TestData.Currency(userId: TestData.OtherUserId);
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id, userId: TestData.OtherUserId);
        context.Add(expense);
        await context.SaveChangesAsync();

        var request = new UpdateExpenseRequest
        {
            CategoryId = category.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 1m,
            PaymentDate = DateTime.Today
        };

        // Act
        var result = await service.UpdateAsync(expense.Id, request, TestData.OwnerUserId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_ValidatesLookupsAgainstRequestingUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        var otherUsersCategory = TestData.ExpenseCategory(userId: TestData.OtherUserId);
        context.AddRange(trip, category, paymentMethod, currency, otherUsersCategory);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        context.Add(expense);
        await context.SaveChangesAsync();

        var request = new UpdateExpenseRequest
        {
            CategoryId = otherUsersCategory.Id,
            PaymentMethodId = paymentMethod.Id,
            CurrencyId = currency.Id,
            Amount = 1m,
            PaymentDate = DateTime.Today
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateAsync(expense.Id, request, TestData.OwnerUserId));
        Assert.Equal("Categoría no encontrada.", ex.Message);
    }

    [Fact]
    public async Task DeleteAsync_RemovesExpense_WhenOwnedByUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteAsync(expense.Id, TestData.OwnerUserId);

        // Assert
        Assert.True(result);
        Assert.False(await context.Expenses.AnyAsync(e => e.Id == expense.Id));
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalseAndKeepsExpense_WhenBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var _ = factory;
        var context = factory.Context;

        var trip = TestData.Trip(userId: TestData.OtherUserId);
        var category = TestData.ExpenseCategory(userId: TestData.OtherUserId);
        var paymentMethod = TestData.PaymentMethod(userId: TestData.OtherUserId);
        var currency = TestData.Currency(userId: TestData.OtherUserId);
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id, userId: TestData.OtherUserId);
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteAsync(expense.Id, TestData.OwnerUserId);

        // Assert
        Assert.False(result);
        Assert.True(await context.Expenses.AnyAsync(e => e.Id == expense.Id));
    }
}
