using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/accommodations")]
[Authorize]
public class AccommodationsController : ControllerBase
{
    private readonly IAccommodationService _accommodationService;

    public AccommodationsController(IAccommodationService accommodationService)
    {
        _accommodationService = accommodationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AccommodationResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _accommodationService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<AccommodationResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AccommodationResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _accommodationService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<AccommodationResponse> { Success = false, Message = "Alojamiento no encontrado." });

        return Ok(new ApiResponse<AccommodationResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AccommodationResponse>>> Create(int tripId, [FromBody] CreateAccommodationRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _accommodationService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = item.Id },
                new ApiResponse<AccommodationResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<AccommodationResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AccommodationResponse>>> Update(int tripId, int id, [FromBody] UpdateAccommodationRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _accommodationService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<AccommodationResponse> { Success = false, Message = "Alojamiento no encontrado." });

            return Ok(new ApiResponse<AccommodationResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<AccommodationResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _accommodationService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Alojamiento no encontrado." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Alojamiento eliminado correctamente." });
    }
}
