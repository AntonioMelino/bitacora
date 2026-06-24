using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class PaymentMethodService : IPaymentMethodService
{
    private readonly BitacoraDbContext _context;

    public PaymentMethodService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<LookupResponse>> GetAllAsync(string userId)
    {
        return await _context.PaymentMethods
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Name)
            .Select(p => ToResponse(p))
            .ToListAsync();
    }

    public async Task<LookupResponse> GetByIdAsync(int id, string userId)
    {
        var method = await _context.PaymentMethods
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId)
            ?? throw new InvalidOperationException("Método de pago no encontrado.");

        return ToResponse(method);
    }

    public async Task<LookupResponse> CreateAsync(LookupRequest request, string userId)
    {
        var method = new PaymentMethod
        {
            Name = request.Name,
            UserId = userId
        };

        _context.PaymentMethods.Add(method);
        await _context.SaveChangesAsync();

        return ToResponse(method);
    }

    public async Task<LookupResponse> UpdateAsync(int id, LookupRequest request, string userId)
    {
        var method = await _context.PaymentMethods
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId)
            ?? throw new InvalidOperationException("Método de pago no encontrado.");

        method.Name = request.Name;
        await _context.SaveChangesAsync();

        return ToResponse(method);
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var method = await _context.PaymentMethods
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId)
            ?? throw new InvalidOperationException("Método de pago no encontrado.");

        _context.PaymentMethods.Remove(method);
        await _context.SaveChangesAsync();
    }

    private static LookupResponse ToResponse(PaymentMethod method) => new()
    {
        Id = method.Id,
        Name = method.Name
    };
}
