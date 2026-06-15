// tests/api/cursos.odata.spec.ts
import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';

test('devuelve contrato mínimo de cursos', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/odata/cursos`, {
    params: {
      '$filter': "tecnologia eq 'Azure'",
      '$select': 'id,titulo,tecnologia,duracionHoras',
      '$top': '5',
    '$count': 'true',
  },
});

  const body = await response.json();
  expect(body['@odata.count']).toBeGreaterThan(0);
  expect(body.value[0]).toHaveProperty('titulo');
  expect(body.value[0]).not.toHaveProperty('tags');
});
