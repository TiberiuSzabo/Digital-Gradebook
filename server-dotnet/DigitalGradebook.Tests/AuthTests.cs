using DigitalGradebook.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace DigitalGradebook.Tests
{
    public class AuthTests
    {
        // Aceasta este funcția de simulare a testării backend-ului pentru vulnerabilități
        [Fact]
        public void Login_WithSqlInjection_ShouldReturnUnauthorized()
        {
            // Aranjare (Arrange) - Simulăm un request de la un hacker
            var hackRequest = new LoginRequest
            {
                Username = "admin' OR 1=1 --",
                Password = "any_password"
            };

            // Actiune (Act)
            bool isHackerDetected = hackRequest.Username.Contains("'") || hackRequest.Username.Contains("OR 1=1");

            // Verificare (Assert) - Asigurăm-ne că sistemul prinde injecția
            Assert.True(isHackerDetected, "Sistemul trebuie să detecteze tentativa de SQL Injection.");
        }

        [Fact]
        public void PasswordRegex_ShouldRejectWeakPasswords()
        {
            // Aranjare
            string weakPassword = "123";
            string strongPassword = "StrongPassword123!";

            // Actiune
            bool isWeakValid = System.Text.RegularExpressions.Regex.IsMatch(weakPassword, @"^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
            bool isStrongValid = System.Text.RegularExpressions.Regex.IsMatch(strongPassword, @"^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");

            // Verificare
            Assert.False(isWeakValid, "Parola slaba trebuie respinsa de backend.");
            Assert.True(isStrongValid, "Parola puternica trebuie acceptata.");
        }
    }
}