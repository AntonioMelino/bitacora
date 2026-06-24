using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/expense-categories")]
[Authorize]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly IExpenseCategoryService _categoryService;

    public ExpenseCategoriesController(IExpenseCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var categories = await _categoryService.GetAllAsync(userId);
        return Ok(new ApiResponse<List<LookupResponse>> { Success = true, Data = categories });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var category = await _categoryService.GetByIdAsync(id, userId);
            return Ok(new ApiResponse<LookupResponse> { Success = true, Data = category });
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
        var category = await _categoryService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = category.Id },
            new ApiResponse<LookupResponse> { Success = true, Data = category });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] LookupRequest request)
    {
        try
        {
            var userId = GetUserId();
            var category = await _categoryService.UpdateAsync(id, request, userId);
            return Ok(new ApiResponse<LookupResponse> { Success = true, Data = category });
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
            await _categoryService.DeleteAsync(id, userId);
            return Ok(new ApiResponse<object> { Success = true, Message = "Categoría eliminada." });
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
