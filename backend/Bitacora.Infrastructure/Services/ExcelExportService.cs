using Bitacora.Application.Interfaces;
using Bitacora.Infrastructure.Persistence;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Services;

public class ExcelExportService : IExcelExportService
{
    private readonly BitacoraDbContext _context;

    public ExcelExportService(BitacoraDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> ExportExpensesAsync(int tripId, string userId)
    {
        var expenses = await _context.Expenses
            .Where(e => e.TripId == tripId && e.UserId == userId)
            .OrderBy(e => e.PaymentDate)
            .ToListAsync();

        var categories = await _context.ExpenseCategories
            .Where(c => c.UserId == userId)
            .ToDictionaryAsync(c => c.Id, c => c.Name);

        var paymentMethods = await _context.PaymentMethods
            .Where(p => p.UserId == userId)
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var currencies = await _context.Currencies
            .Where(c => c.UserId == userId)
            .ToDictionaryAsync(c => c.Id, c => c.Code);

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Gastos");

        AddHeaders(sheet, new[] { "Fecha", "Descripción", "Categoría", "Ciudad", "Monto", "Moneda", "Tipo de Cambio", "Método de Pago", "Observaciones" });

        int row = 2;
        foreach (var e in expenses)
        {
            sheet.Cell(row, 1).Value = e.PaymentDate.ToString("yyyy-MM-dd");
            sheet.Cell(row, 2).Value = e.Description;
            sheet.Cell(row, 3).Value = categories.GetValueOrDefault(e.CategoryId, "");
            sheet.Cell(row, 4).Value = e.City;
            sheet.Cell(row, 5).Value = e.Amount;
            sheet.Cell(row, 6).Value = currencies.GetValueOrDefault(e.CurrencyId, "");
            sheet.Cell(row, 7).Value = e.ExchangeRate.HasValue ? e.ExchangeRate.Value.ToString("F4") : "";
            sheet.Cell(row, 8).Value = paymentMethods.GetValueOrDefault(e.PaymentMethodId, "");
            sheet.Cell(row, 9).Value = e.Observations ?? "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportItineraryAsync(int tripId, string userId)
    {
        var items = await _context.ItineraryItems
            .Where(i => i.TripId == tripId && i.UserId == userId)
            .OrderBy(i => i.Date)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Itinerario");

        AddHeaders(sheet, new[] { "Fecha", "Día", "Ciudad", "Alojamiento", "Actividades", "Transporte", "Vuelo", "Link", "Observaciones" });

        int row = 2;
        foreach (var i in items)
        {
            sheet.Cell(row, 1).Value = i.Date.ToString("yyyy-MM-dd");
            sheet.Cell(row, 2).Value = i.DayNumber;
            sheet.Cell(row, 3).Value = i.City;
            sheet.Cell(row, 4).Value = i.Accommodation ?? "";
            sheet.Cell(row, 5).Value = i.Activities ?? "";
            sheet.Cell(row, 6).Value = i.Transport ?? "";
            sheet.Cell(row, 7).Value = i.Flight ?? "";
            sheet.Cell(row, 8).Value = i.Link ?? "";
            sheet.Cell(row, 9).Value = i.Observations ?? "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportChecklistAsync(int tripId, string userId)
    {
        var items = await _context.ChecklistItems
            .Where(c => c.TripId == tripId && c.UserId == userId)
            .OrderBy(c => c.Order)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Checklist");

        AddHeaders(sheet, new[] { "Orden", "Ítem", "Estado" });

        int row = 2;
        foreach (var c in items)
        {
            sheet.Cell(row, 1).Value = c.Order;
            sheet.Cell(row, 2).Value = c.Item;
            sheet.Cell(row, 3).Value = c.Status ? "Listo" : "Pendiente";
            row++;
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportAccommodationsAsync(int tripId, string userId)
    {
        var items = await _context.Accommodations
            .Where(a => a.TripId == tripId && a.UserId == userId)
            .OrderBy(a => a.CheckIn)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Alojamientos");

        AddHeaders(sheet, new[] { "Nombre", "Ciudad", "Dirección", "Check-in", "Check-out", "Observaciones" });

        int row = 2;
        foreach (var a in items)
        {
            sheet.Cell(row, 1).Value = a.Name;
            sheet.Cell(row, 2).Value = a.City;
            sheet.Cell(row, 3).Value = a.Address ?? "";
            sheet.Cell(row, 4).Value = a.CheckIn.ToString("yyyy-MM-dd");
            sheet.Cell(row, 5).Value = a.CheckOut.ToString("yyyy-MM-dd");
            sheet.Cell(row, 6).Value = a.Observations ?? "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportCitiesAsync(int tripId, string userId)
    {
        var cities = await _context.Cities
            .Where(c => c.TripId == tripId && c.UserId == userId)
            .OrderBy(c => c.Order).ThenBy(c => c.Name)
            .ToListAsync();

        var cityIds = cities.Select(c => c.Id).ToList();

        var places = await _context.PlacesToVisit
            .Where(p => cityIds.Contains(p.CityId) && p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Ciudades y Lugares");

        AddHeaders(sheet, new[] { "Ciudad", "Lugar", "Link Maps", "Notas", "Visitado" });

        int row = 2;
        foreach (var city in cities)
        {
            var cityPlaces = places.Where(p => p.CityId == city.Id).ToList();
            if (cityPlaces.Count == 0)
            {
                sheet.Cell(row, 1).Value = city.Name;
                row++;
                continue;
            }
            foreach (var place in cityPlaces)
            {
                sheet.Cell(row, 1).Value = city.Name;
                sheet.Cell(row, 2).Value = place.Name;
                sheet.Cell(row, 3).Value = place.MapsLink ?? "";
                sheet.Cell(row, 4).Value = place.Notes ?? "";
                sheet.Cell(row, 5).Value = place.Visited ? "Visitado" : "Pendiente";
                row++;
            }
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportSimOptionsAsync(int tripId, string userId)
    {
        var items = await _context.SimOptions
            .Where(s => s.TripId == tripId && s.UserId == userId)
            .OrderBy(s => s.Company)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("SIM y eSIM");

        AddHeaders(sheet, new[] { "Empresa", "Tipo", "Cobertura", "Notas", "Elegida" });

        int row = 2;
        foreach (var s in items)
        {
            sheet.Cell(row, 1).Value = s.Company;
            sheet.Cell(row, 2).Value = s.Type;
            sheet.Cell(row, 3).Value = s.Coverage ?? "";
            sheet.Cell(row, 4).Value = s.Notes ?? "";
            sheet.Cell(row, 5).Value = s.Decided ? "Sí" : "No";
            row++;
        }

        sheet.Columns().AdjustToContents();
        return ToBytes(workbook);
    }

    public async Task<byte[]> ExportTripAsync(int tripId, string userId)
    {
        var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId)
            ?? throw new InvalidOperationException("Viaje no encontrado.");

        var expenses = await _context.Expenses.Where(e => e.TripId == tripId && e.UserId == userId).OrderBy(e => e.PaymentDate).ToListAsync();
        var categories = await _context.ExpenseCategories.Where(c => c.UserId == userId).ToDictionaryAsync(c => c.Id, c => c.Name);
        var paymentMethods = await _context.PaymentMethods.Where(p => p.UserId == userId).ToDictionaryAsync(p => p.Id, p => p.Name);
        var currencies = await _context.Currencies.Where(c => c.UserId == userId).ToDictionaryAsync(c => c.Id, c => c.Code);
        var itinerary = await _context.ItineraryItems.Where(i => i.TripId == tripId && i.UserId == userId).OrderBy(i => i.Date).ToListAsync();
        var checklist = await _context.ChecklistItems.Where(c => c.TripId == tripId && c.UserId == userId).OrderBy(c => c.Order).ToListAsync();
        var accommodations = await _context.Accommodations.Where(a => a.TripId == tripId && a.UserId == userId).OrderBy(a => a.CheckIn).ToListAsync();
        var cities = await _context.Cities.Where(c => c.TripId == tripId && c.UserId == userId).OrderBy(c => c.Order).ThenBy(c => c.Name).ToListAsync();
        var cityIds = cities.Select(c => c.Id).ToList();
        var places = await _context.PlacesToVisit.Where(p => cityIds.Contains(p.CityId) && p.UserId == userId).OrderBy(p => p.Name).ToListAsync();
        var simOptions = await _context.SimOptions.Where(s => s.TripId == tripId && s.UserId == userId).OrderBy(s => s.Company).ToListAsync();

        using var workbook = new XLWorkbook();

        var expSheet = workbook.Worksheets.Add("Gastos");
        AddHeaders(expSheet, new[] { "Fecha", "Descripción", "Categoría", "Ciudad", "Monto", "Moneda", "Tipo de Cambio", "Método de Pago", "Observaciones" });
        int row = 2;
        foreach (var e in expenses)
        {
            expSheet.Cell(row, 1).Value = e.PaymentDate.ToString("yyyy-MM-dd");
            expSheet.Cell(row, 2).Value = e.Description;
            expSheet.Cell(row, 3).Value = categories.GetValueOrDefault(e.CategoryId, "");
            expSheet.Cell(row, 4).Value = e.City;
            expSheet.Cell(row, 5).Value = e.Amount;
            expSheet.Cell(row, 6).Value = currencies.GetValueOrDefault(e.CurrencyId, "");
            expSheet.Cell(row, 7).Value = e.ExchangeRate.HasValue ? e.ExchangeRate.Value.ToString("F4") : "";
            expSheet.Cell(row, 8).Value = paymentMethods.GetValueOrDefault(e.PaymentMethodId, "");
            expSheet.Cell(row, 9).Value = e.Observations ?? "";
            row++;
        }
        expSheet.Columns().AdjustToContents();

        var itiSheet = workbook.Worksheets.Add("Itinerario");
        AddHeaders(itiSheet, new[] { "Fecha", "Día", "Ciudad", "Alojamiento", "Actividades", "Transporte", "Vuelo", "Link", "Observaciones" });
        row = 2;
        foreach (var i in itinerary)
        {
            itiSheet.Cell(row, 1).Value = i.Date.ToString("yyyy-MM-dd");
            itiSheet.Cell(row, 2).Value = i.DayNumber;
            itiSheet.Cell(row, 3).Value = i.City;
            itiSheet.Cell(row, 4).Value = i.Accommodation ?? "";
            itiSheet.Cell(row, 5).Value = i.Activities ?? "";
            itiSheet.Cell(row, 6).Value = i.Transport ?? "";
            itiSheet.Cell(row, 7).Value = i.Flight ?? "";
            itiSheet.Cell(row, 8).Value = i.Link ?? "";
            itiSheet.Cell(row, 9).Value = i.Observations ?? "";
            row++;
        }
        itiSheet.Columns().AdjustToContents();

        var chkSheet = workbook.Worksheets.Add("Checklist");
        AddHeaders(chkSheet, new[] { "Orden", "Ítem", "Estado" });
        row = 2;
        foreach (var c in checklist)
        {
            chkSheet.Cell(row, 1).Value = c.Order;
            chkSheet.Cell(row, 2).Value = c.Item;
            chkSheet.Cell(row, 3).Value = c.Status ? "Listo" : "Pendiente";
            row++;
        }
        chkSheet.Columns().AdjustToContents();

        var accSheet = workbook.Worksheets.Add("Alojamientos");
        AddHeaders(accSheet, new[] { "Nombre", "Ciudad", "Dirección", "Check-in", "Check-out", "Observaciones" });
        row = 2;
        foreach (var a in accommodations)
        {
            accSheet.Cell(row, 1).Value = a.Name;
            accSheet.Cell(row, 2).Value = a.City;
            accSheet.Cell(row, 3).Value = a.Address ?? "";
            accSheet.Cell(row, 4).Value = a.CheckIn.ToString("yyyy-MM-dd");
            accSheet.Cell(row, 5).Value = a.CheckOut.ToString("yyyy-MM-dd");
            accSheet.Cell(row, 6).Value = a.Observations ?? "";
            row++;
        }
        accSheet.Columns().AdjustToContents();

        var citSheet = workbook.Worksheets.Add("Ciudades y Lugares");
        AddHeaders(citSheet, new[] { "Ciudad", "Lugar", "Link Maps", "Notas", "Visitado" });
        row = 2;
        foreach (var city in cities)
        {
            var cityPlaces = places.Where(p => p.CityId == city.Id).ToList();
            if (cityPlaces.Count == 0)
            {
                citSheet.Cell(row, 1).Value = city.Name;
                row++;
                continue;
            }
            foreach (var place in cityPlaces)
            {
                citSheet.Cell(row, 1).Value = city.Name;
                citSheet.Cell(row, 2).Value = place.Name;
                citSheet.Cell(row, 3).Value = place.MapsLink ?? "";
                citSheet.Cell(row, 4).Value = place.Notes ?? "";
                citSheet.Cell(row, 5).Value = place.Visited ? "Visitado" : "Pendiente";
                row++;
            }
        }
        citSheet.Columns().AdjustToContents();

        if (trip.IsInternational && simOptions.Count > 0)
        {
            var simSheet = workbook.Worksheets.Add("SIM y eSIM");
            AddHeaders(simSheet, new[] { "Empresa", "Tipo", "Cobertura", "Notas", "Elegida" });
            row = 2;
            foreach (var s in simOptions)
            {
                simSheet.Cell(row, 1).Value = s.Company;
                simSheet.Cell(row, 2).Value = s.Type;
                simSheet.Cell(row, 3).Value = s.Coverage ?? "";
                simSheet.Cell(row, 4).Value = s.Notes ?? "";
                simSheet.Cell(row, 5).Value = s.Decided ? "Sí" : "No";
                row++;
            }
            simSheet.Columns().AdjustToContents();
        }

        return ToBytes(workbook);
    }

    private static void AddHeaders(IXLWorksheet sheet, string[] headers)
    {
        for (int col = 1; col <= headers.Length; col++)
        {
            var cell = sheet.Cell(1, col);
            cell.Value = headers[col - 1];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#FF6B35");
            cell.Style.Font.FontColor = XLColor.White;
        }
    }

    private static byte[] ToBytes(XLWorkbook workbook)
    {
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
