using System;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.Fixtures
{
    public class AppFixtures : PlaywrightFixture
    {
        public string Target { get; private set; }

        public new async Task InitializeAsync()
        {
            await base.InitializeAsync();
            Target = Environment.GetEnvironmentVariable("E2E_TARGET") ?? "local";
        }
    }
}
