using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IPlaceToVisitService
{
    Task<List<PlaceToVisitResponse>> GetByCityAsync(int cityId, string userId);
    Task<PlaceToVisitResponse?> GetByIdAsync(int id, string userId);
    Task<PlaceToVisitResponse> CreateAsync(int cityId, CreatePlaceToVisitRequest request, string userId);
    Task<PlaceToVisitResponse?> UpdateAsync(int id, UpdatePlaceToVisitRequest request, string userId);
    Task<PlaceToVisitResponse?> ToggleVisitedAsync(int id, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
