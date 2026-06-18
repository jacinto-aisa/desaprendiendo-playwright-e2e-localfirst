using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDotnet.Tests.Components
{
    public class FotoJacintoComponent
    {
        private readonly ILocator root;

        public FotoJacintoComponent(ILocator root)
        {
            this.root = root;
        }

        public async Task OpenDetailAsync()
        {
            await root.GetByRole(AriaRole.Button, new LocatorGetByRoleOptions { Name = "ver detalle" }).ClickAsync();
        }

        public ILocator Title() => root.GetByRole(AriaRole.Heading);
    }
}
