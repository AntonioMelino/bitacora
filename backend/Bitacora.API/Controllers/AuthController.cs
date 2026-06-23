using System.Security.Claims;
using Bitacora.Application.DTOs;
using Bitacora.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
