import { expect, Locator, Page } from '@playwright/test';

export class ContactoDirectoComponent {
  private readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = this.page
      .locator('.heroCard.profileBox')
      .filter({
        has: this.page.locator('a#cEmail1[href^="mailto:"]'),
      })
      .first();
  }

  telefono(): Locator {
    return this.root.getByText(/626\s*506\s*548|626506548/);
  }

  enlaceCorreo(): Locator {
    return this.root.locator('a#cEmail1[href^="mailto:"]').first();
  }

  async deberiaEstarVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async deberiaMostrarTelefono(
    telefonoEsperado: string = '626506548'
  ): Promise<void> {
    await expect(this.telefono()).toBeVisible();

    const textoTelefono = await this.telefono().innerText();
    const telefonoNormalizado = textoTelefono.replace(/\D/g, '');

    expect(telefonoNormalizado).toBe(telefonoEsperado);
  }

  async deberiaTenerHipervinculoCorreo(
    correoEsperado: string = 'jacinto@desaprendiendo.net'
  ): Promise<void> {
    const enlace = this.enlaceCorreo();

    await expect(enlace).toBeVisible();

    const href = await enlace.getAttribute('href');

    expect(href).toBeTruthy();
    expect(href!.toLowerCase()).toContain(
      `mailto:${correoEsperado}`.toLowerCase()
    );
  }

  async deberiaPermitirContactoDirecto(): Promise<void> {
    await this.deberiaEstarVisible();
    await this.deberiaMostrarTelefono();
    await this.deberiaTenerHipervinculoCorreo();
  }
}
