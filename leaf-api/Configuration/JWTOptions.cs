namespace LogosAPI.Configuration
{
    public class JWTOptions
    {
        public required string Issuer {  get; set; }
        public required string Audience {  get; set; }
        public required string SigningKey {  get; set; }
        public required double AccessTokenExpiryMinutes { get; set; }
        public required double RefreshTokenExpiryDays { get; set; }
    }
}
