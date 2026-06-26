using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/checklist")]
[Authorize]
public class ChecklistItemsController : ControllerBase
{
    private readonly IChecklistItemService _checklistItemService;

    public ChecklistItemsController(IChecklistItemService checklistItemService)
    {
        _checklistItemService = checklistItemService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ChecklistItemResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _checklistItemService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<ChecklistItemResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ChecklistItemResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _checklistItemService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<ChecklistItemResponse> { Success = false, Message = "Ítem del checklist no encontrado." });

        return Ok(new ApiResponse<ChecklistItemResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ChecklistItemResponse>>> Create(int tripId, [FromBody] CreateChecklistItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _checklistItemService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = item.Id },
                new ApiResponse<ChecklistItemResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ChecklistItemResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ChecklistItemResponse>>> Update(int tripId, int id, [FromBody] UpdateChecklistItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _checklistItemService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<ChecklistItemResponse> { Success = false, Message = "Ítem del checklist no encontrado." });

            return Ok(new ApiResponse<ChecklistItemResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ChecklistItemResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<ApiResponse<ChecklistItemResponse>>> Toggle(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _checklistItemService.ToggleStatusAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<ChecklistItemResponse> { Success = false, Message = "Ítem del checklist no encontrado." });

        return Ok(new ApiResponse<ChecklistItemResponse> { Success = true, Data = item });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _checklistItemService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Ítem del checklist no encontrado." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Ítem del checklist eliminado correctamente." });
    }
}
