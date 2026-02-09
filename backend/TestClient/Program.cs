using Microsoft.EntityFrameworkCore;
using SmartSusChef.Api.Data;

// Usage:
// set env var ConnectionStrings__DefaultConnection or pass connection string as first arg
// dotnet run --project backend\TestClient -- "Server=...;Port=...;Database=...;User Id=...;Password=...;"

var conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
if (args.Length > 0) conn = args[0];
if (string.IsNullOrWhiteSpace(conn))
{
    Console.WriteLine("No connection string provided. Set ConnectionStrings__DefaultConnection or pass it as arg.");
    return 1;
}

var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
optionsBuilder.UseMySql(conn, ServerVersion.AutoDetect(conn));

using var context = new ApplicationDbContext(optionsBuilder.Options);

try
{
    var list = await context.GlobalIngredients.OrderBy(g => g.Name).Take(10).ToListAsync();
    Console.WriteLine($"Found {list.Count} global ingredients (showing up to 10):\n");
    foreach (var g in list)
    {
        Console.WriteLine($"{g.Id} | {g.Name} | {g.Unit} | {g.CarbonFootprint}");
    }
    return 0;
}
catch (Exception ex)
{
    Console.WriteLine("Error querying GlobalIngredients: " + ex.Message);
    return 2;
}
