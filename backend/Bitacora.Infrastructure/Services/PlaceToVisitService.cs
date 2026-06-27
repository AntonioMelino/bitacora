using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class PlaceToVisitService : IPlaceToVisitService
{
    private readonly BitacoraDbContext _context;

    public PlaceToVisitService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<PlaceToVisitResponse>> GetByCityAsync(int cityId, string userId)
    {
        return await _context.PlacesToVisit
            .Where(p => p.CityId == cityId && p.UserId == userId)
            .OrderBy(p => p.Name)
            .Select(p => ToResponse(p))
            .ToListAsync();
    }

    public async Task<PlaceToVisitResponse?> GetByIdAsync(int id, string userId)
    {
        var item = await _context.PlacesToVisit
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<PlaceToVisitResponse> CreateAsync(int cityId, CreatePlaceToVisitRequest request, string userId)
    {
        await ValidateCityOwnership(cityId, userId);

        var item = new PlaceToVisit
        {
            CityId = cityId,
            Name = request.Name,
            PlaceId = request.PlaceId,
            MapsLink = request.MapsLink,
            Notes = request.Notes,
            UserId = userId
        };

        _context.PlacesToVisit.Add(item);
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<PlaceToVisitResponse?> UpdateAsync(int id, UpdatePlaceToVisitRequest request, string userId)
    {
        var item = await _context.PlacesToVisit
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (item is null)
            return null;

        item.Name = request.Name;
        item.PlaceId = request.PlaceId;
        item.MapsLink = request.MapsLink;
        item.Notes = request.Notes;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<PlaceToVisitResponse?> ToggleVisitedAsync(int id, string userId)
    {
        var item = await _context.PlacesToVisit
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (item is null)
            return null;

        item.Visited = !item.Visited;
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var item = await _context.PlacesToVisit
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (item is null)
            return false;

        _context.PlacesToVisit.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PlaceToVisitResponse ToResponse(PlaceToVisit p) => new()
    {
        Id = p.Id,
        CityId = p.CityId,
        Name = p.Name,
        PlaceId = p.PlaceId,
        MapsLink = p.MapsLink,
        Notes = p.Notes,
        Visited = p.Visited,
        CreatedAt = p.CreatedAt
    };

    private async Task ValidateCityOwnership(int cityId, string userId)
    {
        var exists = await _context.Cities.AnyAsync(c => c.Id == cityId && c.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Ciudad no encontrada.");
    }
}
