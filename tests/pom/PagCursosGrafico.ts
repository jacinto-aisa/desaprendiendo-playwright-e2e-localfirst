import { Page,Locator,expect } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PagCursosGrafico extends PaginaBase {
  constructor(page: Page) {
    super(page, '/cursos_graph.html', 'Cursos');
  }
    private burbujaPorNumero(numero: number): Locator {
    return this.page
      .locator('#bubbleSvg g')
      .nth(numero - 1)
      .locator('circle');
  }

  private grupoPorNumero(numero: number): Locator {
    return this.page
      .locator('#courseGroups > div')
      .nth(numero - 1);
  }

  async seleccionarBurbujaPorNumero(numero: number): Promise<void> {
    await this.burbujaPorNumero(numero).click();
  }

  async desplegarGrupoPorNumero(numero: number): Promise<void> {
    await this.grupoPorNumero(numero)
      .locator('.cg-chev')
      .click();
  }

  async solicitarPrimerCursoDelGrupo(numeroGrupo: number): Promise<void> {
    await this.grupoPorNumero(numeroGrupo)
      .getByRole('link', { name: /solicitar/i })
      .first()
      .click();
  }

  async deberiaMostrarGruposDeCursos(): Promise<void> {
    await expect(this.page.locator('#courseGroups')).toBeVisible();
  }
}