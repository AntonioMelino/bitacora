using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class AccommodationService : IAccommodationService
{
    private readonly BitacoraDbContext _context;

    public AccommodationService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccommodationResponse>> GetByTripAsync(int tripId, string userId)
    {
        return await _context.Accommodations
            .Where(a => a.TripId == tripId && a.UserId == userId)
            .OrderBy(a => a.CheckIn)
            .Select(a => ToResponse(a))
            .ToListAsync();
    }

    public async Task<AccommodationResponse?> GetByIdAsync(int id, string userId)
    {
        var item = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<AccommodationResponse> CreateAsync(int tripId, CreateAccommodationRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);

        var item = new Accommodation
        {
            TripId = tripId,
            Name = request.Name,
            Address = request.Address,
            City = request.City,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Observations = request.Observations,
            UserId = userId
        };

        _context.Accommodations.Add(item);
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<AccommodationResponse?> UpdateAsync(int id, UpdateAccommodationRequest request, string userId)
    {
        var item = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (item is null)
            return null;

        item.Name = request.Name;
        item.Address = request.Address;
        item.City = request.City;
        item.CheckIn = request.CheckIn;
        item.CheckOut = request.CheckOut;
        item.Observations = request.Observations;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var item = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (item is null)
            return false;

        _context.Accommodations.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static AccommodationResponse ToResponse(Accommodation item) => new()
    {
        Id = item.Id,
        TripId = item.TripId,
        Name = item.Name,
        Address = item.Address,
        City = item.City,
        CheckIn = item.CheckIn,
        CheckOut = item.CheckOut,
        Observations = item.Observations,
        CreatedAt = item.CreatedAt
    };

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }
}
