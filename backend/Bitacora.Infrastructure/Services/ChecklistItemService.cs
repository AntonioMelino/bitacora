using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class ChecklistItemService : IChecklistItemService
{
    private readonly BitacoraDbContext _context;

    public ChecklistItemService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<ChecklistItemResponse>> GetByTripAsync(int tripId, string userId)
    {
        return await _context.ChecklistItems
            .Where(c => c.TripId == tripId && c.UserId == userId)
            .OrderBy(c => c.Order)
            .Select(c => ToResponse(c))
            .ToListAsync();
    }

    public async Task<ChecklistItemResponse?> GetByIdAsync(int id, string userId)
    {
        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<ChecklistItemResponse> CreateAsync(int tripId, CreateChecklistItemRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);

        var item = new ChecklistItem
        {
            TripId = tripId,
            Item = request.Item,
            Status = false,
            Order = request.Order,
            UserId = userId
        };

        _context.ChecklistItems.Add(item);
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<ChecklistItemResponse?> UpdateAsync(int id, UpdateChecklistItemRequest request, string userId)
    {
        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item is null)
            return null;

        item.Item = request.Item;
        item.Status = request.Status;
        item.Order = request.Order;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<ChecklistItemResponse?> ToggleStatusAsync(int id, string userId)
    {
        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item is null)
            return null;

        item.Status = !item.Status;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item is null)
            return false;

        _context.ChecklistItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ChecklistItemResponse ToResponse(ChecklistItem item) => new()
    {
        Id = item.Id,
        TripId = item.TripId,
        Item = item.Item,
        Status = item.Status,
        Order = item.Order,
        CreatedAt = item.CreatedAt
    };

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }
}
