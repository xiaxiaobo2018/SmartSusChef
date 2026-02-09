using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartSusChef.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GlobalCalendarSignals",
                columns: table => new
                {
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsHoliday = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    HolidayName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsSchoolHoliday = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    RainMm = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    WeatherDesc = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalCalendarSignals", x => x.Date);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GlobalIngredients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Unit = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CarbonFootprint = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    IsDefault = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalIngredients", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HolidayCalendars",
                columns: table => new
                {
                    CountryCode = table.Column<string>(type: "varchar(2)", maxLength: 2, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    HolidaysJson = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HolidayCalendars", x => new { x.CountryCode, x.Year });
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Store",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UEN = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StoreName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OutletLocation = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OpeningDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: false),
                    CountryCode = table.Column<string>(type: "varchar(2)", maxLength: 2, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactNumber = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Store", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Ingredients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Unit = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CarbonFootprint = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    GlobalIngredientId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ingredients_GlobalIngredients_GlobalIngredientId",
                        column: x => x.GlobalIngredientId,
                        principalTable: "GlobalIngredients",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Ingredients_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsSubRecipe = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsSellable = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recipes_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserStatus = table.Column<string>(type: "longtext", nullable: false, defaultValue: "Active")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WeatherDaily",
                columns: table => new
                {
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Temperature = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Condition = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Humidity = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeatherDaily", x => new { x.StoreId, x.Date });
                    table.ForeignKey(
                        name: "FK_WeatherDaily_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ForecastData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    RecipeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ForecastDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PredictedQuantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForecastData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForecastData_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ForecastData_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RecipeIngredients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RecipeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IngredientId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ChildRecipeId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeIngredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Recipes_ChildRecipeId",
                        column: x => x.ChildRecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SalesData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    RecipeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesData_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SalesData_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WastageData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StoreId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IngredientId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    RecipeId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WastageData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WastageData_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WastageData_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WastageData_Store_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Store",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "GlobalIngredients",
                columns: new[] { "Id", "CarbonFootprint", "CreatedAt", "IsDefault", "Name", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("a0000000-0000-0000-0000-000000000001"), 1.10m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2771), true, "Tomato", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2772) },
                    { new Guid("a0000000-0000-0000-0000-000000000002"), 13.50m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2775), true, "Cheese", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2776) },
                    { new Guid("a0000000-0000-0000-0000-000000000003"), 0.95m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2779), true, "Flour", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2779) },
                    { new Guid("a0000000-0000-0000-0000-000000000004"), 2.70m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2782), true, "Rice", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2783) },
                    { new Guid("a0000000-0000-0000-0000-000000000005"), 27.00m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2786), true, "Beef", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2786) },
                    { new Guid("a0000000-0000-0000-0000-000000000006"), 12.10m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2789), true, "Pork", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2789) },
                    { new Guid("a0000000-0000-0000-0000-000000000007"), 6.90m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2792), true, "Chicken", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2800) },
                    { new Guid("a0000000-0000-0000-0000-000000000008"), 0.50m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2803), true, "Lettuce", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2804) },
                    { new Guid("a0000000-0000-0000-0000-000000000009"), 0.30m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2807), true, "Potato", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2808) },
                    { new Guid("a0000000-0000-0000-0000-00000000000a"), 0.70m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2811), true, "Onion", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2812) },
                    { new Guid("a0000000-0000-0000-0000-00000000000b"), 1.50m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2815), true, "Garlic", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2815) },
                    { new Guid("a0000000-0000-0000-0000-00000000000c"), 1.80m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2818), true, "Sugar", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2818) },
                    { new Guid("a0000000-0000-0000-0000-00000000000d"), 11.90m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2822), true, "Butter", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2822) },
                    { new Guid("a0000000-0000-0000-0000-00000000000e"), 1.90m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2825), true, "Milk", "L", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2826) },
                    { new Guid("a0000000-0000-0000-0000-00000000000f"), 0.30m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2829), true, "Egg", "pcs", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2829) },
                    { new Guid("a0000000-0000-0000-0000-000000000010"), 6.00m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2832), true, "Olive Oil", "L", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2833) },
                    { new Guid("a0000000-0000-0000-0000-000000000011"), 2.20m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2851), true, "Soy Sauce", "L", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2851) },
                    { new Guid("a0000000-0000-0000-0000-000000000012"), 0.05m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2855), true, "Salt", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2855) },
                    { new Guid("a0000000-0000-0000-0000-000000000013"), 8.00m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2867), true, "Pepper", "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2867) }
                });

            migrationBuilder.InsertData(
                table: "Store",
                columns: new[] { "Id", "Address", "CompanyName", "ContactNumber", "CountryCode", "CreatedAt", "IsActive", "Latitude", "Longitude", "OpeningDate", "OutletLocation", "StoreName", "UEN", "UpdatedAt" },
                values: new object[] { 1, null, "Smart Sus Chef Corp", "+65 6000 0000", null, new DateTime(2026, 2, 9, 6, 52, 24, 826, DateTimeKind.Utc).AddTicks(644), true, 0m, 0m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "123 Orchard Road", "Downtown Outlet", "202400001A", new DateTime(2026, 2, 9, 6, 52, 24, 826, DateTimeKind.Utc).AddTicks(646) });

            migrationBuilder.InsertData(
                table: "Ingredients",
                columns: new[] { "Id", "CarbonFootprint", "CreatedAt", "GlobalIngredientId", "Name", "StoreId", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), 1.1m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2139), null, "Tomato", 1, "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2139) },
                    { new Guid("44444444-4444-4444-4444-444444444444"), 13.5m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2143), null, "Cheese", 1, "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2144) },
                    { new Guid("55555555-5555-5555-5555-555555555555"), 0.9m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2146), null, "Dough", 1, "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2147) },
                    { new Guid("66666666-6666-6666-6666-666666666666"), 0.5m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2149), null, "Lettuce", 1, "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2150) },
                    { new Guid("77777777-7777-7777-7777-777777777777"), 27.0m, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2152), null, "Beef", 1, "kg", new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2153) }
                });

            migrationBuilder.InsertData(
                table: "Recipes",
                columns: new[] { "Id", "CreatedAt", "IsSellable", "IsSubRecipe", "Name", "StoreId", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2314), false, false, "Margherita Pizza", 1, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2316) },
                    { new Guid("99999999-9999-9999-9999-999999999999"), new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2318), false, false, "Beef Burger", 1, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(2318) }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "Name", "PasswordHash", "Role", "StoreId", "UpdatedAt", "UserStatus", "Username" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 9, 6, 52, 24, 982, DateTimeKind.Utc).AddTicks(6576), "", "Administrator", "$2a$11$ILGJIiRwrLF54nvgfjB0me73ZizNzeRyySZlYkOiKL6v7qKvLIWoe", "Manager", 1, new DateTime(2026, 2, 9, 6, 52, 24, 982, DateTimeKind.Utc).AddTicks(6583), "Active", "admin" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(1471), "", "Employee User", "$2a$11$gJFernJcrgvg.TEo7eA2IONHxA8SChtMBOuWHtZws5rLwdGpdXjNG", "Employee", 1, new DateTime(2026, 2, 9, 6, 52, 25, 152, DateTimeKind.Utc).AddTicks(1476), "Active", "employee" }
                });

            migrationBuilder.InsertData(
                table: "RecipeIngredients",
                columns: new[] { "Id", "ChildRecipeId", "IngredientId", "Quantity", "RecipeId" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), null, new Guid("55555555-5555-5555-5555-555555555555"), 0.3m, new Guid("88888888-8888-8888-8888-888888888888") },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), null, new Guid("33333333-3333-3333-3333-333333333333"), 0.2m, new Guid("88888888-8888-8888-8888-888888888888") },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), null, new Guid("44444444-4444-4444-4444-444444444444"), 0.15m, new Guid("88888888-8888-8888-8888-888888888888") },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), null, new Guid("77777777-7777-7777-7777-777777777777"), 0.2m, new Guid("99999999-9999-9999-9999-999999999999") },
                    { new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), null, new Guid("66666666-6666-6666-6666-666666666666"), 0.05m, new Guid("99999999-9999-9999-9999-999999999999") },
                    { new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff"), null, new Guid("33333333-3333-3333-3333-333333333333"), 0.05m, new Guid("99999999-9999-9999-9999-999999999999") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ForecastData_RecipeId",
                table: "ForecastData",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_ForecastData_StoreId",
                table: "ForecastData",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalIngredients_Name",
                table: "GlobalIngredients",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_GlobalIngredientId",
                table: "Ingredients",
                column: "GlobalIngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_StoreId_Name",
                table: "Ingredients",
                columns: new[] { "StoreId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_ChildRecipeId",
                table: "RecipeIngredients",
                column: "ChildRecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_IngredientId",
                table: "RecipeIngredients",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_RecipeId",
                table: "RecipeIngredients",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_StoreId_Name",
                table: "Recipes",
                columns: new[] { "StoreId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesData_RecipeId",
                table: "SalesData",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesData_StoreId_Date_RecipeId",
                table: "SalesData",
                columns: new[] { "StoreId", "Date", "RecipeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_StoreId",
                table: "Users",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WastageData_IngredientId",
                table: "WastageData",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_WastageData_RecipeId",
                table: "WastageData",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_WastageData_StoreId",
                table: "WastageData",
                column: "StoreId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ForecastData");

            migrationBuilder.DropTable(
                name: "GlobalCalendarSignals");

            migrationBuilder.DropTable(
                name: "HolidayCalendars");

            migrationBuilder.DropTable(
                name: "RecipeIngredients");

            migrationBuilder.DropTable(
                name: "SalesData");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WastageData");

            migrationBuilder.DropTable(
                name: "WeatherDaily");

            migrationBuilder.DropTable(
                name: "Ingredients");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "GlobalIngredients");

            migrationBuilder.DropTable(
                name: "Store");
        }
    }
}
