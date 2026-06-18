using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Components
{
    public class ContactoDirectoComponent
    {
        private readonly IPage page;
        private readonly ILocator root;

        public ContactoDirectoComponent(IPage page)
        {
            this.page = page;
            this.root = page.Locator(".heroCard.profileBox").Filter(new LocatorFilterOptions
            {
                Has = page.Locator("a#cEmail1[href^=\"mailto:\"]")
            }).First;
        }

        public ILocator Tarjeta() => root;

        public ILocator Nombre() => root.GetByText("Jacinto Aisa Ibañez", new LocatorGetByTextOptions { Exact = true });

        public ILocator EnlaceCorreo() => root.Locator("a#cEmail1[href^=\"mailto:\"]").First;

        public ILocator TituloProfesional() => root.GetByText("Executive Trainer", new LocatorGetByTextOptions { Exact = false });

        public async Task DeberiaEstarVisibleAsync() => await Tarjeta().WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });

        public async Task DeberiaMostrarNombreAsync() => await Nombre().WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });

        public async Task DeberiaMostrarTituloProfesionalAsync() => await TituloProfesional().WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });

        public async Task DeberiaTenerHipervinculoCorreoAsync(string correoEsperado = "jacinto@desaprendiendo.net")
        {
            var enlace = EnlaceCorreo();
            await enlace.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
            var href = await enlace.GetAttributeAsync("href");
            if (href == null || !Regex.IsMatch(href, $"mailto:{Regex.Escape(correoEsperado)}", RegexOptions.IgnoreCase))
                throw new System.Exception("El enlace de correo no contiene el correo esperado");

            var text = await enlace.TextContentAsync();
            if (text == null || !text.Contains(correoEsperado, System.StringComparison.OrdinalIgnoreCase))
                throw new System.Exception("El texto del enlace no contiene el correo esperado");
        }

        public async Task<string> ObtenerTelefonoDesdeDatosAsync()
        {
            return await page.EvaluateAsync<string>("() => { const ventana = window; return (ventana.SITE_DATA && ventana.SITE_DATA.person && ventana.SITE_DATA.person.phone) || ''; }");
        }

        public async Task DeberiaTenerTelefonoConfiguradoAsync(string telefonoEsperado = "626506548")
        {
            var telefono = await ObtenerTelefonoDesdeDatosAsync();
            var telefonoNormalizado = Regex.Replace(telefono ?? string.Empty, "\\D", "");
            if (telefonoNormalizado != telefonoEsperado)
                throw new System.Exception($"Teléfono esperado '{telefonoEsperado}' pero se obtuvo '{telefonoNormalizado}'");
        }

        public async Task DeberiaPermitirContactoDirectoAsync()
        {
            await DeberiaEstarVisibleAsync();
            await DeberiaMostrarNombreAsync();
            await DeberiaMostrarTituloProfesionalAsync();
            await DeberiaTenerHipervinculoCorreoAsync();
            await DeberiaTenerTelefonoConfiguradoAsync();
        }
    }
}
