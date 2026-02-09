using Microsoft.EntityFrameworkCore;
using SmartSusChef.Api.Data;
using SmartSusChef.Api.DTOs;
using SmartSusChef.Api.Models;

namespace SmartSusChef.Api.Services;

public class GlobalIngredientService : IGlobalIngredientService
{
    private readonly ApplicationDbContext _context;

    public GlobalIngredientService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GlobalIngredientDto>> GetAllAsync()
    {
        var items = await _context.GlobalIngredients
            .OrderBy(g => g.Name)
            .ToListAsync();

        return items.Select(g => MapToDto(g)).ToList();
    }

    public async Task<GlobalIngredientDto?> GetByIdAsync(Guid id)
    {
        var g = await _context.GlobalIngredients.FindAsync(id);
        return g == null ? null : MapToDto(g);
    }

    private static GlobalIngredientDto MapToDto(GlobalIngredient g)
    {
        return new GlobalIngredientDto(
            g.Id.ToString(),
            g.Name,
            g.Unit,
            g.CarbonFootprint,
            g.CreatedAt,
            g.UpdatedAt
        );
    }
}
