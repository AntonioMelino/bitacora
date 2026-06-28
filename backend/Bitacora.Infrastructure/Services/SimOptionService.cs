using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class SimOptionService : ISimOptionService
{
    private readonly BitacoraDbContext _context;

    public SimOptionService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<SimOptionResponse>> GetByTripAsync(int tripId, string userId)
    {
        return await _context.SimOptions
            .Where(s => s.TripId == tripId && s.UserId == userId)
            .OrderBy(s => s.Company)
            .Select(s => ToResponse(s))
            .ToListAsync();
    }

    public async Task<SimOptionResponse?> GetByIdAsync(int id, string userId)
    {
        var item = await _context.SimOptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<SimOptionResponse> CreateAsync(int tripId, CreateSimOptionRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);

        var item = new SimOption
        {
            TripId = tripId,
            Company = request.Company,
            Type = request.Type,
            Coverage = request.Coverage,
            Notes = request.Notes,
            Decided = request.Decided,
            UserId = userId
        };

        _context.SimOptions.Add(item);
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<SimOptionResponse?> UpdateAsync(int id, UpdateSimOptionRequest request, string userId)
    {
        var item = await _context.SimOptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (item is null)
            return null;

        item.Company = request.Company;
        item.Type = request.Type;
        item.Coverage = request.Coverage;
        item.Notes = request.Notes;
        item.Decided = request.Decided;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<SimOptionResponse?> ToggleDecidedAsync(int id, string userId)
    {
        var item = await _context.SimOptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (item is null)
            return null;

        item.Decided = !item.Decided;
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var item = await _context.SimOptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (item is null)
            return false;

        _context.SimOptions.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static SimOptionResponse ToResponse(SimOption item) => new()
    {
        Id = item.Id,
        TripId = item.TripId,
        Company = item.Company,
        Type = item.Type,
        Coverage = item.Coverage,
        Notes = item.Notes,
        Decided = item.Decided,
        CreatedAt = item.CreatedAt
    };

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }
}
