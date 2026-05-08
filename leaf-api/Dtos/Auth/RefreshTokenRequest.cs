namespace WebAPI.Dtos.Auth
{
    public class RefreshTokenRequest
    {
        public required string Email { get; set; }
        public required string RefreshToken { get; set; }
    }
}
