using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartSusChef.Api.Data;
using SmartSusChef.Api.DTOs;
using SmartSusChef.Api.Services;

namespace SmartSusChef.Api.Controllers;

/// <summary>
/// Controller for ML model status, training, and prediction management.
/// Exposes endpoints so the frontend can display ML model status
/// and trigger training when needed.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MlController : ControllerBase
{
    private readonly IMlPredictionService _mlService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStoreService _storeService;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<MlController> _logger;

    public MlController(
        IMlPredictionService mlService,
        ICurrentUserService currentUserService,
        IStoreService storeService,
        ApplicationDbContext dbContext,
        ILogger<MlController> logger)
    {
        _mlService = mlService;
        _currentUserService = currentUserService;
        _storeService = storeService;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Get ML model status for the current user's store.
    /// Returns whether models exist, if training is in progress,
    /// available dishes, and data availability.
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<MlStatusResponseDto>> GetStatus()
    {
        try
        {
            var storeId = _currentUserService.StoreId;
            var status = await _mlService.GetStoreStatusAsync(storeId);

            // When the ML service is unavailable, query the database directly
            // to provide accurate data availability info instead of showing "0 days".
            if (!status.ServiceAvailable)
            {
                _logger.LogInformation("ML service unavailable for store {StoreId}, querying database for data availability.", storeId);

                var dbDaysAvailable = await _dbContext.SalesData
                    .Where(s => s.StoreId == storeId)
                    .Select(s => s.Date.Date)
                    .Distinct()
                    .CountAsync();

                var dbStatus = dbDaysAvailable >= 100 ? "can_train" : "insufficient_data";
                var dbMessage = dbDaysAvailable >= 100
                    ? $"ML service is offline. Sufficient data available ({dbDaysAvailable} days). Training will start when ML service reconnects."
                    : $"ML service is offline. Currently {dbDaysAvailable} days of data. Need at least 100 days of sales data.";

                return Ok(new MlStatusResponseDto(
                    StoreId: storeId,
                    HasModels: false,
                    IsTraining: false,
                    Dishes: null,
                    DaysAvailable: dbDaysAvailable,
                    Status: dbStatus,
                    Message: dbMessage
                ));
            }

            return Ok(new MlStatusResponseDto(
                StoreId: status.StoreId,
                HasModels: status.HasModels,
                IsTraining: status.IsTraining,
                Dishes: status.Dishes,
                DaysAvailable: status.DaysAvailable,
                Status: status.HasModels ? "ready" :
                        status.IsTraining ? "training" :
                        (status.DaysAvailable.HasValue && status.DaysAvailable.Value >= 100) ? "can_train" :
                        "insufficient_data",
                Message: status.HasModels ? "Models are ready for prediction." :
                         status.IsTraining ? "Models are currently being trained. Please wait." :
                         (status.DaysAvailable.HasValue && status.DaysAvailable.Value >= 100)
                             ? $"Sufficient data available ({status.DaysAvailable} days). You can start training."
                             : $"Insufficient data ({status.DaysAvailable ?? 0} days). Need at least 100 days of sales data.",
                TrainingProgress: status.TrainingProgress
            ));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get ML status. ML service may be unavailable.");

            // Even if ML service is down, query DB for actual data availability
            var storeId = _currentUserService.StoreId;
            int dbDays = 0;
            try
            {
                dbDays = await _dbContext.SalesData
                    .Where(s => s.StoreId == storeId)
                    .Select(s => s.Date.Date)
                    .Distinct()
                    .CountAsync();
            }
            catch (Exception dbEx)
            {
                _logger.LogWarning(dbEx, "Also failed to query database for data availability.");
            }

            var status = dbDays >= 100 ? "can_train" : "insufficient_data";
            var message = dbDays >= 100
                ? $"ML service is offline. Sufficient data available ({dbDays} days). Training will start when ML service reconnects."
                : $"ML service is offline. Currently {dbDays} days of data. Need at least 100 days of sales data.";

            return Ok(new MlStatusResponseDto(
                StoreId: storeId,
                HasModels: false,
                IsTraining: false,
                Dishes: null,
                DaysAvailable: dbDays,
                Status: status,
                Message: message
            ));
        }
    }

    /// <summary>
    /// Trigger ML model training for the current user's store.
    /// Training runs asynchronously on the ML backend.
    /// </summary>
    [HttpPost("train")]
    public async Task<ActionResult<MlTrainResponseDto>> TriggerTraining()
    {
        try
        {
            var storeId = _currentUserService.StoreId;
            var result = await _mlService.TriggerTrainingAsync(storeId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to trigger ML training.");
            return StatusCode(503, new { message = "ML service is unavailable. Please try again later." });
        }
    }

    /// <summary>
    /// Request ML predictions for the current user's store.
    /// This is an explicit prediction trigger (the forecast endpoint also calls ML internally).
    /// </summary>
    [HttpPost("predict")]
    public async Task<ActionResult<MlStorePredictResponseDto>> Predict([FromQuery] int days = 7)
    {
        if (days < 1 || days > 30)
        {
            return BadRequest(new { message = "Prediction horizon (days) must be between 1 and 30." });
        }

        try
        {
            var storeId = _currentUserService.StoreId;
            var store = await _storeService.GetStoreAsync();

            var result = await _mlService.GetStorePredictionsAsync(
                storeId,
                horizonDays: days,
                latitude: store?.Latitude,
                longitude: store?.Longitude,
                countryCode: store?.CountryCode
            );

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get ML predictions.");
            return StatusCode(503, new { message = "ML service is unavailable. Please try again later." });
        }
    }

    /// <summary>
    /// Diagnostic endpoint to test ML connectivity and forecast pipeline.
    /// Access directly: GET /api/ml/diag?storeId=1 (no auth required)
    /// </summary>
    [HttpGet("diag")]
    [AllowAnonymous]
    public async Task<ActionResult> Diagnostics([FromQuery] int storeId = 1)
    {
        var result = new Dictionary<string, object?>
        {
            ["storeId"] = storeId,
            ["timestamp"] = DateTime.UtcNow.ToString("o"),
        };

        // 1. DB data check
        try
        {
            var salesDays = await _dbContext.SalesData
                .Where(s => s.StoreId == storeId)
                .Select(s => s.Date.Date)
                .Distinct()
                .CountAsync();
            result["dbSalesDays"] = salesDays;

            var recipeCount = await _dbContext.Recipes
                .Where(r => r.StoreId == storeId)
                .CountAsync();
            result["dbRecipeCount"] = recipeCount;

            var dishNames = await _dbContext.Recipes
                .Where(r => r.StoreId == storeId)
                .Select(r => r.Name)
                .Distinct()
                .Take(5)
                .ToListAsync();
            result["sampleDishes"] = dishNames;
        }
        catch (Exception ex)
        {
            result["dbError"] = ex.Message;
        }

        // 2. ML API base URL (from config)
        var mlUrl = HttpContext.RequestServices.GetService<IConfiguration>()?["ExternalApis:MlApiUrl"];
        result["mlApiUrl"] = mlUrl ?? "(not configured, using default http://localhost:8000)";

        // 3. Direct HTTP test to ML health endpoint
        try
        {
            var baseUrl = (mlUrl ?? "http://localhost:8000").TrimEnd('/');
            result["mlTestUrl"] = $"{baseUrl}/health";

            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var healthResp = await client.GetAsync($"{baseUrl}/health");
            sw.Stop();
            result["mlHealthStatus"] = (int)healthResp.StatusCode;
            result["mlHealthElapsedMs"] = sw.ElapsedMilliseconds;
            var healthBody = await healthResp.Content.ReadAsStringAsync();
            result["mlHealthBody"] = healthBody.Length > 500 ? healthBody[..500] : healthBody;
        }
        catch (Exception ex)
        {
            result["mlHealthError"] = $"{ex.GetType().Name}: {ex.Message}";
            if (ex.InnerException != null)
                result["mlHealthInnerError"] = $"{ex.InnerException.GetType().Name}: {ex.InnerException.Message}";
        }

        // 4. ML status call via service
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var status = await _mlService.GetStoreStatusAsync(storeId);
            sw.Stop();
            result["mlStatus"] = new
            {
                status.StoreId,
                status.HasModels,
                status.IsTraining,
                status.DaysAvailable,
                status.ServiceAvailable,
                DishCount = status.Dishes?.Count ?? 0,
                ElapsedMs = sw.ElapsedMilliseconds,
            };
        }
        catch (Exception ex)
        {
            result["mlStatusError"] = $"{ex.GetType().Name}: {ex.Message}";
        }

        // 5. ML predict call (small horizon for speed)
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var mlResponse = await _mlService.GetStorePredictionsAsync(
                storeId, horizonDays: 2, latitude: null, longitude: null, countryCode: null);
            sw.Stop();

            result["mlPredict"] = new
            {
                mlResponse.Status,
                mlResponse.Message,
                mlResponse.DaysAvailable,
                PredictionDishes = mlResponse.Predictions?.Count ?? 0,
                PredictionSample = mlResponse.Predictions?.Take(2).Select(p => new
                {
                    Dish = p.Key,
                    Error = p.Value.Error,
                    DayCount = p.Value.Predictions?.Count ?? 0,
                }),
                ElapsedMs = sw.ElapsedMilliseconds,
            };
        }
        catch (Exception ex)
        {
            result["mlPredictError"] = $"{ex.GetType().Name}: {ex.Message}";
            if (ex.InnerException != null)
                result["mlPredictInnerError"] = $"{ex.InnerException.GetType().Name}: {ex.InnerException.Message}";
        }

        // 6. Cached forecasts in DB
        try
        {
            var cachedCount = await _dbContext.ForecastData
                .Where(f => f.StoreId == storeId && f.UpdatedAt >= DateTime.UtcNow.AddHours(-24))
                .CountAsync();
            result["cachedForecastCount24h"] = cachedCount;
        }
        catch (Exception ex)
        {
            result["cachedForecastError"] = ex.Message;
        }

        return Ok(result);
    }
}

/// <summary>
/// Response DTO for ML status endpoint — enriched with user-friendly status and message.
/// </summary>
public record MlStatusResponseDto(
    int StoreId,
    bool HasModels,
    bool IsTraining,
    List<string>? Dishes,
    int? DaysAvailable,
    string Status,     // "ready" | "training" | "can_train" | "insufficient_data" | "unavailable"
    string Message,
    MlTrainingProgressDto? TrainingProgress = null
);
