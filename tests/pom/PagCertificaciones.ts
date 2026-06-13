import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PagCertificaciones extends PaginaBase {
  constructor(page: Page) {
    super(page, '/certificaciones.html', 'Certificaciones');
  }
}
