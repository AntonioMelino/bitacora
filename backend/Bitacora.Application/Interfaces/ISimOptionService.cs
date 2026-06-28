using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface ISimOptionService
{
    Task<List<SimOptionResponse>> GetByTripAsync(int tripId, string userId);
    Task<SimOptionResponse?> GetByIdAsync(int id, string userId);
    Task<SimOptionResponse> CreateAsync(int tripId, CreateSimOptionRequest request, string userId);
    Task<SimOptionResponse?> UpdateAsync(int id, UpdateSimOptionRequest request, string userId);
    Task<SimOptionResponse?> ToggleDecidedAsync(int id, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
