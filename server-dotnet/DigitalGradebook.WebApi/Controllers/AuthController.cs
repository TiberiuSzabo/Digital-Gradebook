using Microsoft.AspNetCore.Authorization; // ADĂUGAT
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net;
using System.Net.Mail;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using DigitalGradebook.Service;

namespace DigitalGradebook.WebApi.Controllers
{
    // 🔓 DESCHIDEM CONTROLLERUL: Oricine (chiar și fără token) trebuie să poată accesa rutele de Login și Register.
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLoggerService _auditLogger;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IAuditLoggerService auditLogger, IConfiguration config)
        {
            _context = context;
            _auditLogger = auditLogger;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request.Username.Contains("'") || request.Username.Contains("OR 1=1") || request.Username.Contains("--"))
            {
                await _auditLogger.FlagSuspiciousUserAsync("UNKNOWN", request.Username, "HACKER", "Tentativa de SQL Injection la Login");
                return Unauthorized(new { message = "Email sau parola incorecta!" });
            }

            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || user.Password != request.Password)
            {
                if (user != null)
                {
                    await _auditLogger.FlagSuspiciousUserAsync(user.Id.ToString(), user.Username, user.Role.Name, "Parola gresita.");
                }
                return Unauthorized(new { message = "Email sau parola incorecta!" });
            }

            string emailLower = user.Username.ToLower();
            bool isRealEmail = emailLower.EndsWith("@gmail.com") || emailLower.Contains("@yahoo.");

            if (isRealEmail)
            {
                user.TwoFactorCode = new Random().Next(100000, 999999).ToString();
                user.TwoFactorExpiry = DateTime.Now.AddMinutes(5);
                await _context.SaveChangesAsync();

                string subiect = "Codul tau de securitate Digital Gradebook";
                string mesaj = $"Salutare! Codul tau pentru pasul 2 al autentificarii este: {user.TwoFactorCode}";

                SendRealEmail(user.Username, subiect, mesaj);

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
                Password = request.Password,
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
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || user.TwoFactorCode != request.Code || user.TwoFactorExpiry < DateTime.Now)
            {
                return Unauthorized(new { message = "Codul de securitate este invalid sau a expirat!" });
            }

            user.TwoFactorCode = null;
            user.TwoFactorExpiry = null;
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(user.Id.ToString(), user.Role.Name, "A trecut de pasul de email.");

            return Ok(new { requiresPin = true, message = "Cod corect. Introduceti PIN-ul de securitate." });
        }

        [HttpPost("verify-pin")]
        public async Task<IActionResult> VerifyPin([FromBody] VerifyPinRequest request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || user.SecurityPin != request.Pin)
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
            if (user == null) return Ok(new { message = "Daca emailul exista in sistem, vei primi un link de resetare." });

            user.ResetToken = Guid.NewGuid().ToString().Substring(0, 8);
            user.ResetTokenExpiry = DateTime.Now.AddHours(1);
            await _context.SaveChangesAsync();

            string subiect = "Resetare Parola - Digital Gradebook";
            string mesaj = $"Token-ul tau pentru resetarea parolei este: {user.ResetToken}";
            SendRealEmail(user.Username, subiect, mesaj);

            return Ok(new { message = "Daca emailul exista in sistem, vei primi un link de resetare." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.ResetToken == request.Token);

            if (user == null || user.ResetTokenExpiry < DateTime.Now)
                return BadRequest(new { message = "Token invalid sau expirat!" });

            user.Password = request.NewPassword;
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Parola a fost resetata cu succes!" });
        }

        private bool SendRealEmail(string toEmail, string subject, string body)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("szaborobert2005@gmail.com", "gqbi kwjq cgpb rqby"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("szaborobert2005@gmail.com", "Digital Gradebook Security"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false,
                };

                mailMessage.To.Add(toEmail);
                smtpClient.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Eroare trimitere email: {ex.Message}");
                return false;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(ClaimTypes.Role, user.Role.Name),
                new Claim("UserId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["ExpirationMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest { public string Username { get; set; } public string Password { get; set; } }
    public class RegisterRequest { public string Name { get; set; } public string Email { get; set; } public string Password { get; set; } public string Role { get; set; } }
    public class Verify2FARequest { public string Username { get; set; } public string Code { get; set; } }
    public class VerifyPinRequest { public string Username { get; set; } public string Pin { get; set; } }
    public class ForgotPasswordRequest { public string Username { get; set; } }
    public class ResetPasswordRequest { public string Username { get; set; } public string Token { get; set; } public string NewPassword { get; set; } }
}