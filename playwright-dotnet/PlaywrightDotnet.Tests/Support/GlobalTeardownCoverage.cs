using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.Support
{
    public static class GlobalTeardownCoverage
    {
        public static bool CoberturaActivada() => (Environment.GetEnvironmentVariable("E2E_COVERAGE") ?? "0") == "1";

        public static async Task GuardarCoberturaApiAsync(JsonElement coverage)
        {
            if (coverage.ValueKind == JsonValueKind.Object && coverage.EnumerateObject().MoveNext())
            {
                var carpetaSalida = Path.Combine(Directory.GetCurrentDirectory(), ".nyc_output");
                Directory.CreateDirectory(carpetaSalida);
                var rutaFichero = Path.Combine(carpetaSalida, $"playwright-api-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}.json");
                await File.WriteAllTextAsync(rutaFichero, JsonSerializer.Serialize(coverage));
            }
        }

        public static async Task EjecutarAsync()
        {
            if (!CoberturaActivada()) return;

            try
            {
                using var client = new HttpClient { BaseAddress = new Uri(Env.API_BASE_URL) };
                var response = await client.GetAsync("/__coverage__");
                if (!response.IsSuccessStatusCode) return;
                using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
                await GuardarCoberturaApiAsync(doc.RootElement);
            }
            catch
            {
                // No bloquear tests por errores de recogida de cobertura
            }
        }
    }
}
