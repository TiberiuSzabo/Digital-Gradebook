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
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("DigitalGradebook.Repository")
    ).ConfigureWarnings(w => w.Ignore(
        Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning
    )));
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
    // SignalR trimite token-ul ca query-param ?access_token= (WebSocket nu suporta Authorization header)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/chatHub") || path.StartsWithSegments("/generatorHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://localhost:5173",
            "https://digital-gradebook-nu.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();

    // Ensure admin and superadmin accounts exist with correct BCrypt hashes
    var teacherRole = db.Roles.FirstOrDefault(r => r.Name == "Teacher");
    var adminRole = db.Roles.FirstOrDefault(r => r.Name == "Admin");

    if (teacherRole != null && !db.Users.Any(u => u.Username == "admin"))
    {
        db.Users.Add(new DigitalGradebook.Domain.Entities.User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            RoleId = teacherRole.Id,
            SecurityPinHash = BCrypt.Net.BCrypt.HashPassword("1234")
        });
    }

    if (adminRole != null && !db.Users.Any(u => u.Username == "superadmin"))
    {
        db.Users.Add(new DigitalGradebook.Domain.Entities.User
        {
            Username = "superadmin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            RoleId = adminRole.Id,
            SecurityPinHash = BCrypt.Net.BCrypt.HashPassword("1234")
        });
    }

    await db.SaveChangesAsync();
}

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

app.MapControllers().RequireCors("AllowReact");
app.MapHub<GeneratorHub>("/generatorHub");
app.MapHub<DigitalGradebook.WebApi.Hubs.ChatHub>("/chatHub").RequireCors("AllowReact");

app.Run();
