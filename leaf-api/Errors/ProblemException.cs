namespace WebAPI.Errors
{
    public class ServiceException : Exception
    {
        public int statusCode = StatusCodes.Status400BadRequest;
        public ServiceException(string? message) : base(message)
        {
        }
    }
    public class NotFoundException : ServiceException
    {
        public NotFoundException(string? message) : base(message)
        {
            statusCode = StatusCodes.Status404NotFound;
        }
    }
    public class UnauthorizedException : ServiceException
    {
        public UnauthorizedException(string message = "Não autorizado") : base(message)
        {
            statusCode = StatusCodes.Status401Unauthorized;
        }
    }

    public class ForbiddenException : ServiceException
    {
        public ForbiddenException(string message = "Acesso negado") : base(message)
        {
            statusCode = StatusCodes.Status403Forbidden;
        }
    }
}
