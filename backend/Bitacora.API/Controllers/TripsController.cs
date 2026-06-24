using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var trips = await _tripService.GetAllAsync(userId);
        return Ok(new ApiResponse<List<TripResponse>> { Success = true, Data = trips });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var trip = await _tripService.GetByIdAsync(id, userId);
            return Ok(new ApiResponse<TripResponse> { Success = true, Data = trip });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<TripResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTripRequest request)
    {
        var userId = GetUserId();
        var trip = await _tripService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = trip.Id },
            new ApiResponse<TripResponse> { Success = true, Data = trip });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTripRequest request)
    {
        try
        {
            var userId = GetUserId();
            var trip = await _tripService.UpdateAsync(id, request, userId);
            return Ok(new ApiResponse<TripResponse> { Success = true, Data = trip });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<TripResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();
            await _tripService.DeleteAsync(id, userId);
            return Ok(new ApiResponse<object> { Success = true, Message = "Viaje eliminado." });
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
