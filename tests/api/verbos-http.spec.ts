import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '../support/env';

test.describe('Iteración 09 · verbos HTTP contra API local', () => {
  test('GET lee cursos por tecnología', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/cursos`, {
      params: { tecnologia: 'Azure' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.total).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('titulo');
  });

  test('POST crea una solicitud de curso', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/solicitudes`, {
      data: {
        nombre: 'Ana García',
        email: 'ana@example.com',
        curso: 'Playwright E2E Profesional',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toMatch(/^sol-/);
    expect(body.email).toBe('ana@example.com');
  });

  test('PUT reemplaza un curso completo', async ({ request }) => {
    const response = await request.put(`${API_BASE_URL}/api/cursos/playwright-lab`, {
      data: {
        titulo: 'Playwright E2E Profesional',
        tecnologia: 'Playwright',
        nivel: 'Avanzado',
        cliente: 'Desaprendiendo',
        duracionHoras: 32,
        tags: ['Playwright', 'Testing', 'Avanzado'],
      },
    });

    expect([200, 201]).toContain(response.status());

    const body = await response.json();
    expect(body.id).toBe('playwright-lab');
    expect(body.titulo).toContain('Playwright');
  });

  test('PATCH modifica parcialmente un curso', async ({ request }) => {
    await request.put(`${API_BASE_URL}/api/cursos/curso-patch-lab`, {
      data: {
        titulo: 'Curso para patch',
        tecnologia: 'Playwright',
        nivel: 'Inicial',
        cliente: 'Desaprendiendo',
        duracionHoras: 10,
        tags: ['Playwright'],
      },
    });

    const response = await request.patch(`${API_BASE_URL}/api/cursos/curso-patch-lab`, {
      data: {
        nivel: 'Enterprise',
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.nivel).toBe('Enterprise');
    expect(body.titulo).toBe('Curso para patch');
  });

  test('DELETE elimina una solicitud de prueba', async ({ request }) => {
    const create = await request.post(`${API_BASE_URL}/api/solicitudes`, {
      data: {
        nombre: 'Temporal',
        email: 'temporal@example.com',
        curso: 'Playwright',
      },
    });

    const { id } = await create.json();

    const deleted = await request.delete(`${API_BASE_URL}/api/solicitudes/${id}`);
    expect([200, 204]).toContain(deleted.status());
  });

  test('HEAD valida cabeceras sin descargar body', async ({ request }) => {
    const response = await request.head(`${API_BASE_URL}/api/cursos`);

    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
    expect(headers).toHaveProperty('cache-control');
  });

  test('OPTIONS muestra métodos permitidos', async ({ request }) => {
    const response = await request.fetch(`${API_BASE_URL}/api/cursos`, {
      method: 'OPTIONS',
    });

    expect(response.status()).toBeLessThan(500);

    const allow = response.headers().allow;
    expect(allow).toContain('GET');
    expect(allow).toContain('POST');
    expect(allow).toContain('HEAD');
  });
});
