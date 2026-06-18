using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagCursosGrafico : PaginaBase
    {
        public PagCursosGrafico(IPage page) : base(page, "/cursos_graph", "Mapa de etiquetas (burbujas)") { }

        public ILocator Bubbles() => Page.Locator("#bubbles .bubble");

        public async Task EsperarBurbujasAsync()
        {
            await Page.Locator("#bubbles .bubble").First.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        }

        public async Task ClickBurbujaPorTagAsync(string tag)
        {
            await Page.Locator($"#bubbles .bubble[data-tag=\"{tag}\"]").ClickAsync();
        }

        public async Task EsperarGrupoCursosAsync()
        {
            await Page.Locator(".course-groups").First.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        }
    }
}
