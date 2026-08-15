using Bitacora.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Tests.Common;

/// <summary>
/// Creates a BitacoraDbContext backed by a fresh, isolated SQLite in-memory
/// database per instance. The underlying connection must stay open for the
/// lifetime of the context (SQLite drops an in-memory database as soon as
/// the last connection to it closes), so this class owns the connection and
/// disposing it tears the database down.
/// </summary>
public sealed class TestDbContextFactory : IDisposable
{
    private readonly SqliteConnection _connection;

    public BitacoraDbContext Context { get; }

    public TestDbContextFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<BitacoraDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new BitacoraDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        _connection.Dispose();
    }
}
