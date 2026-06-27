using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class CityService : ICityService
{
    private readonly BitacoraDbContext _context;

    public CityService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<CityResponse>> GetByTripAsync(int tripId, string userId)
    {
        var cities = await _context.Cities
            .Where(c => c.TripId == tripId && c.UserId == userId)
            .OrderBy(c => c.Order)
            .ThenBy(c => c.Name)
            .ToListAsync();

        var cityIds = cities.Select(c => c.Id).ToList();

        var places = await _context.PlacesToVisit
            .Where(p => cityIds.Contains(p.CityId) && p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return cities.Select(c => ToResponse(c, places.Where(p => p.CityId == c.Id).ToList())).ToList();
    }

    public async Task<CityResponse?> GetByIdAsync(int id, string userId)
    {
        var city = await _context.Cities
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (city is null)
            return null;

        var places = await _context.PlacesToVisit
            .Where(p => p.CityId == id && p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return ToResponse(city, places);
    }

    public async Task<CityResponse> CreateAsync(int tripId, CreateCityRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);

        var city = new City
        {
            TripId = tripId,
            Name = request.Name,
            Order = request.Order,
            UserId = userId
        };

        _context.Cities.Add(city);
        await _context.SaveChangesAsync();

        return ToResponse(city, new List<PlaceToVisit>());
    }

    public async Task<CityResponse?> UpdateAsync(int id, UpdateCityRequest request, string userId)
    {
        var city = await _context.Cities
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (city is null)
            return null;

        city.Name = request.Name;
        city.Order = request.Order;

        await _context.SaveChangesAsync();

        var places = await _context.PlacesToVisit
            .Where(p => p.CityId == id && p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return ToResponse(city, places);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var city = await _context.Cities
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (city is null)
            return false;

        _context.Cities.Remove(city);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CityResponse ToResponse(City city, List<PlaceToVisit> places) => new()
    {
        Id = city.Id,
        TripId = city.TripId,
        Name = city.Name,
        Order = city.Order,
        CreatedAt = city.CreatedAt,
        Places = places.Select(ToPlaceResponse).ToList()
    };

    private static PlaceToVisitResponse ToPlaceResponse(PlaceToVisit p) => new()
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

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }
}
