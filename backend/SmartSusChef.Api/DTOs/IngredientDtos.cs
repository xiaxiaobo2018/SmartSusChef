using System.ComponentModel.DataAnnotations;

namespace SmartSusChef.Api.DTOs;

public record IngredientDto(
    string Id,
    string Name,
    string Unit,
    decimal CarbonFootprint,
    string? GlobalIngredientId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateIngredientRequest(
    [Required][StringLength(100)] string Name,
    [Required][StringLength(20)] string Unit,
    [Range(0, double.MaxValue)] decimal CarbonFootprint,
    string? GlobalIngredientId = null
);

public record UpdateIngredientRequest(
    [Required][StringLength(100)] string Name,
    [Required][StringLength(20)] string Unit,
    [Range(0, double.MaxValue)] decimal CarbonFootprint,
    string? GlobalIngredientId = null
);

// DTO for Global (immutable) ingredients
public record GlobalIngredientDto(
    string Id,
    string Name,
    string Unit,
    decimal CarbonFootprint,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
