using DigitalGradebook.Repository;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.WebApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// AM STERS: builder.WebHost.UseUrls(...) - Render se va ocupa de porturi automat

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<DigitalGradebook.Repository.ChatRepository>();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=gradebook.db";
    if (connectionString.StartsWith("postgresql") || connectionString.StartsWith("postgres"))
    {
        var npgsqlConnection = ConvertPostgresUrl(connectionString);
        options.UseNpgsql(npgsqlConnection, b => b.MigrationsAssembly("DigitalGradebook.Repository"));
    }
    else
    {
        options.UseSqlite(connectionString, b => b.MigrationsAssembly("DigitalGradebook.Repository"));
    }
});
builder.Services.AddSingleton<GeneratorState>();
builder.Services.AddHostedService<GeneratorWorker>();
builder.Services.AddScoped<DigitalGradebook.Service.IAuditLoggerService, DigitalGradebook.Service.AuditLoggerService>();

// ==========================================
// 🥉 BRONZE CHALLENGE: JWT Tokens & Sessions
// ==========================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Modificat in false! Render ne ofera HTTPS la exterior, in interior merge pe HTTP
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.SetIsOriginAllowed(origin => {
            var uri = new Uri(origin);
            return uri.Host == "localhost" ||
                   uri.Host.StartsWith("192.168.") ||
                   uri.Host.StartsWith("10.") ||
                   uri.Host.StartsWith("172.") ||
                   origin.Contains("onrender.com") ||
                   origin.Contains("netlify.app") ||
                   origin.Contains("vercel.app");
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();
await DataSeeder.SeedRolesAndUsersAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// AM STERS: app.UseHttpsRedirection(); - Render face deja asta. Aici crapa Kestrel-ul.

app.UseCors("AllowReact");

// JWT necesită activarea autentificării înainte de autorizare
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GeneratorHub>("/generatorHub");
app.MapHub<DigitalGradebook.WebApi.Hubs.ChatHub>("/chatHub");

app.Run();

static string ConvertPostgresUrl(string url)
{
    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':');
    return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}