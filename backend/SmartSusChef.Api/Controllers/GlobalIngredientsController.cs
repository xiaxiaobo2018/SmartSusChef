using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSusChef.Api.DTOs;
using SmartSusChef.Api.Services;

namespace SmartSusChef.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GlobalIngredientsController : ControllerBase
{
    private readonly IGlobalIngredientService _service;

    public GlobalIngredientsController(IGlobalIngredientService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<GlobalIngredientDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<GlobalIngredientDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }
}
