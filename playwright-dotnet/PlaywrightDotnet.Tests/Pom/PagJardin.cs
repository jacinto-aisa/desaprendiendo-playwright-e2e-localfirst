using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagJardin : PaginaBase
    {
        public PagJardin(IPage page) : base(page, "/jardin.html", "Jardín") { }
    }
}
