using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class ExpenseService : IExpenseService
{
    private readonly BitacoraDbContext _context;

    public ExpenseService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExpenseResponse>> GetByTripAsync(int tripId, string userId)
    {
        return await BuildResponseQuery(
            _context.Expenses.Where(e => e.TripId == tripId && e.UserId == userId)
        )
        .OrderByDescending(r => r.PaymentDate)
        .ToListAsync();
    }

    public async Task<ExpenseResponse?> GetByIdAsync(int id, string userId)
    {
        return await BuildResponseQuery(
            _context.Expenses.Where(e => e.Id == id && e.UserId == userId)
        )
        .FirstOrDefaultAsync();
    }

    public async Task<ExpenseResponse> CreateAsync(int tripId, CreateExpenseRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);
        await ValidateLookupOwnership(request.CategoryId, request.PaymentMethodId, request.CurrencyId, userId);

        var expense = new Expense
        {
            TripId = tripId,
            CategoryId = request.CategoryId,
            Description = request.Description,
            City = request.City,
            PaymentDate = request.PaymentDate,
            PaymentMethodId = request.PaymentMethodId,
            CurrencyId = request.CurrencyId,
            Amount = request.Amount,
            ExchangeRate = request.ExchangeRate,
            Observations = request.Observations,
            UserId = userId
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return await BuildResponseQuery(
            _context.Expenses.Where(e => e.Id == expense.Id)
        )
        .FirstAsync();
    }

    public async Task<ExpenseResponse?> UpdateAsync(int id, UpdateExpenseRequest request, string userId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense is null)
            return null;

        await ValidateLookupOwnership(request.CategoryId, request.PaymentMethodId, request.CurrencyId, userId);

        expense.CategoryId = request.CategoryId;
        expense.Description = request.Description;
        expense.City = request.City;
        expense.PaymentDate = request.PaymentDate;
        expense.PaymentMethodId = request.PaymentMethodId;
        expense.CurrencyId = request.CurrencyId;
        expense.Amount = request.Amount;
        expense.ExchangeRate = request.ExchangeRate;
        expense.Observations = request.Observations;

        await _context.SaveChangesAsync();

        return await BuildResponseQuery(
            _context.Expenses.Where(e => e.Id == expense.Id)
        )
        .FirstAsync();
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense is null)
            return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    private IQueryable<ExpenseResponse> BuildResponseQuery(IQueryable<Expense> source)
    {
        return from e in source
               join cat in _context.ExpenseCategories on e.CategoryId equals cat.Id
               join pm in _context.PaymentMethods on e.PaymentMethodId equals pm.Id
               join cur in _context.Currencies on e.CurrencyId equals cur.Id
               select new ExpenseResponse
               {
                   Id = e.Id,
                   TripId = e.TripId,
                   CategoryId = e.CategoryId,
                   CategoryName = cat.Name,
                   Description = e.Description,
                   City = e.City,
                   PaymentDate = e.PaymentDate,
                   PaymentMethodId = e.PaymentMethodId,
                   PaymentMethodName = pm.Name,
                   CurrencyId = e.CurrencyId,
                   CurrencyCode = cur.Code,
                   CurrencySymbol = cur.Symbol,
                   Amount = e.Amount,
                   ExchangeRate = e.ExchangeRate,
                   Observations = e.Observations,
                   CreatedAt = e.CreatedAt
               };
    }

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }

    private async Task ValidateLookupOwnership(int categoryId, int paymentMethodId, int currencyId, string userId)
    {
        var categoryExists = await _context.ExpenseCategories
            .AnyAsync(c => c.Id == categoryId && c.UserId == userId);
        if (!categoryExists)
            throw new InvalidOperationException("Categoría no encontrada.");

        var paymentMethodExists = await _context.PaymentMethods
            .AnyAsync(p => p.Id == paymentMethodId && p.UserId == userId);
        if (!paymentMethodExists)
            throw new InvalidOperationException("Método de pago no encontrado.");

        var currencyExists = await _context.Currencies
            .AnyAsync(c => c.Id == currencyId && c.UserId == userId);
        if (!currencyExists)
            throw new InvalidOperationException("Moneda no encontrada.");
    }
}
