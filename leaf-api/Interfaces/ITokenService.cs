using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
