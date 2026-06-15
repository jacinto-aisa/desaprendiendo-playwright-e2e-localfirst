import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';
import { obtenerToken } from '@support/auth';

test.describe('Iteración 09 · contrato, auth fake, OData y GraphQL', () => {
  test('valida contrato mínimo de cursos', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/cursos`, {
      params: { tecnologia: 'Azure' },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('data');

    for (const curso of body.data.slice(0, 5)) {
      expect(curso).toHaveProperty('id');
      expect(curso).toHaveProperty('titulo');
      expect(curso).toHaveProperty('tecnologia');
      expect(typeof curso.titulo).toBe('string');
    }
  });

  test('login fake devuelve token y permite API privada', async ({ request }) => {
    const token = await obtenerToken(request);

    const response = await request.get(`${API_BASE_URL}/api/private/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.user.email).toContain('@');
  });

  test('Basic Auth permite acceder a API privada', async ({ request }) => {
    const basic = Buffer.from('demo:demo123').toString('base64');

    const response = await request.get(`${API_BASE_URL}/api/private`, {
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('API key permite acceder a API privada', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/private`, {
      headers: {
        'x-api-key': process.env.COURSES_API_KEY ?? 'key-local',
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('OData filtra y selecciona campos', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/odata/cursos`, {
      params: {
        '$filter': "tecnologia eq 'Azure'",
        '$select': 'id,titulo,tecnologia',
        '$top': '3',
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.value.length).toBeGreaterThan(0);
    expect(body.value[0]).toHaveProperty('titulo');
    expect(body.value[0]).not.toHaveProperty('cliente');
  });

  test('GraphQL devuelve cursos por variable tecnologia', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/graphql`, {
      data: {
        query: `query Cursos($tecnologia: String!) { cursos(tecnologia: $tecnologia) { id titulo tecnologia } }`,
        variables: {
          tecnologia: 'Azure',
        },
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data.cursos.length).toBeGreaterThan(0);
    expect(body.data.cursos[0]).toHaveProperty('titulo');
  });
});
