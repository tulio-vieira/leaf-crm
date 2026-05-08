namespace LogosAPI.Dtos.Auth
{
    public class ResetPasswordRequest
    {
        public required string Password { get; set; }
        public required string Token { get; set; }
    }
}
