using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class ItineraryItemService : IItineraryItemService
{
    private readonly BitacoraDbContext _context;

    public ItineraryItemService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<ItineraryItemResponse>> GetByTripAsync(int tripId, string userId)
    {
        return await _context.ItineraryItems
            .Where(i => i.TripId == tripId && i.UserId == userId)
            .OrderBy(i => i.DayNumber)
            .ThenBy(i => i.Date)
            .Select(i => ToResponse(i))
            .ToListAsync();
    }

    public async Task<ItineraryItemResponse?> GetByIdAsync(int id, string userId)
    {
        var item = await _context.ItineraryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        return item is null ? null : ToResponse(item);
    }

    public async Task<ItineraryItemResponse> CreateAsync(int tripId, CreateItineraryItemRequest request, string userId)
    {
        await ValidateTripOwnership(tripId, userId);

        var item = new ItineraryItem
        {
            TripId = tripId,
            Date = request.Date,
            DayNumber = request.DayNumber,
            City = request.City,
            Accommodation = request.Accommodation,
            Activities = request.Activities,
            Transport = request.Transport,
            Flight = request.Flight,
            Observations = request.Observations,
            Link = request.Link,
            UserId = userId
        };

        _context.ItineraryItems.Add(item);
        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<ItineraryItemResponse?> UpdateAsync(int id, UpdateItineraryItemRequest request, string userId)
    {
        var item = await _context.ItineraryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (item is null)
            return null;

        item.Date = request.Date;
        item.DayNumber = request.DayNumber;
        item.City = request.City;
        item.Accommodation = request.Accommodation;
        item.Activities = request.Activities;
        item.Transport = request.Transport;
        item.Flight = request.Flight;
        item.Observations = request.Observations;
        item.Link = request.Link;

        await _context.SaveChangesAsync();

        return ToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var item = await _context.ItineraryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (item is null)
            return false;

        _context.ItineraryItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ItineraryItemResponse ToResponse(ItineraryItem item) => new()
    {
        Id = item.Id,
        TripId = item.TripId,
        Date = item.Date,
        DayNumber = item.DayNumber,
        City = item.City,
        Accommodation = item.Accommodation,
        Activities = item.Activities,
        Transport = item.Transport,
        Flight = item.Flight,
        Observations = item.Observations,
        Link = item.Link,
        CreatedAt = item.CreatedAt
    };

    private async Task ValidateTripOwnership(int tripId, string userId)
    {
        var exists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
        if (!exists)
            throw new InvalidOperationException("Viaje no encontrado.");
    }
}
