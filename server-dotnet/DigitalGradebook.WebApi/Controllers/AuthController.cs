using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using DigitalGradebook.Service;
using BCrypt.Net;

namespace DigitalGradebook.WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLoggerService _auditLogger;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public AuthController(ApplicationDbContext context, IAuditLoggerService auditLogger, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _auditLogger = auditLogger;
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // EF Core parametrizează automat toate query-urile — nu e nevoie de filtrare manuală.
            // Căutăm userul după username.
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            // Verificăm parola cu BCrypt. BCrypt.Verify e constant-time, deci nu e vulnerabil la timing attacks.
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                if (user != null)
                {
                    await _auditLogger.FlagSuspiciousUserAsync(
                        user.Id.ToString(), user.Username, user.Role.Name, "Parola gresita.");
                }
                return Unauthorized(new { message = "Email sau parola incorecta!" });
            }

            string emailLower = user.Username.ToLower();
            bool isRealEmail = emailLower.EndsWith("@gmail.com") || emailLower.Contains("@yahoo.");

            if (isRealEmail)
            {
                // Folosim RandomNumberGenerator în loc de Random — este criptografic sigur
                user.TwoFactorCode = System.Security.Cryptography.RandomNumberGenerator
                    .GetInt32(100000, 999999).ToString();
                user.TwoFactorExpiry = DateTime.UtcNow.AddMinutes(5);
                await _context.SaveChangesAsync();

                string subiect = "Codul tau de securitate Digital Gradebook";
                string mesaj = $"Salutare! Codul tau pentru pasul 2 al autentificarii este: {user.TwoFactorCode}";

                await SendEmailViaBrevo(user.Username, subiect, mesaj);

                Console.WriteLine($"\n=======================================================");
                Console.WriteLine($"[3FA CONT REAL] Cod generat pentru {user.Username}: {user.TwoFactorCode}");
                Console.WriteLine($"=======================================================\n");

                return Ok(new { requires3FA = true, message = "Cont protejat prin 3FA. Codul de securitate a fost expediat pe email!" });
            }
            else
            {
                var token = GenerateJwtToken(user);
                await _auditLogger.LogActionAsync(user.Id.ToString(), user.Role.Name, "Logare directa pentru domeniu simulat.");

                return Ok(new
                {
                    token = token,
                    id = user.Id,
                    username = user.Username,
                    role = user.Role.Name,
                    studentId = user.StudentId,
                    requires3FA = false
                });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Email))
                return BadRequest(new { message = "Email-ul există deja în baza de date!" });

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
            if (role == null) return BadRequest(new { message = "Rol invalid!" });

            var newUser = new User
            {
                Username = request.Email,
                // Hash-uim parola înainte de a o salva
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = role.Id
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(newUser.Id.ToString(), role.Name, "Cont nou înregistrat via Register.");

            return Ok(new { success = true, message = "Cont creat cu succes!" });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || user.TwoFactorCode != request.Code || user.TwoFactorExpiry < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Codul de securitate este invalid sau a expirat!" });
            }

            user.TwoFactorCode = null;
            user.TwoFactorExpiry = null;
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(user.Id.ToString(), user.Role.Name, "A trecut de pasul de email 2FA.");

            return Ok(new { requiresPin = true, message = "Cod corect. Introduceti PIN-ul de securitate." });
        }

        [HttpPost("verify-pin")]
        public async Task<IActionResult> VerifyPin([FromBody] VerifyPinRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null) return Unauthorized(new { message = "Utilizatorul nu a fost găsit!" });

            // Dacă hash-ul e gol, PIN-ul nu a fost configurat încă
            if (string.IsNullOrEmpty(user.SecurityPinHash))
                return Ok(new { requiresPinSetup = true, message = "Trebuie să configurați un PIN de securitate înainte de autentificare." });

            if (!BCrypt.Net.BCrypt.Verify(request.Pin, user.SecurityPinHash))
            {
                return Unauthorized(new { message = "PIN-ul de securitate este incorect!" });
            }

            var token = GenerateJwtToken(user);
            await _auditLogger.LogActionAsync(user.Id.ToString(), user.Role.Name, "Autentificare 3FA completa. Sesiune pornita.");

            return Ok(new
            {
                token = token,
                id = user.Id,
                username = user.Username,
                role = user.Role.Name,
                studentId = user.StudentId
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            // Răspundem mereu cu același mesaj — nu dezvăluim dacă emailul există sau nu
            if (user == null)
                return Ok(new { message = "Daca emailul exista in sistem, vei primi un link de resetare." });

            user.ResetToken = Guid.NewGuid().ToString().Replace("-", "")[..8];
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _context.SaveChangesAsync();

            string subiect = "Resetare Parola - Digital Gradebook";
            string mesaj = $"Token-ul tau pentru resetarea parolei este: {user.ResetToken}";
            await SendEmailViaBrevo(user.Username, subiect, mesaj);

            return Ok(new { message = "Daca emailul exista in sistem, vei primi un link de resetare." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(
                u => u.Username == request.Username && u.ResetToken == request.Token);

            if (user == null || user.ResetTokenExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "Token invalid sau expirat!" });

            // Hash-uim noua parolă înainte de salvare
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Parola a fost resetata cu succes!" });
        }

        // -----------------------------------------------------------------------
        // Trimitere email prin Brevo API — cheia vine din appsettings / env vars
        // -----------------------------------------------------------------------
        private async Task<bool> SendEmailViaBrevo(string toEmail, string subject, string body)
        {
            try
            {
                var emailSettings = _config.GetSection("EmailSettings");
                var apiKey = emailSettings["BrevoApiKey"];
                var senderEmail = emailSettings["SenderEmail"];
                var senderName = emailSettings["SenderName"];

                _httpClient.DefaultRequestHeaders.Remove("api-key");
                _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);

                var requestBody = new
                {
                    sender = new { name = senderName, email = senderEmail },
                    to = new[] { new { email = toEmail } },
                    subject = subject,
                    htmlContent = $"<p>{body}</p>"
                };

                var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://api.brevo.com/v3/smtp/email", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[BREVO ERROR]: {error}");
                }

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Eroare trimitere email: {ex.Message}");
                return false;
            }
        }

        // -----------------------------------------------------------------------
        // Generare token JWT
        // -----------------------------------------------------------------------
        [Authorize]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var username = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (username == null) return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return Unauthorized();

            var newToken = GenerateJwtToken(user);
            await _auditLogger.LogActionAsync(user.Id.ToString(), user.Role.Name, "Token reînnoit prin /refresh.");

            return Ok(new { token = newToken });
        }

        [HttpPost("setup-pin")]
        public async Task<IActionResult> SetupPin([FromBody] SetupPinRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
                return NotFound(new { message = "Utilizatorul nu a fost găsit." });

            if (!string.IsNullOrEmpty(user.SecurityPinHash))
                return BadRequest(new { message = "PIN-ul a fost deja configurat. Folosiți resetarea contului." });

            if (request.Pin.Length < 4 || request.Pin.Length > 8 || !request.Pin.All(char.IsDigit))
                return BadRequest(new { message = "PIN-ul trebuie să conțină între 4 și 8 cifre." });

            user.SecurityPinHash = BCrypt.Net.BCrypt.HashPassword(request.Pin);
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(user.Id.ToString(), "SYSTEM", "PIN de securitate configurat pentru prima dată.");

            return Ok(new { message = "PIN-ul a fost setat cu succes! Vă puteți autentifica acum." });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(ClaimTypes.Role, user.Role.Name),
                new Claim("UserId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (user.StudentId.HasValue)
                claims.Add(new Claim("StudentId", user.StudentId.Value.ToString()));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
    public class RegisterRequest { public string Name { get; set; } = string.Empty; public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; public string Role { get; set; } = string.Empty; }
    public class Verify2FARequest { public string Username { get; set; } = string.Empty; public string Code { get; set; } = string.Empty; }
    public class VerifyPinRequest { public string Username { get; set; } = string.Empty; public string Pin { get; set; } = string.Empty; }
    public class ForgotPasswordRequest { public string Username { get; set; } = string.Empty; }
    public class ResetPasswordRequest { public string Username { get; set; } = string.Empty; public string Token { get; set; } = string.Empty; public string NewPassword { get; set; } = string.Empty; }
    public class SetupPinRequest { public string Username { get; set; } = string.Empty; public string Pin { get; set; } = string.Empty; }
}