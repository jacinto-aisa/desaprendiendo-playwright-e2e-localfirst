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

  tarjeta(): Locator {
    return this.root;
  }

  nombre(): Locator {
    return this.root.getByText('Jacinto Aisa Ibañez', { exact: true });
  }

  enlaceCorreo(): Locator {
    return this.root.locator('a#cEmail1[href^="mailto:"]').first();
  }

  tituloProfesional(): Locator {
    return this.root.getByText(/Executive Trainer/i);
  }

  async deberiaEstarVisible(): Promise<void> {
    await expect(this.tarjeta()).toBeVisible();
  }

  async deberiaMostrarNombre(): Promise<void> {
    await expect(this.nombre()).toBeVisible();
  }

  async deberiaMostrarTituloProfesional(): Promise<void> {
    await expect(this.tituloProfesional()).toBeVisible();
  }

  async deberiaTenerHipervinculoCorreo(
    correoEsperado: string = 'jacinto@desaprendiendo.net'
  ): Promise<void> {
    const enlace = this.enlaceCorreo();

    await expect(enlace).toBeVisible();

    await expect(enlace).toHaveAttribute(
      'href',
      new RegExp(`mailto:${correoEsperado}`, 'i')
    );

    await expect(enlace).toHaveText(correoEsperado);
  }

  async obtenerTelefonoDesdeDatos(): Promise<string> {
    return await this.page.evaluate(() => {
      const ventana = window as unknown as {
        SITE_DATA?: {
          person?: {
            phone?: string;
          };
        };
      };

      return ventana.SITE_DATA?.person?.phone ?? '';
    });
  }

  async deberiaTenerTelefonoConfigurado(
    telefonoEsperado: string = '626506548'
  ): Promise<void> {
    const telefono = await this.obtenerTelefonoDesdeDatos();
    const telefonoNormalizado = telefono.replace(/\D/g, '');

    expect(telefonoNormalizado).toBe(telefonoEsperado);
  }

  async deberiaPermitirContactoDirecto(): Promise<void> {
    await this.deberiaEstarVisible();
    await this.deberiaMostrarNombre();
    await this.deberiaMostrarTituloProfesional();
    await this.deberiaTenerHipervinculoCorreo();
    await this.deberiaTenerTelefonoConfigurado();
  }
}