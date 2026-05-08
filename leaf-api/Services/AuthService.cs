using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using LogosAPI.Configuration;
using LogosAPI.Data;
using LogosAPI.Dtos.Auth;
using LogosAPI.Errors;
using LogosAPI.Models;

namespace LogosAPI.Services
{
    public class AuthService(
        DataContext context,
        IOptions<JWTOptions> jwtSettings,
        ILogger<AuthService> logger
        )
    {
        static public string ValidateEmailRoute = "/api/auth/validate-email";
        static public string ResetPasswordRoute = "/api/auth/reset-password";

        public async Task<User> ValidateUserPasswordAsync(LoginRequest request)
        {
            var user = await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user is null
                || new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
                    == PasswordVerificationResult.Failed)
            {
                throw new ServiceException("Nome de usuário ou senha inválidos.");
            }
            return user;
        }

        public async Task<User> RegisterAsync(RegisterRequest request)
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new ServiceException("Nome de usuário ou e-mail já está em uso.");
            }
            var user = new User
            {
                Name = request.Username,
                Email = request.Email
            };
            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, request.Password);

            user.PasswordHash = hashedPassword;

            return user;
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await context.Users.Where(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (user is null)
            {
                throw new NotFoundException($"E-mail {request.Email} não encontrado.");
            }
            if (!user.IsEmailConfirmed) {
                throw new UnauthorizedException($"O e-mail {request.Email} não foi validado. Verifique sua caixa de entrada.");
            }
            return CreateToken(user, ResetPasswordRoute);
        }

        public async Task<TokenResponse?> RefreshTokensAsync(RefreshTokenRequest request)
        {
            var user = await ValidateRefreshTokenAsync(request.Email, request.RefreshToken);
            if (user is null)
                return null;

            await context.Entry(user).Reference(u => u.Role).LoadAsync();
            return await CreateTokenResponse(user);
        }

        public async Task<User> ValidateEmailValidationToken(string token)
        {
            var validated = ValidateToken(token, ValidateEmailRoute);
            string userEmail = validated.Claims.First(c => c.Type == ClaimTypes.Email).Value;
            var user = await context.Users.Where(u => u.Email == userEmail).FirstAsync();
            if (user is null)
            {
                throw new NotFoundException($"Usuário com e-mail '{userEmail}' não encontrado.");
            }
            user.IsEmailConfirmed = true;
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<User> ValidatePasswordResetToken(ResetPasswordRequest request)
        {
            var validated = ValidateToken(request.Token, ResetPasswordRoute);
            var userId = validated.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
            var user = await context.Users.FindAsync(new Guid(userId));
            if (user is null)
            {
                throw new NotFoundException($"Usuário com id {userId} não encontrado.");
            }
            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, request.Password);
            user.PasswordHash = hashedPassword;
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<TokenResponse> CreateTokenResponse(User user)
        {
            return new TokenResponse
            {
                Username = user.Name,
                Email = user.Email,
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user),
                HomePage = user.Role?.HomePage
            };
        }

        private JwtSecurityToken ValidateToken(
              string token,
              string audienceSufix
        )
        {
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Value.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Value.Audience + audienceSufix,
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings.Value.SigningKey)),
                ValidateIssuerSigningKey = true
            };

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return (JwtSecurityToken)validatedToken;
            }
            catch
            {
                logger.LogInformation("Invalid token.");
                throw new UnauthorizedException("Token inválido.");
            }
        }

        private async Task<User?> ValidateRefreshTokenAsync(string email, string refreshToken)
        {
            var user = await context.Users.Where(u => u.Email == email).FirstOrDefaultAsync();
            if (user is null || user.RefreshToken != refreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpiryDays);
            await context.SaveChangesAsync();
            return refreshToken;
        }

        public string CreateToken(User user, string audienceSufix = "")
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            };

            if (user.Role is not null)
            {
                foreach (var permission in user.Role.GetPermissionList())
                    claims.Add(new Claim("permission", permission));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Value.SigningKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: jwtSettings.Value.Issuer,
                audience: jwtSettings.Value.Audience + audienceSufix,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(jwtSettings.Value.AccessTokenExpiryMinutes),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        public void ValidatePasswordFormat(string password)
        {
            int counter = 0;
            string[] patterns = {
                @"[a-z]",
                @"[A-Z]",
                @"[^a-zA-Z]",
            };
            foreach (string p in patterns)
            {
                if (Regex.IsMatch(password, p))
                    counter++;
            }
            if (password.Length < 7)
                throw new ServiceException($"A senha deve ter pelo menos {7} caracteres.");
            if (counter != patterns.Length)
                throw new ServiceException("A senha deve conter letras maiúsculas, minúsculas e símbolos ou dígitos.");
        }

        public Guid GetUserId(HttpContext httpContext)
        {
            string userId = httpContext.User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
            return new Guid(userId);
        }

        public async Task<User> GetUser(HttpContext httpContext)
        {
            var userId = GetUserId(httpContext);
            var user = await context.Users.FindAsync(userId);
            if (user == null) {
                throw new NotFoundException($"Usuário com id {userId} não encontrado.");
            }
            return user;
        }
    }
}
