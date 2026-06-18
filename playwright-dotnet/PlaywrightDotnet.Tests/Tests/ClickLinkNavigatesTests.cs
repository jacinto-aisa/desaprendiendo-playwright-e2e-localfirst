using System.Threading.Tasks;
using Microsoft.Playwright;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class ClickLinkNavigatesTests
    {
        [Fact]
        public async Task ClickMoreInformationLink_NavigatesToIana()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
            var context = await browser.NewContextAsync();
            var page = await context.NewPageAsync();

            await page.GotoAsync("https://example.com");

            // The page has a single link; click it and wait for navigation
            await Task.WhenAll(
                page.WaitForNavigationAsync(),
                page.ClickAsync("a")
            );

            Assert.Contains("iana.org", page.Url);
        }
    }
}
