using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class ExpenseCategoryService : IExpenseCategoryService
{
    private readonly BitacoraDbContext _context;

    public ExpenseCategoryService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<LookupResponse>> GetAllAsync(string userId)
    {
        return await _context.ExpenseCategories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => ToResponse(c))
            .ToListAsync();
    }

    public async Task<LookupResponse> GetByIdAsync(int id, string userId)
    {
        var category = await _context.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Categoría no encontrada.");

        return ToResponse(category);
    }

    public async Task<LookupResponse> CreateAsync(LookupRequest request, string userId)
    {
        var category = new ExpenseCategory
        {
            Name = request.Name,
            UserId = userId
        };

        _context.ExpenseCategories.Add(category);
        await _context.SaveChangesAsync();

        return ToResponse(category);
    }

    public async Task<LookupResponse> UpdateAsync(int id, LookupRequest request, string userId)
    {
        var category = await _context.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Categoría no encontrada.");

        category.Name = request.Name;
        await _context.SaveChangesAsync();

        return ToResponse(category);
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var category = await _context.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId)
            ?? throw new InvalidOperationException("Categoría no encontrada.");

        _context.ExpenseCategories.Remove(category);
        await _context.SaveChangesAsync();
    }

    private static LookupResponse ToResponse(ExpenseCategory category) => new()
    {
        Id = category.Id,
        Name = category.Name
    };
}
