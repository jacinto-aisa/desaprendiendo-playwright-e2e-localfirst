using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagClientes : PaginaBase
    {
        public PagClientes(IPage page) : base(page, "/clientes.html", "Clientes") { }
    }
}
