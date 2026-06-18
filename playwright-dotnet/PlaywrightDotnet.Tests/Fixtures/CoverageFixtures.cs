using System;
using System.Threading.Tasks;

namespace PlaywrightDotnet.Tests.Fixtures
{
    public class CoverageFixtures : PlaywrightFixture
    {
        public bool CoverageEnabled { get; private set; }

        public new async Task InitializeAsync()
        {
            await base.InitializeAsync();
            var env = Environment.GetEnvironmentVariable("E2E_COVERAGE") ?? "0";
            CoverageEnabled = env == "1" || env.Equals("true", StringComparison.OrdinalIgnoreCase);
        }
    }
}
