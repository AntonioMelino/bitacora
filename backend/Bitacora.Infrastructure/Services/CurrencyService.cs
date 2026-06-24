using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class CurrencyService : ICurrencyService
{
    private readonly BitacoraDbContext _context;

    public CurrencyService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<CurrencyResponse>> GetAllAsync(string userId)
    {
        return await _context.Currencies
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Code)
            .Select(c => ToResponse(c))
            .ToListAsync();
    }

    public async Task<CurrencyResponse> GetByIdAsync(int id, string userId)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Moneda no encontrada.");

        return ToResponse(currency);
    }

    public async Task<CurrencyResponse> CreateAsync(CurrencyRequest request, string userId)
    {
        var currency = new Currency
        {
            Code = request.Code,
            Name = request.Name,
            Symbol = request.Symbol,
            UserId = userId
        };

        _context.Currencies.Add(currency);
        await _context.SaveChangesAsync();

        return ToResponse(currency);
    }

    public async Task<CurrencyResponse> UpdateAsync(int id, CurrencyRequest request, string userId)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Moneda no encontrada.");

        currency.Code = request.Code;
        currency.Name = request.Name;
        currency.Symbol = request.Symbol;
        await _context.SaveChangesAsync();

        return ToResponse(currency);
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Moneda no encontrada.");

        _context.Currencies.Remove(currency);
        await _context.SaveChangesAsync();
    }

    private static CurrencyResponse ToResponse(Currency currency) => new()
    {
        Id = currency.Id,
        Code = currency.Code,
        Name = currency.Name,
        Symbol = currency.Symbol
    };
}
