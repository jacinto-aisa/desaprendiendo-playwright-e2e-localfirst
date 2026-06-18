using System.Threading.Tasks;
using PlaywrightDotnet.Tests.Pom;
using PlaywrightDotnet.Tests.Data.Flows;

namespace PlaywrightDotnet.Tests.Flows
{
    public class PedirInformacionCursoFlow
    {
        private readonly PagCursosGrafico pagCursosGrafico;

        public PedirInformacionCursoFlow(PagCursosGrafico pagCursosGrafico)
        {
            this.pagCursosGrafico = pagCursosGrafico;
        }

        public async Task PedirInformacionCursoAsync(EscenarioPedirInformacionCurso escenario)
        {
            await pagCursosGrafico.AbrirYComprobarAsync(); // no-op ensure file saved after edits
            await pagCursosGrafico.EsperarBurbujasAsync();

            // Seleccionar burbujas por tag si el escenario proporciona etiquetas en lugar de índices
            foreach (var tag in escenario.Tags ?? new string[0])
            {
                await pagCursosGrafico.ClickBurbujaPorTagAsync(tag);
            }

            await pagCursosGrafico.EsperarGrupoCursosAsync();

            if (escenario.AccionFinal == "solicitarPrimerCurso")
            {
                // Intentar pulsar el primer botón 'Solicitar información' disponible
                // Use internal Page via a public helper to avoid accessing protected Page field
                var boton = await pagCursosGrafico.GetPage().GetByRole(Microsoft.Playwright.AriaRole.Button, new Microsoft.Playwright.PageGetByRoleOptions { Name = "Solicitar información" }).First.OrNullAsync();
                if (boton != null) await boton.ClickAsync();
            }
        }
    }
}
