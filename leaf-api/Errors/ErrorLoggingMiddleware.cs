using System.Text;
using System.Text.Json;

namespace LogosAPI.Errors
{
    public class ErrorLoggingMiddleware(RequestDelegate next, ILogger<ErrorLoggingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            context.Request.EnableBuffering();

            var originalBody = context.Response.Body;
            using var responseBuffer = new MemoryStream();
            context.Response.Body = responseBuffer;

            try
            {
                await next(context);
            }
            finally
            {
                if (context.Response.StatusCode >= 400)
                    await LogAsync(context, responseBuffer);

                responseBuffer.Seek(0, SeekOrigin.Begin);
                await responseBuffer.CopyToAsync(originalBody);
                context.Response.Body = originalBody;
            }
        }

        private async Task LogAsync(HttpContext context, MemoryStream responseBuffer)
        {
            context.Request.Body.Seek(0, SeekOrigin.Begin);
            var requestBody = await new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true)
                .ReadToEndAsync();

            responseBuffer.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(responseBuffer, Encoding.UTF8, leaveOpen: true)
                .ReadToEndAsync();

            var statusCode = context.Response.StatusCode;
            var logLevel = statusCode >= 500 ? LogLevel.Error : LogLevel.Warning;

            logger.Log(
                logLevel,
                "HTTP {StatusCode} on {Method} {Path}{QueryString} — Request: {RequestBody} — Response: {ResponseBody}",
                statusCode,
                context.Request.Method,
                context.Request.Path,
                context.Request.QueryString,
                string.IsNullOrWhiteSpace(requestBody) ? "(empty)" : requestBody,
                responseBody);
        }
    }
}
