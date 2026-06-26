using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/itinerary")]
[Authorize]
public class ItineraryItemsController : ControllerBase
{
    private readonly IItineraryItemService _itineraryItemService;

    public ItineraryItemsController(IItineraryItemService itineraryItemService)
    {
        _itineraryItemService = itineraryItemService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ItineraryItemResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _itineraryItemService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<ItineraryItemResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ItineraryItemResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _itineraryItemService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<ItineraryItemResponse> { Success = false, Message = "Ítem de itinerario no encontrado." });

        return Ok(new ApiResponse<ItineraryItemResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ItineraryItemResponse>>> Create(int tripId, [FromBody] CreateItineraryItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _itineraryItemService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = item.Id },
                new ApiResponse<ItineraryItemResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ItineraryItemResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ItineraryItemResponse>>> Update(int tripId, int id, [FromBody] UpdateItineraryItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _itineraryItemService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<ItineraryItemResponse> { Success = false, Message = "Ítem de itinerario no encontrado." });

            return Ok(new ApiResponse<ItineraryItemResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<ItineraryItemResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _itineraryItemService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Ítem de itinerario no encontrado." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Ítem de itinerario eliminado correctamente." });
    }
}
