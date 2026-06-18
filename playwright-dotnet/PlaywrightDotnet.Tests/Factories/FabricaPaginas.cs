using Microsoft.Playwright;
using PlaywrightDotnet.Tests.Pom;

namespace PlaywrightDotnet.Tests.Factories
{
    public class FabricaPaginas
    {
        private readonly IPage page;

        public FabricaPaginas(IPage page)
        {
            this.page = page;
        }

        public PagInicio CrearInicio() => new PagInicio(page);
        public PagClientes CrearClientes() => new PagClientes(page);
        public PagCertificaciones CrearCertificaciones() => new PagCertificaciones(page);
        public PagCursosEtiquetas CrearCursosEtiquetas() => new PagCursosEtiquetas(page);
        public PagCursosGrafico CrearCursosGrafico() => new PagCursosGrafico(page);
        public PagExperiencia CrearExperiencia() => new PagExperiencia(page);
        public PagJardin CrearJardin() => new PagJardin(page);
        public PagMetodo CrearMetodo() => new PagMetodo(page);
    }
}
