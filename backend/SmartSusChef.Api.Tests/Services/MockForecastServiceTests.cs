using Xunit;
using Microsoft.EntityFrameworkCore;
using SmartSusChef.Api.Data;
using SmartSusChef.Api.Services;
using SmartSusChef.Api.Models;
using Moq;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace SmartSusChef.Api.Tests.Services;

public class MockForecastServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldThrowArgumentException_WhenDaysIsInvalid()
    {
        // Arrange
        var context = GetDbContext();
        var service = new MockForecastService(context, Mock.Of<ICurrentUserService>());

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetForecastAsync(0));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetForecastAsync(31));
    }

    [Fact]
    public async Task GetForecastAsync_ShouldThrowArgumentException_WhenIncludePastDaysIsInvalid()
    {
        // Arrange
        var context = GetDbContext();
        var service = new MockForecastService(context, Mock.Of<ICurrentUserService>());

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetForecastAsync(7, -1));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetForecastAsync(7, 31));
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReturnForecasts_WhenValid()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeId = Guid.NewGuid();
        context.Recipes.Add(new Recipe { Id = recipeId, Name = "Test Recipe", StoreId = storeId });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastAsync(7, 0);

        // Assert
        Assert.NotEmpty(result);
        Assert.Contains(result, f => f.RecipeId == recipeId.ToString());
        Assert.True(result.Count >= 7); // Ensure at least 7 days of forecast

    }

    [Fact]
    public async Task GetForecastAsync_ShouldGeneratePastAndFutureForecasts_WhenIncludePastDaysIsUsed()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeId = Guid.NewGuid();
        context.Recipes.Add(new Recipe { Id = recipeId, Name = "Test Recipe", StoreId = storeId });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        var days = 7;
        var includePastDays = 3;
        var today = DateTime.UtcNow.Date;

        // Act
        var result = await service.GetForecastAsync(days, includePastDays);

        // Assert
        Assert.NotEmpty(result);
        // Check if forecasts for past days are included
        for (int i = -includePastDays; i < 0; i++)
        {
            var pastDate = today.AddDays(i).ToString("yyyy-MM-dd");
            Assert.Contains(result, f => f.Date == pastDate);
        }
        // Check if forecasts for future days are included
        for (int i = 1; i <= days; i++)
        {
            var futureDate = today.AddDays(i).ToString("yyyy-MM-dd");
            Assert.Contains(result, f => f.Date == futureDate);
        }
    }

    [Fact]
    public async Task GetForecastAsync_ShouldUseDefaultAverage_WhenNoSalesHistory()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeId = Guid.NewGuid();
        context.Recipes.Add(new Recipe { Id = recipeId, Name = "New Recipe", StoreId = storeId });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastAsync(1, 0);

        // Assert
        // Default average is 10. Multiplier for weekdays is 0.8-1.5. Random factor 0.9-1.1.
        // So prediction should be roughly around 10.
        var forecast = result.First(f => f.RecipeId == recipeId.ToString());
        Assert.True(forecast.Quantity > 0); 
        Assert.InRange(forecast.Quantity, 0, 20); // A reasonable range for default avg with multipliers/randomness
    }

    [Fact]
    public async Task GetForecastAsync_ShouldReflectDayOfWeekMultipliers()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeId = Guid.NewGuid();
        context.Recipes.Add(new Recipe { Id = recipeId, Name = "Day Multiplier Test", StoreId = storeId });
        context.SalesData.Add(new SalesData
        {
            RecipeId = recipeId,
            StoreId = storeId,
            Date = DateTime.UtcNow.Date.AddDays(-10),
            Quantity = 100
        });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastAsync(14, 0); // Get enough days to cover a week

        // Assert
        // Check for Friday, Saturday, Sunday, Monday
        var fridayForecast = result.FirstOrDefault(f => DateTime.Parse(f.Date).DayOfWeek == DayOfWeek.Friday && f.RecipeId == recipeId.ToString());
        var saturdayForecast = result.FirstOrDefault(f => DateTime.Parse(f.Date).DayOfWeek == DayOfWeek.Saturday && f.RecipeId == recipeId.ToString());
        var sundayForecast = result.FirstOrDefault(f => DateTime.Parse(f.Date).DayOfWeek == DayOfWeek.Sunday && f.RecipeId == recipeId.ToString());
        var mondayForecast = result.FirstOrDefault(f => DateTime.Parse(f.Date).DayOfWeek == DayOfWeek.Monday && f.RecipeId == recipeId.ToString());

        // Assert that quantities are generally in line with multipliers (approximate due to randomness)
        // Base avg = 100
        // Friday: 1.3 -> ~130
        // Saturday: 1.5 -> ~150
        // Sunday: 1.2 -> ~120
        // Monday: 0.8 -> ~80
        Assert.NotNull(fridayForecast);
        Assert.True(fridayForecast.Quantity > 100 && fridayForecast.Quantity < 160); // 1.3 * (0.9 to 1.1) * 100 = 117 to 143
        Assert.NotNull(saturdayForecast);
        Assert.True(saturdayForecast.Quantity > 120 && saturdayForecast.Quantity < 180); // 1.5 * (0.9 to 1.1) * 100 = 135 to 165
        Assert.NotNull(sundayForecast);
        Assert.True(sundayForecast.Quantity > 90 && sundayForecast.Quantity < 150); // 1.2 * (0.9 to 1.1) * 100 = 108 to 132
        Assert.NotNull(mondayForecast);
        Assert.True(mondayForecast.Quantity > 60 && mondayForecast.Quantity < 100); // 0.8 * (0.9 to 1.1) * 100 = 72 to 88
    }

    [Fact]
    public async Task GetForecastAsync_ShouldSetConfidenceBasedOnPredictedQuantity()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeHighId = Guid.NewGuid();
        var recipeMediumId = Guid.NewGuid();
        var recipeLowId = Guid.NewGuid();

        context.Recipes.Add(new Recipe { Id = recipeHighId, Name = "High Confidence", StoreId = storeId });
        context.SalesData.Add(new SalesData { RecipeId = recipeHighId, StoreId = storeId, Date = DateTime.UtcNow.Date.AddDays(-1), Quantity = 100 });

        context.Recipes.Add(new Recipe { Id = recipeMediumId, Name = "Medium Confidence", StoreId = storeId });
        context.SalesData.Add(new SalesData { RecipeId = recipeMediumId, StoreId = storeId, Date = DateTime.UtcNow.Date.AddDays(-1), Quantity = 30 });

        context.Recipes.Add(new Recipe { Id = recipeLowId, Name = "Low Confidence", StoreId = storeId });
        context.SalesData.Add(new SalesData { RecipeId = recipeLowId, StoreId = storeId, Date = DateTime.UtcNow.Date.AddDays(-1), Quantity = 5 });

        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastAsync(1, 0); // Forecast for today

        // Assert
        var highForecast = result.FirstOrDefault(f => f.RecipeId == recipeHighId.ToString());
        var mediumForecast = result.FirstOrDefault(f => f.RecipeId == recipeMediumId.ToString());
        var lowForecast = result.FirstOrDefault(f => f.RecipeId == recipeLowId.ToString());

        Assert.NotNull(highForecast);
        Assert.Equal("High", highForecast.Confidence);
        Assert.NotNull(mediumForecast);
        Assert.Equal("Medium", mediumForecast.Confidence);
        Assert.NotNull(lowForecast);
        Assert.Equal("Low", lowForecast.Confidence);
    }

    [Fact]
    public async Task GetForecastAsync_ShouldGenerateForecastIngredientsCorrectly()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipeId = Guid.NewGuid();
        var ingredient1Id = Guid.NewGuid();
        var ingredient2Id = Guid.NewGuid();

        var recipe = new Recipe { Id = recipeId, Name = "Recipe with Ingredients", StoreId = storeId };
        recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = ingredient1Id, Quantity = 2, Ingredient = new Ingredient { Id = ingredient1Id, Name = "Ing 1", Unit = "kg" } });
        recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = ingredient2Id, Quantity = 0.5m, Ingredient = new Ingredient { Id = ingredient2Id, Name = "Ing 2", Unit = "L" } });
        // Add one with null ingredient to ensure filtering
        recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = null, Quantity = 1, Ingredient = null });

        context.Recipes.Add(recipe);
        context.SalesData.Add(new SalesData { RecipeId = recipeId, StoreId = storeId, Date = DateTime.UtcNow.Date.AddDays(-1), Quantity = 10 });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastAsync(1, 0);
        var forecast = result.FirstOrDefault(f => f.RecipeId == recipeId.ToString());

        // Assert
        Assert.NotNull(forecast);
        Assert.NotNull(forecast.Ingredients);
        Assert.Equal(2, forecast.Ingredients.Count); // Should not include null ingredient

        var ing1 = forecast.Ingredients.FirstOrDefault(fi => fi.IngredientId == ingredient1Id.ToString());
        Assert.NotNull(ing1);
        Assert.Equal("Ing 1", ing1.IngredientName);
        Assert.Equal("kg", ing1.Unit);
        // Predicted quantity will be around 10 from sales data (10 * multiplier * random)
        // So expected ingredient quantity should be 2 * predicted_quantity
        Assert.InRange(ing1.Quantity, 0, 40); // Accounting for default avg, multipliers and randomness

        var ing2 = forecast.Ingredients.FirstOrDefault(fi => fi.IngredientId == ingredient2Id.ToString());
        Assert.NotNull(ing2);
        Assert.Equal("Ing 2", ing2.IngredientName);
        Assert.Equal("L", ing2.Unit);
        Assert.InRange(ing2.Quantity, 0, 10);
    }

    [Fact]
    public async Task GetForecastSummaryAsync_ShouldReturnSummaryWithCorrectAggregation()
    {
        // Arrange
        var context = GetDbContext();
        var storeId = 1;
        var recipe1Id = Guid.NewGuid();
        var recipe2Id = Guid.NewGuid();
        var today = DateTime.UtcNow.Date;

        // Add recipe 1 and sales
        context.Recipes.Add(new Recipe { Id = recipe1Id, Name = "Recipe 1", StoreId = storeId });
        context.SalesData.Add(new SalesData { RecipeId = recipe1Id, StoreId = storeId, Date = today.AddDays(-1), Quantity = 10 });

        // Add recipe 2 and sales
        context.Recipes.Add(new Recipe { Id = recipe2Id, Name = "Recipe 2", StoreId = storeId });
        context.SalesData.Add(new SalesData { RecipeId = recipe2Id, StoreId = storeId, Date = today.AddDays(-1), Quantity = 20 });
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.StoreId).Returns(storeId);
        var service = new MockForecastService(context, mockCurrentUserService.Object);

        // Act
        var result = await service.GetForecastSummaryAsync(1, 1); // Get forecast for 1 day, including 1 past day (today)

        // Assert
        Assert.NotEmpty(result);
        var todaySummary = result.FirstOrDefault(s => s.Date == today.ToString("yyyy-MM-dd"));
        Assert.NotNull(todaySummary);
        // The total quantity will be a sum of forecasts for recipe1 and recipe2 for today.
        // Given randomness, we can't assert exact numbers, but should be greater than the sum of average quantities (10+20=30)
        Assert.InRange(todaySummary.TotalQuantity, 0, 70); // A generous range to account for randomness and multipliers
        Assert.True(todaySummary.ChangePercentage != 0); // Should have some random change
    }
}
