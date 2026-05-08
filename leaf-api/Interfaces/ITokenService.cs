using LogosAPI.Models;

namespace LogosAPI.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
