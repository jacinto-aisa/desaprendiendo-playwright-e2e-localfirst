using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class CursosRestTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public CursosRestTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task DevuelveContratoMinimoDeCursos()
        {
            using var client = new HttpClient { BaseAddress = new System.Uri(Env.API_BASE_URL) };
            var response = await client.GetAsync("/api/cursos?tecnologia=Azure");
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            Assert.True(root.TryGetProperty("total", out _));
            Assert.True(root.TryGetProperty("data", out _));
            Assert.True(root.GetProperty("data").ValueKind == JsonValueKind.Array);
            var data = root.GetProperty("data");
            for (int i = 0; i < System.Math.Min(3, data.GetArrayLength()); i++)
            {
                var curso = data[i];
                Assert.True(curso.TryGetProperty("id", out _));
                Assert.True(curso.TryGetProperty("titulo", out _));
                Assert.False(curso.TryGetProperty("password", out _));
            }
        }
    }
}
