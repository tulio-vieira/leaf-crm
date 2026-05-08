using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace LogosAPI.Errors
{
    public class ProblemExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            if (exception is ServiceException serviceException)
            {
                httpContext.Response.StatusCode = serviceException.statusCode;
            }
            var details = new ProblemDetails
            {
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}",
                Status = httpContext.Response.StatusCode,
                Title = exception.Message,
                Detail = exception.HelpLink,
                Type = exception.GetType().FullName
            };
            details.Extensions.TryAdd("requestId", httpContext.TraceIdentifier);
            var activity = httpContext.Features.Get<IHttpActivityFeature>()?.Activity;
            details.Extensions.TryAdd("traceId", activity?.Id);
            await httpContext.Response.WriteAsJsonAsync(details, cancellationToken: cancellationToken);
            return true;
        }
    }
}
