namespace WebAPI.Dtos.Auth
{
    public class TokenResponse
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public string? HomePage { get; set; }
    }
}
