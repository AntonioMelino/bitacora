using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/sim-options")]
[Authorize]
public class SimOptionsController : ControllerBase
{
    private readonly ISimOptionService _simOptionService;

    public SimOptionsController(ISimOptionService simOptionService)
    {
        _simOptionService = simOptionService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SimOptionResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _simOptionService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<SimOptionResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<SimOptionResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _simOptionService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<SimOptionResponse> { Success = false, Message = "Opción SIM no encontrada." });

        return Ok(new ApiResponse<SimOptionResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SimOptionResponse>>> Create(int tripId, [FromBody] CreateSimOptionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _simOptionService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = item.Id },
                new ApiResponse<SimOptionResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<SimOptionResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<SimOptionResponse>>> Update(int tripId, int id, [FromBody] UpdateSimOptionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _simOptionService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<SimOptionResponse> { Success = false, Message = "Opción SIM no encontrada." });

            return Ok(new ApiResponse<SimOptionResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<SimOptionResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPatch("{id}/decided")]
    public async Task<ActionResult<ApiResponse<SimOptionResponse>>> ToggleDecided(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _simOptionService.ToggleDecidedAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<SimOptionResponse> { Success = false, Message = "Opción SIM no encontrada." });

        return Ok(new ApiResponse<SimOptionResponse> { Success = true, Data = item });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _simOptionService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Opción SIM no encontrada." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Opción SIM eliminada correctamente." });
    }
}
