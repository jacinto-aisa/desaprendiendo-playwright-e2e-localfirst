using System.Threading.Tasks;
using PlaywrightDotnet.Tests.ApiClients;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class CursosApiClientTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public CursosApiClientTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task ApiClientAutenticadoBuscaCursosAzure()
        {
            var token = await PlaywrightDotnet.Tests.Support.Auth.ObtenerTokenAsync();
            var client = new CursosApiClient(Env.API_BASE_URL, token);
            var result = await client.BuscarPorTecnologiaAsync("Azure");
            Assert.True(result.TryGetProperty("total", out _));
            var data = result.GetProperty("data");
            Assert.True(data.GetArrayLength() > 0);
            Assert.True(data[0].TryGetProperty("titulo", out _));
        }
    }
}
