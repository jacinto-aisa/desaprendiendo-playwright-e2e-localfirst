using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Factories;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Pom;
using PlaywrightDotnet.Tests.Components;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class NavegacionPrincipalTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public NavegacionPrincipalTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task NavegarACertificacionesDesdeMenu()
        {
            var fabrica = new FabricaPaginas(fixture.Page);
            var pagInicio = fabrica.CrearInicio();
            var cabecera = new HeaderComponent(fixture.Page);
            var pagCertificaciones = fabrica.CrearCertificaciones();

            var opened = await pagInicio.OpenAsync();
            Assert.True(opened);

            await cabecera.IrACertificacionesAsync();
            await pagCertificaciones.DeberiaEstarCargadaAsync();
        }

        [Fact]
        public async Task NavegarAClientesDesdeMenu()
        {
            var fabrica = new FabricaPaginas(fixture.Page);
            var pagInicio = fabrica.CrearInicio();
            var cabecera = new HeaderComponent(fixture.Page);
            var pagClientes = fabrica.CrearClientes();

            var opened = await pagInicio.OpenAsync();
            Assert.True(opened);

            await cabecera.IrAClientesAsync();
            await pagClientes.DeberiaEstarCargadaAsync();
        }

        [Fact]
        public async Task NavegarAExperienciaDesdeMenu()
        {
            var fabrica = new FabricaPaginas(fixture.Page);
            var pagInicio = fabrica.CrearInicio();
            var cabecera = new HeaderComponent(fixture.Page);
            var pagExperiencia = fabrica.CrearExperiencia();

            var opened = await pagInicio.OpenAsync();
            Assert.True(opened);

            await cabecera.IrAExperienciaAsync();
            await pagExperiencia.DeberiaEstarCargadaAsync();
        }

        [Fact]
        public async Task NavegarAMetodoDesdeMenu()
        {
            var fabrica = new FabricaPaginas(fixture.Page);
            var pagInicio = fabrica.CrearInicio();
            var cabecera = new HeaderComponent(fixture.Page);
            var pagMetodo = fabrica.CrearMetodo();

            var opened = await pagInicio.OpenAsync();
            Assert.True(opened);

            await cabecera.IrAMetodoAsync();
            await pagMetodo.DeberiaEstarCargadaAsync();
        }

        [Fact]
        public async Task NavegacionPrincipalLocalFirst()
        {
            if (!PlaywrightDotnet.Tests.Support.EntornoE2E.EsLocalFirst()) return;

            var fabrica = new FabricaPaginas(fixture.Page);
            var pagInicio = fabrica.CrearInicio();
            var cabecera = new HeaderComponent(fixture.Page);

            var opened = await pagInicio.OpenAsync();
            Assert.True(opened);

            var pagJardin = fabrica.CrearJardin();
            await cabecera.IrAJardinAsync();
            await pagJardin.DeberiaEstarCargadaAsync();

            var pagCursosGrafico = fabrica.CrearCursosGrafico();
            await cabecera.IrACursosGraficoAsync();
            await pagCursosGrafico.DeberiaEstarCargadaAsync();

            var pagCursosEtiquetas = fabrica.CrearCursosEtiquetas();
            await cabecera.IrACursosEtiquetasAsync();
            await pagCursosEtiquetas.DeberiaEstarCargadaAsync();
        }
    }
}
