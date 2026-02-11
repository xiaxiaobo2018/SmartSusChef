using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using SmartSusChef.Api.Data;
using SmartSusChef.Api.Services;
using SmartSusChef.Api.DTOs;
using SmartSusChef.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartSusChef.Api.Tests.Services;

public class MlForecastServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IMlPredictionService> _mockMlService;
    private readonly Mock<IStoreService> _mockStoreService;
    private readonly Mock<ILogger<MlForecastService>> _mockLogger;
    private readonly MlForecastService _service;

    public MlForecastServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockMlService = new Mock<IMlPredictionService>();
        _mockStoreService = new Mock<IStoreService>();
        _mockLogger = new Mock<ILogger<MlForecastService>>();

        _service = new MlForecastService(
            _context,
            _mockCurrentUserService.Object,
            _mockMlService.Object,
            _mockStoreService.Object,
            _mockLogger.Object
        );

        _mockCurrentUserService.Setup(s => s.StoreId).Returns(1);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnMlPredictions_WhenMlServiceSucceeds()
    {
        // Arrange
        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = 1, Name = "Pizza" };
        await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();

        var mlResponse = new MlStorePredictResponseDto(1, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>
        {
            ["Pizza"] = new MlDishPredictionDto("Pizza", "model", "combo", 7, DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), new List<MlDayPredictionDto>
            {
                new(DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), 10, 10, 0)
            }, null)
        });
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal("Pizza", result[0].RecipeName);
    }
    
    [Fact]
    public async Task GetForecastAsync_ShouldReturnCachedPredictions_WhenMlServiceFails()
    {
        // Arrange
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ThrowsAsync(new Exception());

        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = 1, Name = "Burger" };
        await _context.Recipes.AddAsync(recipe);
        
        var forecastData = new ForecastData { Id = Guid.NewGuid(), StoreId = 1, RecipeId = recipe.Id, ForecastDate = DateTime.UtcNow.Date, PredictedQuantity = 5, UpdatedAt = DateTime.UtcNow, Recipe = recipe };
        await _context.ForecastData.AddAsync(forecastData);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal("Burger", result[0].RecipeName);
    }

    [Fact]
    public async Task GetForecastSummaryAsync_ShouldReturnSummary()
    {
        // Arrange
        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = 1, Name = "Pizza" };
        await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();

        var mlResponse = new MlStorePredictResponseDto(1, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>
        {
            ["Pizza"] = new MlDishPredictionDto("Pizza", "model", "combo", 7, DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), new List<MlDayPredictionDto>
            {
                new(DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), 10, 10, 0)
            }, null)
        });
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastSummaryAsync();

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal(10, result[0].TotalQuantity);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldFilterNullIngredients_InForecastIngredients()
    {
        // Arrange
        var storeId = 1;
        var ingredientId = Guid.NewGuid();
        var ingredient = new Ingredient { Id = ingredientId, Name = "Cheese", Unit = "g", StoreId = storeId };
        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = storeId, Name = "Pizza" };
        recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = ingredientId, Ingredient = ingredient, Quantity = 2m });
        recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = null, Ingredient = null, Quantity = 1m });
        await _context.Ingredients.AddAsync(ingredient);
        await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();

        var mlResponse = new MlStorePredictResponseDto(storeId, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>
        {
            ["Pizza"] = new MlDishPredictionDto("Pizza", "model", "combo", 7, DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), new List<MlDayPredictionDto>
            {
                new(DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), 10, 10, 0)
            }, null)
        });
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(storeId, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.NotEmpty(result);
        Assert.Single(result[0].Ingredients);
        Assert.Equal("Cheese", result[0].Ingredients[0].IngredientName);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnEmpty_WhenMlReturnsTrainingStatus()
    {
        // Arrange
        var mlResponse = new MlStorePredictResponseDto(1, "training", null, 150, null);
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("ML models are being trained. Returning cached or mock data.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)), Times.Once);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnEmpty_WhenMlReturnsInsufficientDataStatus()
    {
        // Arrange
        var mlResponse = new MlStorePredictResponseDto(1, "insufficient_data", null, 50, null);
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Insufficient data")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)), Times.Once);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnEmpty_WhenMlReturnsUnknownStatus()
    {
        // Arrange
        var mlResponse = new MlStorePredictResponseDto(1, "unknown_status", "Some message", 0, null);
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("ML returned status 'unknown_status'")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)), Times.Once);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnEmpty_WhenMlReturnsOkButNoPredictions()
    {
        // Arrange
        var mlResponse = new MlStorePredictResponseDto(1, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>());
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(1, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("ML returned 'ok' but no forecasts matched date range.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)), Times.Once);
    }

    [Fact]
    public async Task SaveAndConvertPredictions_ShouldHandleDishNotFoundInDb()
    {
        // Arrange
        var storeId = 1;
        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = storeId, Name = "Existing Dish" };
        await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();

        var mlResponse = new MlStorePredictResponseDto(storeId, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>
        {
            ["Non-existent Dish"] = new MlDishPredictionDto("Non-existent Dish", "model", "combo", 7, DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), new List<MlDayPredictionDto>
            {
                new(DateTime.UtcNow.Date.ToString("yyyy-MM-dd"), 10, 10, 0)
            }, null)
        });
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(storeId, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result); // Should not return forecasts for non-existent dish
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("ML dish 'Non-existent Dish' not found in store 1 recipes, skipping.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)), Times.Once);
    }

    [Fact]
    public async Task SaveAndConvertPredictions_ShouldHandleInvalidPredictionDate()
    {
        // Arrange
        var storeId = 1;
        var recipe = new Recipe { Id = Guid.NewGuid(), StoreId = storeId, Name = "Pizza" };
        await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();

        var mlResponse = new MlStorePredictResponseDto(storeId, "ok", null, 150, new Dictionary<string, MlDishPredictionDto>
        {
            ["Pizza"] = new MlDishPredictionDto("Pizza", "model", "combo", 7, "Invalid-Date", new List<MlDayPredictionDto>
            {
                new("Invalid-Date", 10, 10, 0) // Invalid date string
            }, null)
        });
        _mockMlService.Setup(s => s.GetStorePredictionsAsync(storeId, It.IsAny<int>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string>()))
            .ReturnsAsync(mlResponse);

        // Act
        var result = await _service.GetForecastAsync();

        // Assert
        Assert.Empty(result); // No valid predictions should be processed
    }
}
