import { Page, expect } from '@playwright/test';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async irAInicio() {
    await this.page.getByRole('link', { name: /inicio/i }).click();
    await expect(this.page).toHaveURL(/index\.html$/);
  }
  async irAMetodo() {
    await this.page.getByRole('link', { name: 'Método', exact: true }).click();
    await expect(this.page).toHaveURL(/metodo_docente\.html$/);
  }
  async irAExperiencia() {
    await this.page.getByRole('link', { name: /experiencia/i }).click();
    await expect(this.page).toHaveURL(/experiencia\.html$/);
  }
  async irAJardin() {
    await this.page.getByRole('link', { name: 'JARDIN', exact: true }).click();
    await expect(this.page).toHaveURL(/jardin\.html$/);
  }
  async irACursosGrafico() {
    //Existen dos y localizadores con el mismo Rol y nombre por eso le pongo que sea exacto, no que contenga cursos
    await this.page. getByRole('link', { name: 'Cursos graph', exact: true }).click();
    await expect(this.page).toHaveURL(/cursos_graph\.html$/);
  }
  async irACursosEtiquetas() {
    await this.page. getByRole('link', { name: 'Cursos etiquetas', exact: true }).click();
    await expect(this.page).toHaveURL(/cursos_etiquetas\.html$/);
  }
  async irAClientes() {
    await this.page.getByRole('link', { name: /clientes/i }).click();
    await expect(this.page).toHaveURL(/clientes\.html$/);
  }
  async irACertificaciones() {
    await this.page.getByRole('link', { name: /certificaciones/i }).first().click();
    await expect(this.page).toHaveURL(/certificaciones\.html$/);
  }
}
