using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using LogosAPI.Configuration;
using LogosAPI.Data;
using LogosAPI.Dtos.Auth;
using LogosAPI.Errors;
using LogosAPI.Interfaces;
using LogosAPI.Services;
using Microsoft.Extensions.Options;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(
        AuthService authService,
        INotificationService notificationService,
        DataContext context,
        IOptions<JWTOptions> jwtSettings
        ) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<AuthResponse> Register(RegisterRequest request)
        {
            authService.ValidatePasswordFormat(request.Password);
            ValidateUsernameFormat(request.Username);
            var user = await authService.RegisterAsync(request);
            if (!TryValidateModel(user))
            {
                throw new ServiceException("E-mail ou nome de usuário inválido");
            }
            var validateEmailToken = authService.CreateToken(user, AuthService.ValidateEmailRoute);
            context.Users.Add(user);
            await context.SaveChangesAsync();
            await notificationService.NotifiyAccountCreated(user.Email, validateEmailToken);
            return new AuthResponse()
            {
                Email = user.Email,
                Message = "Conta criada com sucesso. Verifique sua caixa de entrada para validar o e-mail."
            };
        }

        [HttpPost("login")]
        public async Task<TokenResponse> Login(LoginRequest request)
        {
            var user = await authService.ValidateUserPasswordAsync(request);
            if (!user.IsEmailConfirmed)
            {
                throw new UnauthorizedException($"O e-mail {request.Email} não foi validado.");
            }
            var res = await authService.CreateTokenResponse(user);
            AppendAccessTokenCookie(res.AccessToken);
            return res;
        }

        [HttpPost("resend-email-validation")]
        public async Task<AuthResponse> ResendEmailValidationNotification(LoginRequest request)
        {
            var user = await authService.ValidateUserPasswordAsync(request);
            if (user.IsEmailConfirmed)
            {
                throw new ServiceException("O e-mail já foi validado.");
            }
            var token = authService.CreateToken(user, AuthService.ValidateEmailRoute);
            await notificationService.NotifiyAccountCreated(user.Email, token);
            return new AuthResponse()
            {
                Email = user.Email,
                Message = "E-mail de validação enviado.",
            };
        }


        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponse>> RefreshToken(RefreshTokenRequest request)
        {
            var result = await authService.RefreshTokensAsync(request);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
                return Unauthorized("Token de atualização inválido.");
            AppendAccessTokenCookie(result.AccessToken);
            return Ok(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                Path = "/",
                SameSite = SameSiteMode.Lax,
                HttpOnly = true,
                Secure = false,
            });
            return NoContent();
        }

        private void AppendAccessTokenCookie(string accessToken)
        {
            Response.Cookies.Append("access_token", accessToken, new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddMinutes((double)jwtSettings.Value.AccessTokenExpiryMinutes),
                HttpOnly = true,
                Path = "/",
                SameSite = SameSiteMode.Lax,
                Secure = false,
            });
        }

        [HttpPost("validate-email")]
        public async Task<ActionResult<AuthResponse>> ValidateEmail(ValidateEmailRequest request)
        {
            var user = await authService.ValidateEmailValidationToken(request.Token);
            return new AuthResponse()
            {
                Email = user.Email,
                Message = "E-mail validado com sucesso.",
            };
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<AuthResponse>> ForgotPassword(ForgotPasswordRequest request)
        {
            var token = await authService.ForgotPasswordAsync(request);
            await notificationService.NotifyPasswordResetRequest(request.Email, token);
            return new AuthResponse()
            {
                Email = request.Email,
                Message = "Link de redefinição de senha enviado para o e-mail."
            };
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<AuthResponse>> ResetPassword(ResetPasswordRequest request)
        {
            var user = await authService.ValidatePasswordResetToken(request);
            return new AuthResponse()
            {
                Email = user.Email,
                Message = "Senha redefinida com sucesso.",
            };
        }

        private void ValidateUsernameFormat(string username)
        {
            if (Regex.IsMatch(username, @"[^a-zA-Z\-0-9]"))
            {
                throw new ServiceException("O nome de usuário deve conter apenas letras, números ou hifens.");
            }
        }

    }
}
