using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Components
{
    public class HeaderComponent
    {
        private readonly IPage page;

        public HeaderComponent(IPage page)
        {
            this.page = page;
        }

        private void EnsureUrlMatches(string pattern)
        {
            if (!Regex.IsMatch(page.Url ?? string.Empty, pattern, RegexOptions.IgnoreCase))
            {
                throw new System.Exception($"La URL actual ('{page.Url}') no coincide con el patrón '{pattern}'");
            }
        }

        public async Task IrAInicioAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Inicio" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("index\\.html$");
        }

        public async Task IrAMetodoAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Método" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("metodo_docente\\.html$");
        }

        public async Task IrAExperienciaAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Experiencia" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("experiencia\\.html$");
        }

        public async Task IrAJardinAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "JARDIN" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("jardin\\.html$");
        }

        public async Task IrACursosGraficoAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Cursos graph" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("cursos_graph\\.html$");
        }

        public async Task IrACursosEtiquetasAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Cursos etiquetas" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("cursos_etiquetas\\.html$");
        }

        public async Task IrAClientesAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Clientes" }).ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("clientes\\.html$");
        }

        public async Task IrACertificacionesAsync()
        {
            await page.GetByRole(AriaRole.Link, new PageGetByRoleOptions { Name = "Certificaciones" }).First.ClickAsync();
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            EnsureUrlMatches("certificaciones\\.html$");
        }
    }
}
