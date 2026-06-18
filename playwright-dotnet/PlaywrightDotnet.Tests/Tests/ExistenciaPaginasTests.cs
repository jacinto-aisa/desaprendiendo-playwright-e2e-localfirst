using System.Collections.Generic;
using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Fixtures;
using PlaywrightDotnet.Tests.Support;
using Xunit;

namespace PlaywrightDotnet.Tests.Tests
{
    public class ExistenciaPaginasTests : IClassFixture<PlaywrightFixture>
    {
        private readonly PlaywrightFixture fixture;

        public ExistenciaPaginasTests(PlaywrightFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task PaginasCriticasExistentes()
        {
            var paginasCriticas = new List<(string nombre, string ruta)>
            {
                ("Inicio", "/index.html"),
                ("Cursos", "/cursos.html"),
                ("Clientes", "/clientes.html"),
                ("Certificaciones", "/certificaciones.html"),
                ("Experiencia", "/experiencia.html"),
                ("Método", "/metodo_docente.html"),
            };

            foreach (var pagina in paginasCriticas)
            {
                var response = await fixture.Page.GotoAsync(pagina.ruta);
                Assert.True(response?.Ok ?? false, $"La página {pagina.nombre} no respondió OK");
            }
        }

        [Fact]
        public async Task PaginasSoloLocalFirstExistentes()
        {
            if (!EntornoE2E.EsLocalFirst())
            {
                // Omitir si no es local-first
                return;
            }

            var paginasSoloLocalFirst = new List<(string nombre, string ruta)>
            {
                ("Cursos Etiquetas", "/cursos_etiquetas.html"),
                ("Cursos Graph", "/cursos_graph.html"),
                ("Jardín", "/jardin.html"),
            };

            foreach (var pagina in paginasSoloLocalFirst)
            {
                var response = await fixture.Page.GotoAsync(pagina.ruta);
                Assert.True(response?.Ok ?? false, $"La página {pagina.nombre} no respondió OK");
            }
        }
    }
}
