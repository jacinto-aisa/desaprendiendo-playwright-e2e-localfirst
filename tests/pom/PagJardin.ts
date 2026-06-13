import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PagJardin extends PaginaBase {
  constructor(page: Page) {
    super(page, '/jardin.html', 'Jardin');
  }
}