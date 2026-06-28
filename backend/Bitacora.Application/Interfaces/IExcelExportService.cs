namespace Bitacora.Application.Interfaces;

public interface IExcelExportService
{
    Task<byte[]> ExportExpensesAsync(int tripId, string userId);
    Task<byte[]> ExportItineraryAsync(int tripId, string userId);
    Task<byte[]> ExportChecklistAsync(int tripId, string userId);
    Task<byte[]> ExportAccommodationsAsync(int tripId, string userId);
    Task<byte[]> ExportCitiesAsync(int tripId, string userId);
    Task<byte[]> ExportSimOptionsAsync(int tripId, string userId);
    Task<byte[]> ExportTripAsync(int tripId, string userId);
}
