using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/currencies")]
[Authorize]
public class CurrenciesController : ControllerBase
{
    private readonly ICurrencyService _currencyService;

    public CurrenciesController(ICurrencyService currencyService)
    {
        _currencyService = currencyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var currencies = await _currencyService.GetAllAsync(userId);
        return Ok(new ApiResponse<List<CurrencyResponse>> { Success = true, Data = currencies });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var currency = await _currencyService.GetByIdAsync(id, userId);
            return Ok(new ApiResponse<CurrencyResponse> { Success = true, Data = currency });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<CurrencyResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CurrencyRequest request)
    {
        var userId = GetUserId();
        var currency = await _currencyService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = currency.Id },
            new ApiResponse<CurrencyResponse> { Success = true, Data = currency });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CurrencyRequest request)
    {
        try
        {
            var userId = GetUserId();
            var currency = await _currencyService.UpdateAsync(id, request, userId);
            return Ok(new ApiResponse<CurrencyResponse> { Success = true, Data = currency });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<CurrencyResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();
            await _currencyService.DeleteAsync(id, userId);
            return Ok(new ApiResponse<object> { Success = true, Message = "Moneda eliminada." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Usuario no autenticado.");
}
