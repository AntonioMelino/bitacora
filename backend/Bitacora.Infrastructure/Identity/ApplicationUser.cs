using Microsoft.AspNetCore.Identity;

namespace Bitacora.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}
