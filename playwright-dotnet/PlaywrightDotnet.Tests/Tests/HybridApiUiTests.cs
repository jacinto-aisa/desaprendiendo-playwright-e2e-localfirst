using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class HybridApiUiTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public HybridApiUiTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task DevuelveContratoMinimoDeCursosYLoValidaEnUI()
        {
            if (!EntornoE2E.EsLocalFirst()) return;

            using var client = new HttpClient { BaseAddress = new System.Uri(Env.API_BASE_URL) };
            var response = await client.GetAsync("/api/cursos?tecnologia=Azure");
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            var titulo = body.GetProperty("data")[0].GetProperty("titulo").GetString();

            await fixture.Page.GotoAsync("/cursos_graph.html");
            var locator = fixture.Page.GetByText(titulo ?? string.Empty).First;
            await locator.WaitForAsync();
        }

        [Fact]
        public async Task ConsultaApiYValidaQueUILocalMuestraFormacionRelacionada()
        {
            if (!EntornoE2E.EsLocalFirst()) return;

            using var client = new HttpClient { BaseAddress = new System.Uri(Env.API_BASE_URL) };
            var response = await client.GetAsync("/api/cursos?tecnologia=Azure");
            response.EnsureSuccessStatusCode();
            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var body = doc.RootElement;
            Assert.True(body.GetProperty("total").GetInt32() > 0);

            await fixture.Page.GotoAsync("/cursos.html");
            var locator = fixture.Page.GetByText("Azure").First;
            await locator.WaitForAsync();
        }
    }
}
