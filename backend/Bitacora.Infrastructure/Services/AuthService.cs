using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Bitacora.Domain.Entities;
using Bitacora.Infrastructure.Identity;
using Bitacora.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bitacora.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly BitacoraDbContext _db;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration, BitacoraDbContext db)
    {
        _userManager = userManager;
        _configuration = configuration;
        _db = db;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("El email ya está registrado.");

        var user = new ApplicationUser
        {
            FullName = request.FullName,
            Email = request.Email,
            UserName = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"No se pudo crear el usuario: {errors}");
        }

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = await GenerateRefreshTokenAsync(user.Id),
            Email = user.Email!,
            FullName = user.FullName
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Email o contraseña incorrectos.");

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
            throw new InvalidOperationException("Email o contraseña incorrectos.");

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = await GenerateRefreshTokenAsync(user.Id),
            Email = user.Email!,
            FullName = user.FullName
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken && t.RevokedAt == null);

        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Refresh token inválido o expirado.");

        var user = await _userManager.FindByIdAsync(storedToken.UserId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        storedToken.RevokedAt = DateTime.UtcNow;

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = await GenerateRefreshTokenAsync(user.Id),
            Email = user.Email!,
            FullName = user.FullName
        };
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken && t.RevokedAt == null);

        if (storedToken == null)
            return;

        storedToken.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private async Task<string> GenerateRefreshTokenAsync(string userId)
    {
        var refreshDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpireDays"] ?? "30");
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays)
        });

        await _db.SaveChangesAsync();
        return token;
    }

    public async Task<AuthResponse> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        return new AuthResponse
        {
            Token = string.Empty,
            Email = user.Email!,
            FullName = user.FullName
        };
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtSecret = _configuration["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("JWT secret no configurado.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("fullName", user.FullName)
        };

        var expiresDays = int.Parse(_configuration["JwtSettings:ExpireDays"] ?? "7");

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiresDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
