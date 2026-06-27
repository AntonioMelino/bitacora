using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface ICityService
{
    Task<List<CityResponse>> GetByTripAsync(int tripId, string userId);
    Task<CityResponse?> GetByIdAsync(int id, string userId);
    Task<CityResponse> CreateAsync(int tripId, CreateCityRequest request, string userId);
    Task<CityResponse?> UpdateAsync(int id, UpdateCityRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
