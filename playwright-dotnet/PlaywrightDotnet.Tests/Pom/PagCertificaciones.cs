using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Pom
{
    public class PagCertificaciones : PaginaBase
    {
        public PagCertificaciones(IPage page) : base(page, "/certificaciones.html", "Certificaciones") { }
    }
}
