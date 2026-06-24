using Bitacora.Application.DTOs;

namespace Bitacora.Application.Interfaces;

public interface ICurrencyService
{
    Task<List<CurrencyResponse>> GetAllAsync(string userId);
    Task<CurrencyResponse> GetByIdAsync(int id, string userId);
    Task<CurrencyResponse> CreateAsync(CurrencyRequest request, string userId);
    Task<CurrencyResponse> UpdateAsync(int id, CurrencyRequest request, string userId);
    Task DeleteAsync(int id, string userId);
}
