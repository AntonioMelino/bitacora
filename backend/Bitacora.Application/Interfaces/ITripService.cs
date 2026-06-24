using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface ITripService
{
    Task<List<TripResponse>> GetAllAsync(string userId);
    Task<TripResponse> GetByIdAsync(int id, string userId);
    Task<TripResponse> CreateAsync(CreateTripRequest request, string userId);
    Task<TripResponse> UpdateAsync(int id, UpdateTripRequest request, string userId);
    Task DeleteAsync(int id, string userId);
}
