using System.Security.Cryptography;

namespace DigitalGradebook.WebApi
{
    public static class PasswordHelper
    {
        private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

        public static string GenerateSecurePassword(int length = 16)
        {
            var bytes = new byte[length];
            RandomNumberGenerator.Fill(bytes);
            return new string(bytes.Select(b => Chars[b % Chars.Length]).ToArray());
        }
    }
}
