using System;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.Fixtures
{
    public class ApiFixtures : PlaywrightFixture
    {
        public Uri ApiBaseUrl { get; private set; }

        public new async Task InitializeAsync()
        {
            // Llamar al base
            await base.InitializeAsync();

            var apiUrl = Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://127.0.0.1:3001";
            ApiBaseUrl = new Uri(apiUrl);
        }
    }
}
