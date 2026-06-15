import { APIRequestContext, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';

export class CursosApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string
  ) {}

  async buscarPorTecnologia(tecnologia: string) {
    const response = await this.request.get(`${API_BASE_URL}/api/cursos`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
      params: { tecnologia },
    });

    expect(response.ok()).toBeTruthy();
    return await response.json();
  }
}

