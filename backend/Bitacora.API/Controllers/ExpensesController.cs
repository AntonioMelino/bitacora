using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ExpenseResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var expenses = await _expenseService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<ExpenseResponse>> { Success = true, Data = expenses });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var expense = await _expenseService.GetByIdAsync(id, userId);

        if (expense is null)
            return NotFound(new ApiResponse<ExpenseResponse> { Success = false, Message = "Gasto no encontrado." });

        return Ok(new ApiResponse<ExpenseResponse> { Success = true, Data = expense });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> Create(int tripId, [FromBody] CreateExpenseRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var expense = await _expenseService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = expense.Id },
                new ApiResponse<ExpenseResponse> { Success = true, Data = expense });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ExpenseResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> Update(int tripId, int id, [FromBody] UpdateExpenseRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var expense = await _expenseService.UpdateAsync(id, request, userId);

            if (expense is null)
                return NotFound(new ApiResponse<ExpenseResponse> { Success = false, Message = "Gasto no encontrado." });

            return Ok(new ApiResponse<ExpenseResponse> { Success = true, Data = expense });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ExpenseResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _expenseService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Gasto no encontrado." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Gasto eliminado correctamente." });
    }
}
