using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IItineraryItemService
{
    Task<List<ItineraryItemResponse>> GetByTripAsync(int tripId, string userId);
    Task<ItineraryItemResponse?> GetByIdAsync(int id, string userId);
    Task<ItineraryItemResponse> CreateAsync(int tripId, CreateItineraryItemRequest request, string userId);
    Task<ItineraryItemResponse?> UpdateAsync(int id, UpdateItineraryItemRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
