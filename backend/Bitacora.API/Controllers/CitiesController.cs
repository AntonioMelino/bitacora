using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/cities")]
[Authorize]
public class CitiesController : ControllerBase
{
    private readonly ICityService _cityService;

    public CitiesController(ICityService cityService)
    {
        _cityService = cityService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CityResponse>>>> GetAll(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _cityService.GetByTripAsync(tripId, userId);
        return Ok(new ApiResponse<List<CityResponse>> { Success = true, Data = items });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CityResponse>>> GetById(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _cityService.GetByIdAsync(id, userId);

        if (item is null)
            return NotFound(new ApiResponse<CityResponse> { Success = false, Message = "Ciudad no encontrada." });

        return Ok(new ApiResponse<CityResponse> { Success = true, Data = item });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CityResponse>>> Create(int tripId, [FromBody] CreateCityRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _cityService.CreateAsync(tripId, request, userId);
            return CreatedAtAction(nameof(GetById), new { tripId, id = item.Id },
                new ApiResponse<CityResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<CityResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CityResponse>>> Update(int tripId, int id, [FromBody] UpdateCityRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var item = await _cityService.UpdateAsync(id, request, userId);

            if (item is null)
                return NotFound(new ApiResponse<CityResponse> { Success = false, Message = "Ciudad no encontrada." });

            return Ok(new ApiResponse<CityResponse> { Success = true, Data = item });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<CityResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int tripId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _cityService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Ciudad no encontrada." });

        return Ok(new ApiResponse<object> { Success = true, Message = "Ciudad eliminada correctamente." });
    }
}
