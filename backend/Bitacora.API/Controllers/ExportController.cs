using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/trips/{tripId}/export")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly IExcelExportService _exportService;
    private const string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public ExportController(IExcelExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("expenses")]
    public async Task<IActionResult> ExportExpenses(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportExpensesAsync(tripId, userId);
        return File(bytes, ContentType, $"gastos-viaje-{tripId}.xlsx");
    }

    [HttpGet("itinerary")]
    public async Task<IActionResult> ExportItinerary(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportItineraryAsync(tripId, userId);
        return File(bytes, ContentType, $"itinerario-viaje-{tripId}.xlsx");
    }

    [HttpGet("checklist")]
    public async Task<IActionResult> ExportChecklist(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportChecklistAsync(tripId, userId);
        return File(bytes, ContentType, $"checklist-viaje-{tripId}.xlsx");
    }

    [HttpGet("accommodations")]
    public async Task<IActionResult> ExportAccommodations(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportAccommodationsAsync(tripId, userId);
        return File(bytes, ContentType, $"alojamientos-viaje-{tripId}.xlsx");
    }

    [HttpGet("cities")]
    public async Task<IActionResult> ExportCities(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportCitiesAsync(tripId, userId);
        return File(bytes, ContentType, $"ciudades-viaje-{tripId}.xlsx");
    }

    [HttpGet("sim-options")]
    public async Task<IActionResult> ExportSimOptions(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bytes = await _exportService.ExportSimOptionsAsync(tripId, userId);
        return File(bytes, ContentType, $"sim-options-viaje-{tripId}.xlsx");
    }

    [HttpGet]
    public async Task<IActionResult> ExportTrip(int tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var bytes = await _exportService.ExportTripAsync(tripId, userId);
            return File(bytes, ContentType, $"viaje-{tripId}-completo.xlsx");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }
}
