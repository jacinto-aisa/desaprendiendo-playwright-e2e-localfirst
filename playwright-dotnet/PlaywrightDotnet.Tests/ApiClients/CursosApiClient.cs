using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.ApiClients
{
    public class CursosApiClient
    {
        private readonly HttpClient client;

        public CursosApiClient(string baseUrl, string? token = null)
        {
            client = new HttpClient { BaseAddress = new Uri(baseUrl) };
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<JsonElement> BuscarPorTecnologiaAsync(string tecnologia)
        {
            var response = await client.GetAsync($"/api/cursos?tecnologia={Uri.EscapeDataString(tecnologia)}");
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            return doc.RootElement.Clone();
        }
    }
}
