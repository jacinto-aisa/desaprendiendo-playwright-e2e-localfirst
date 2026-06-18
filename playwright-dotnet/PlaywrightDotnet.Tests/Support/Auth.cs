using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.Support
{
    public static class Auth
    {
        public static async Task<string> ObtenerTokenAsync()
        {
            using var client = new HttpClient { BaseAddress = new Uri(Env.API_BASE_URL) };

            var payload = new
            {
                email = Environment.GetEnvironmentVariable("E2E_USER") ?? "alumno@desaprendiendo.net",
                password = Environment.GetEnvironmentVariable("E2E_PASS") ?? "Password123",
            };

            var response = await client.PostAsJsonAsync("/auth/login", payload);
            response.EnsureSuccessStatusCode();

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            if (doc.RootElement.TryGetProperty("token", out var tokenProp))
            {
                return tokenProp.GetString() ?? string.Empty;
            }

            throw new InvalidOperationException("Respuesta de login sin token");
        }
    }
}
