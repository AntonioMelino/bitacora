using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/payment-methods")]
[Authorize]
public class PaymentMethodsController : ControllerBase
{
    private readonly IPaymentMethodService _paymentMethodService;

    public PaymentMethodsController(IPaymentMethodService paymentMethodService)
    {
        _paymentMethodService = paymentMethodService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var methods = await _paymentMethodService.GetAllAsync(userId);
        return Ok(new ApiResponse<List<LookupResponse>> { Success = true, Data = methods });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var method = await _paymentMethodService.GetByIdAsync(id, userId);
            return Ok(new ApiResponse<LookupResponse> { Success = true, Data = method });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<LookupResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LookupRequest request)
    {
        var userId = GetUserId();
        var method = await _paymentMethodService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = method.Id },
            new ApiResponse<LookupResponse> { Success = true, Data = method });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] LookupRequest request)
    {
        try
        {
            var userId = GetUserId();
            var method = await _paymentMethodService.UpdateAsync(id, request, userId);
            return Ok(new ApiResponse<LookupResponse> { Success = true, Data = method });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<LookupResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();
            await _paymentMethodService.DeleteAsync(id, userId);
            return Ok(new ApiResponse<object> { Success = true, Message = "Método de pago eliminado." });
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
