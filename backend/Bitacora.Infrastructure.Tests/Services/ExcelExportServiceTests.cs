using Bitacora.Infrastructure.Services;
using Bitacora.Infrastructure.Tests.Common;
using ClosedXML.Excel;

namespace Bitacora.Infrastructure.Tests.Services;

public class ExcelExportServiceTests
{
    private static (ExcelExportService Service, TestDbContextFactory Factory) CreateService()
    {
        var factory = new TestDbContextFactory();
        return (new ExcelExportService(factory.Context), factory);
    }

    private static XLWorkbook OpenWorkbook(byte[] bytes)
        => new(new MemoryStream(bytes));

    [Fact]
    public async Task ExportExpensesAsync_WritesHeaderRowAndOneRowPerExpense()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory(name: "Comida");
        var paymentMethod = TestData.PaymentMethod(name: "Efectivo");
        var currency = TestData.Currency(code: "USD");
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(
            trip.Id, category.Id, paymentMethod.Id, currency.Id,
            description: "Cena", amount: 55m, paymentDate: new DateTime(2026, 3, 15));
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportExpensesAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        var sheet = workbook.Worksheet("Gastos");
        Assert.Equal("Fecha", sheet.Cell(1, 1).GetString());
        Assert.Equal("2026-03-15", sheet.Cell(2, 1).GetString());
        Assert.Equal("Cena", sheet.Cell(2, 2).GetString());
        Assert.Equal("Comida", sheet.Cell(2, 3).GetString());
        Assert.Equal("USD", sheet.Cell(2, 6).GetString());
        Assert.Equal("Efectivo", sheet.Cell(2, 8).GetString());
    }

    [Fact]
    public async Task ExportExpensesAsync_LeavesExchangeRateCellEmpty_WhenNull()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        var category = TestData.ExpenseCategory();
        var paymentMethod = TestData.PaymentMethod();
        var currency = TestData.Currency();
        context.AddRange(trip, category, paymentMethod, currency);
        await context.SaveChangesAsync();

        var expense = TestData.Expense(trip.Id, category.Id, paymentMethod.Id, currency.Id);
        expense.ExchangeRate = null;
        context.Add(expense);
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportExpensesAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        var sheet = workbook.Worksheet("Gastos");
        Assert.True(sheet.Cell(2, 7).IsEmpty());
    }

    [Fact]
    public async Task ExportExpensesAsync_ExcludesExpensesOfAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
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
        var bytes = await service.ExportExpensesAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        var sheet = workbook.Worksheet("Gastos");
        Assert.True(sheet.Cell(2, 1).IsEmpty());
    }

    [Fact]
    public async Task ExportExpensesAsync_WritesOnlyHeaders_WhenNoExpenses()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        context.Add(trip);
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportExpensesAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        var sheet = workbook.Worksheet("Gastos");
        Assert.Equal("Fecha", sheet.Cell(1, 1).GetString());
        Assert.True(sheet.Cell(2, 1).IsEmpty());
    }

    [Fact]
    public async Task ExportTripAsync_Throws_WhenTripBelongsToAnotherUser()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip(userId: TestData.OtherUserId);
        context.Add(trip);
        await context.SaveChangesAsync();

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.ExportTripAsync(trip.Id, TestData.OwnerUserId));
        Assert.Equal("Viaje no encontrado.", ex.Message);
    }

    [Fact]
    public async Task ExportTripAsync_OmitsSimSheet_WhenTripIsDomestic_EvenWithSimOptions()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip(isInternational: false);
        context.Add(trip);
        await context.SaveChangesAsync();

        context.Add(TestData.SimOption(trip.Id));
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        Assert.False(workbook.Worksheets.TryGetWorksheet("SIM y eSIM", out _));
    }

    [Fact]
    public async Task ExportTripAsync_OmitsSimSheet_WhenInternationalWithNoSimOptions()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip(isInternational: true);
        context.Add(trip);
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        Assert.False(workbook.Worksheets.TryGetWorksheet("SIM y eSIM", out _));
    }

    [Fact]
    public async Task ExportTripAsync_IncludesSimSheet_WhenInternationalWithSimOptions()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip(isInternational: true);
        context.Add(trip);
        await context.SaveChangesAsync();

        context.Add(TestData.SimOption(trip.Id));
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        Assert.True(workbook.Worksheets.TryGetWorksheet("SIM y eSIM", out var simSheet));
        Assert.Equal("Test Carrier", simSheet!.Cell(2, 1).GetString());
    }

    [Fact]
    public async Task ExportTripAsync_IncludesAllCoreSheets()
    {
        // Arrange
        var (service, factory) = CreateService();
        using var disposableFactory = factory;
        var context = factory.Context;

        var trip = TestData.Trip();
        context.Add(trip);
        await context.SaveChangesAsync();

        // Act
        var bytes = await service.ExportTripAsync(trip.Id, TestData.OwnerUserId);

        // Assert
        using var workbook = OpenWorkbook(bytes);
        Assert.True(workbook.Worksheets.TryGetWorksheet("Gastos", out _));
        Assert.True(workbook.Worksheets.TryGetWorksheet("Itinerario", out _));
        Assert.True(workbook.Worksheets.TryGetWorksheet("Checklist", out _));
        Assert.True(workbook.Worksheets.TryGetWorksheet("Alojamientos", out _));
        Assert.True(workbook.Worksheets.TryGetWorksheet("Ciudades y Lugares", out _));
    }
}
