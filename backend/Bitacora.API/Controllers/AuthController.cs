using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Bitacora.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(new ApiResponse<AuthResponse> { Success = true, Data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<AuthResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(new ApiResponse<AuthResponse> { Success = true, Data = result });
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new ApiResponse<AuthResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(new ApiResponse<AuthResponse> { Success = true, Data = result });
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new ApiResponse<AuthResponse> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        await _authService.RevokeTokenAsync(request.RefreshToken);
        return Ok(new ApiResponse<object> { Success = true });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (userId == null)
            return Unauthorized(new ApiResponse<AuthResponse> { Success = false, Message = "No autorizado." });

        try
        {
            var result = await _authService.GetCurrentUserAsync(userId);
            return Ok(new ApiResponse<AuthResponse> { Success = true, Data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<AuthResponse> { Success = false, Message = ex.Message });
        }
    }
}
