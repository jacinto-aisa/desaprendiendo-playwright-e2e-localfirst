using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagMetodo : PaginaBase
    {
        public PagMetodo(IPage page) : base(page, "/metodo_docente.html", "Método") { }
    }
}
