using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IChecklistItemService
{
    Task<List<ChecklistItemResponse>> GetByTripAsync(int tripId, string userId);
    Task<ChecklistItemResponse?> GetByIdAsync(int id, string userId);
    Task<ChecklistItemResponse> CreateAsync(int tripId, CreateChecklistItemRequest request, string userId);
    Task<ChecklistItemResponse?> UpdateAsync(int id, UpdateChecklistItemRequest request, string userId);
    Task<ChecklistItemResponse?> ToggleStatusAsync(int id, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
