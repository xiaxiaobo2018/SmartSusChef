using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartSusChef.Api.Models;

public class Ingredient
{
    public Guid Id { get; set; }
    // Foreign Key for the Store
    public int StoreId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Unit { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal CarbonFootprint { get; set; } // kg CO2 per unit
    
    // Optional reference to a global ingredient
    [ForeignKey("GlobalIngredient")]
    public Guid? GlobalIngredientId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    // Link to the Store entity
    public Store Store { get; set; } = null!;
    // Reference to global ingredient if applicable
    public GlobalIngredient? GlobalIngredient { get; set; }
    public ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
    public ICollection<WastageData> WastageRecords { get; set; } = new List<WastageData>();
}
