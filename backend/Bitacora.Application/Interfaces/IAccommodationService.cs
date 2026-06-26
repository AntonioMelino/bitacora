using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IAccommodationService
{
    Task<List<AccommodationResponse>> GetByTripAsync(int tripId, string userId);
    Task<AccommodationResponse?> GetByIdAsync(int id, string userId);
    Task<AccommodationResponse> CreateAsync(int tripId, CreateAccommodationRequest request, string userId);
    Task<AccommodationResponse?> UpdateAsync(int id, UpdateAccommodationRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
