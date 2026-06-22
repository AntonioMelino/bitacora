using Bitacora.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Persistence;

public class BitacoraDbContext : DbContext
{
    public BitacoraDbContext(DbContextOptions<BitacoraDbContext> options) 
        : base(options) { }

    public DbSet<Trip> Trips => Set<Trip>();
}