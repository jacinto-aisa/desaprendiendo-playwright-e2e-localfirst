using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagInicio : PaginaBase
    {
        public PagInicio(IPage page) : base(page, "/index.html", "Inicio") { }

        public async Task<bool> EstaImagenFotoVisibleAsync()
        {
            return await Page.GetByAltText("Jacinto Aisa Ibañez").IsVisibleAsync();
        }

        public async Task<string?> RecuperarNombreAsync()
        {
            return await Page.GetByRole(AriaRole.Heading, new PageGetByRoleOptions { Name = "Jacinto Aisa Ibañez" }).TextContentAsync();
        }
    }
}
