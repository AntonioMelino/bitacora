using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/cities/{cityId}/places")]
[Authorize]
public class PlacesToVisitController : ControllerBase
{
    private readonly IPlaceToVisitService _placeService;

    public PlacesToVisitController(IPlaceToVisitService placeService)
    {
        _placeService = placeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PlaceToVisitResponse>>>> GetAll(int tripId, int cityId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _placeService.GetByCityAsync(cityId, userId);
        return Ok(new ApiResponse<List<PlaceToVisitResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PlaceToVisitResponse>>> GetById(int tripId, int cityId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _placeService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<PlaceToVisitResponse> { Success = false, Message = "Lugar no encontrado." });

        return Ok(new ApiResponse<PlaceToVisitResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PlaceToVisitResponse>>> Create(int tripId, int cityId, [FromBody] CreatePlaceToVisitRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _placeService.CreateAsync(cityId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, cityId, id = item.Id },
                new ApiResponse<PlaceToVisitResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<PlaceToVisitResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PlaceToVisitResponse>>> Update(int tripId, int cityId, int id, [FromBody] UpdatePlaceToVisitRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _placeService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<PlaceToVisitResponse> { Success = false, Message = "Lugar no encontrado." });

            return Ok(new ApiResponse<PlaceToVisitResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<PlaceToVisitResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPatch("{id}/visited")]
    public async Task<ActionResult<ApiResponse<PlaceToVisitResponse>>> ToggleVisited(int tripId, int cityId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _placeService.ToggleVisitedAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<PlaceToVisitResponse> { Success = false, Message = "Lugar no encontrado." });

        return Ok(new ApiResponse<PlaceToVisitResponse> { Success = true, Data = item });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int cityId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _placeService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Lugar no encontrado." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Lugar eliminado correctamente." });
    }
}
