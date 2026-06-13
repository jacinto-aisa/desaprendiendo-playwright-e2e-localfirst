import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PagInicio extends PaginaBase {
  constructor(page: Page) {
    super(page, '/index.html', 'Inicio');
  }
  async estaImagenFotoVisible() : Promise<boolean> {
    return await this.page.getByAltText('Jacinto Aisa Ibañez').isVisible();
  }
  async recuperarNombre() : Promise<string | null>   {
    return await this.page.getByRole('heading', { name: "Jacinto Aisa Ibañez" }).textContent();
  }

}