using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class ApiContratoAuthTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public ApiContratoAuthTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        private HttpClient CreateClient() => new HttpClient { BaseAddress = new Uri(Env.API_BASE_URL) };

        [Fact]
        public async Task ValidaContratoMinimoDeCursos()
        {
            using var client = CreateClient();
            var response = await client.GetAsync($"/api/cursos?tecnologia=Azure");
            response.EnsureSuccessStatusCode();

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            Assert.True(root.TryGetProperty("total", out _));
            Assert.True(root.TryGetProperty("data", out _));
            var data = root.GetProperty("data");
            for (int i = 0; i < Math.Min(5, data.GetArrayLength()); i++)
            {
                var curso = data[i];
                Assert.True(curso.TryGetProperty("id", out _));
                Assert.True(curso.TryGetProperty("titulo", out _));
                Assert.True(curso.TryGetProperty("tecnologia", out _));
            }
        }

        [Fact]
        public async Task LoginFakeDevuelveTokenYPermiteApiPrivada()
        {
            var token = await PlaywrightDotnet.Tests.Support.Auth.ObtenerTokenAsync();
            using var client = CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.GetAsync("/api/private/me");
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            Assert.True(body.GetProperty("user").GetProperty("email").GetString().Contains("@"));
        }

        [Fact]
        public async Task BasicAuthPermiteAccederAApiPrivada()
        {
            using var client = CreateClient();
            var basic = Convert.ToBase64String(Encoding.UTF8.GetBytes("demo:demo123"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", basic);
            var response = await client.GetAsync("/api/private");
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task ApiKeyPermiteAccederAApiPrivada()
        {
            using var client = CreateClient();
            var apiKey = Environment.GetEnvironmentVariable("COURSES_API_KEY") ?? "key-local";
            client.DefaultRequestHeaders.Add("x-api-key", apiKey);
            var response = await client.GetAsync("/api/private");
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task ODataFiltraYSeleccionaCampos()
        {
            using var client = CreateClient();
            var uri = "/odata/cursos?$filter=" + Uri.EscapeDataString("tecnologia eq 'Azure'") + "&$select=id,titulo,tecnologia&$top=3";
            var response = await client.GetAsync(uri);
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            Assert.True(root.GetProperty("value").GetArrayLength() > 0);
            var first = root.GetProperty("value")[0];
            Assert.True(first.TryGetProperty("titulo", out _));
            Assert.False(first.TryGetProperty("cliente", out _));
        }

        [Fact]
        public async Task GraphQLDevuelveCursosPorVariableTecnologia()
        {
            using var client = CreateClient();
            var payload = new
            {
                query = "query Cursos($tecnologia: String!) { cursos(tecnologia: $tecnologia) { id titulo tecnologia } }",
                variables = new { tecnologia = "Azure" }
            };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/graphql", content);
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            var cursos = root.GetProperty("data").GetProperty("cursos");
            Assert.True(cursos.GetArrayLength() > 0);
            Assert.True(cursos[0].TryGetProperty("titulo", out _));
        }
    }
}
