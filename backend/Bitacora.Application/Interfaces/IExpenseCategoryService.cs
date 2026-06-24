using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IExpenseCategoryService
{
    Task<List<LookupResponse>> GetAllAsync(string userId);
    Task<LookupResponse> GetByIdAsync(int id, string userId);
    Task<LookupResponse> CreateAsync(LookupRequest request, string userId);
    Task<LookupResponse> UpdateAsync(int id, LookupRequest request, string userId);
    Task DeleteAsync(int id, string userId);
}
