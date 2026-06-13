import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PagMetodo extends PaginaBase {
  constructor(page: Page) {
    super(page, '/metodo_docente.html', /pienso al programar/i);
  }
}
