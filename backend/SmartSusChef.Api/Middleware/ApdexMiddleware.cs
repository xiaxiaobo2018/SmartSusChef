using System.Diagnostics;

public class ApdexMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApdexMiddleware> _logger;

    public ApdexMiddleware(RequestDelegate next, ILogger<ApdexMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var elapsedMs = stopwatch.ElapsedMilliseconds;

            _logger.LogInformation(
                "ApdexMetrics: Path={Path}, Method={Method}, StatusCode={StatusCode}, DurationMs={Duration}",
                context.Request.Path,
                context.Request.Method,
                context.Response.StatusCode,
                elapsedMs);
        }
    }
}
