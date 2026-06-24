using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Infrastructure.Persistence;

public class BitacoraDbContext : IdentityDbContext<ApplicationUser>
{
    public BitacoraDbContext(DbContextOptions<BitacoraDbContext> options)
        : base(options) { }

    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<Currency> Currencies => Set<Currency>();
}