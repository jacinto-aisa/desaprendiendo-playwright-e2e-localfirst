using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class VerbosHttpTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public VerbosHttpTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        private HttpClient CreateClient() => new HttpClient { BaseAddress = new Uri(Env.API_BASE_URL) };

        [Fact]
        public async Task GetLeeCursosPorTecnologia()
        {
            using var client = CreateClient();
            var response = await client.GetAsync("/api/cursos?tecnologia=Azure");
            Assert.Equal(200, (int)response.StatusCode);
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            Assert.True(root.GetProperty("total").GetInt32() > 0);
            Assert.True(root.GetProperty("data")[0].TryGetProperty("titulo", out _));
        }

        [Fact]
        public async Task PostCreaUnaSolicitudDeCurso()
        {
            using var client = CreateClient();
            var payload = new { nombre = "Ana García", email = "ana@example.com", curso = "Playwright E2E Profesional" };
            var response = await client.PostAsJsonAsync("/api/solicitudes", payload);
            Assert.Equal(201, (int)response.StatusCode);
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            Assert.Matches("^sol-", body.GetProperty("id").GetString());
            Assert.Equal("ana@example.com", body.GetProperty("email").GetString());
        }

        [Fact]
        public async Task PutReemplazaUnCursoCompleto()
        {
            using var client = CreateClient();
            var payload = new
            {
                titulo = "Playwright E2E Profesional",
                tecnologia = "Playwright",
                nivel = "Avanzado",
                cliente = "Desaprendiendo",
                duracionHoras = 32,
                tags = new[] { "Playwright", "Testing", "Avanzado" }
            };
            var response = await client.PutAsJsonAsync("/api/cursos/playwright-lab", payload);
            Assert.Contains((int)response.StatusCode, new[] { 200, 201 });
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            Assert.Equal("playwright-lab", body.GetProperty("id").GetString());
            Assert.Contains("Playwright", body.GetProperty("titulo").GetString());
        }

        [Fact]
        public async Task PatchModificaParcialmenteUnCurso()
        {
            using var client = CreateClient();
            var createPayload = new
            {
                titulo = "Curso para patch",
                tecnologia = "Playwright",
                nivel = "Inicial",
                cliente = "Desaprendiendo",
                duracionHoras = 10,
                tags = new[] { "Playwright" }
            };
            await client.PutAsJsonAsync("/api/cursos/curso-patch-lab", createPayload);

            var patchPayload = new { nivel = "Enterprise" };
            var request = new HttpRequestMessage(new HttpMethod("PATCH"), "/api/cursos/curso-patch-lab")
            {
                Content = new StringContent(JsonSerializer.Serialize(patchPayload), Encoding.UTF8, "application/json")
            };
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            Assert.Equal("Enterprise", body.GetProperty("nivel").GetString());
            Assert.Equal("Curso para patch", body.GetProperty("titulo").GetString());
        }

        [Fact]
        public async Task DeleteEliminaSolicitudDePrueba()
        {
            using var client = CreateClient();
            var createPayload = new { nombre = "Temporal", email = "temporal@example.com", curso = "Playwright" };
            var create = await client.PostAsJsonAsync("/api/solicitudes", createPayload);
            create.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await create.Content.ReadAsStreamAsync());
            var id = doc.RootElement.GetProperty("id").GetString();

            var deleted = await client.DeleteAsync($"/api/solicitudes/{id}");
            Assert.Contains((int)deleted.StatusCode, new[] { 200, 204 });
        }

        [Fact]
        public async Task HeadValidaCabecerasSinDescargarBody()
        {
            using var client = CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Head, "/api/cursos");
            var response = await client.SendAsync(request);
            Assert.Equal(200, (int)response.StatusCode);
            Assert.Contains("application/json", response.Content.Headers.ContentType.MediaType);
            Assert.True(response.Headers.Contains("cache-control"));
        }

        [Fact]
        public async Task OptionsMuestraMetodosPermitidos()
        {
            using var client = CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Options, "/api/cursos");
            var response = await client.SendAsync(request);
            Assert.InRange((int)response.StatusCode, 100, 499);
            if (response.Headers.TryGetValues("Allow", out var allowValues))
            {
                var allow = string.Join(",", allowValues);
                Assert.Contains("GET", allow);
                Assert.Contains("POST", allow);
                Assert.Contains("HEAD", allow);
            }
        }
    }
}
