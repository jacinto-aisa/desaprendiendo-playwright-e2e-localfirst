using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagExperiencia : PaginaBase
    {
        public PagExperiencia(IPage page) : base(page, "/experiencia.html", "Experiencia") { }
    }
}
