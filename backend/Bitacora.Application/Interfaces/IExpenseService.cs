using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface IExpenseService
{
    Task<List<ExpenseResponse>> GetByTripAsync(int tripId, string userId);
    Task<ExpenseResponse?> GetByIdAsync(int id, string userId);
    Task<ExpenseResponse> CreateAsync(int tripId, CreateExpenseRequest request, string userId);
    Task<ExpenseResponse?> UpdateAsync(int id, UpdateExpenseRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
