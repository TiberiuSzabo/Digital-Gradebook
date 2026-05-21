using DigitalGradebook.Repository;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.WebApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("https://0.0.0.0:5242", "http://0.0.0.0:5241");

builder.Services.AddControllers();
builder.Services.AddSingleton<DigitalGradebook.Repository.ChatRepository>();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=gradebook.db",
    b => b.MigrationsAssembly("DigitalGradebook.Repository")));

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
    options.RequireHttpsMetadata = true; // Forțează securitatea (HTTPS)
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, // Sesiunea expiră după timpul dat în appsettings (30 min)
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
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

// 🥉 BRONZE CHALLENGE: Redirecționare forțată spre HTTPS
app.UseHttpsRedirection();

app.UseCors("AllowReact");

// JWT necesită activarea autentificării înainte de autorizare
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GeneratorHub>("/generatorHub");
app.MapHub<DigitalGradebook.WebApi.Hubs.ChatHub>("/chatHub");

app.Run();