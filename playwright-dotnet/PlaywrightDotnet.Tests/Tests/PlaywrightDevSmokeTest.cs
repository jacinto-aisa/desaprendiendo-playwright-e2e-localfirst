using System.Threading.Tasks;
using Microsoft.Playwright;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class PlaywrightDevSmokeTest
    {
        [Fact]
        public async Task PlaywrightDev_HasGetStartedSection()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
            var context = await browser.NewContextAsync();
            var page = await context.NewPageAsync();

            await page.GotoAsync("https://playwright.dev");

            var content = await page.ContentAsync();

            Assert.Contains("Get started", content, System.StringComparison.OrdinalIgnoreCase);
        }
    }
}
