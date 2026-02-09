using SmartSusChef.Api.DTOs;

namespace SmartSusChef.Api.Services;

public interface IGlobalIngredientService
{
    Task<List<GlobalIngredientDto>> GetAllAsync();
    Task<GlobalIngredientDto?> GetByIdAsync(Guid id);
}
