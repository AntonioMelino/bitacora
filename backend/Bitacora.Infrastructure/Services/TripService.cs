using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class TripService : ITripService
{
    private readonly BitacoraDbContext _context;

    public TripService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<TripResponse>> GetAllAsync(string userId)
    {
        return await _context.Trips
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.StartDate)
            .Select(t => ToResponse(t))
            .ToListAsync();
    }

    public async Task<TripResponse> GetByIdAsync(int id, string userId)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId)
            ?? throw new InvalidOperationException("Viaje no encontrado.");

        return ToResponse(trip);
    }

    public async Task<TripResponse> CreateAsync(CreateTripRequest request, string userId)
    {
        var trip = new Trip
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsInternational = request.IsInternational,
            UserId = userId
        };

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync();

        return ToResponse(trip);
    }

    public async Task<TripResponse> UpdateAsync(int id, UpdateTripRequest request, string userId)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId)
            ?? throw new InvalidOperationException("Viaje no encontrado.");

        trip.Name = request.Name;
        trip.Description = request.Description;
        trip.StartDate = request.StartDate;
        trip.EndDate = request.EndDate;
        trip.IsInternational = request.IsInternational;

        await _context.SaveChangesAsync();

        return ToResponse(trip);
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId)
            ?? throw new InvalidOperationException("Viaje no encontrado.");

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync();
    }

    private static TripResponse ToResponse(Trip trip) => new()
    {
        Id = trip.Id,
        Name = trip.Name,
        Description = trip.Description,
        StartDate = trip.StartDate,
        EndDate = trip.EndDate,
        IsInternational = trip.IsInternational,
        CreatedAt = trip.CreatedAt
    };
}
