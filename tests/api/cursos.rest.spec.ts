import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';

test('devuelve contrato mínimo de cursos', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/api/cursos`, {
    params: { tecnologia: 'Azure' },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body).toHaveProperty('total');
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBeTruthy();

  for (const curso of body.data.slice(0, 3)) {
    expect(curso).toHaveProperty('id');
    expect(curso).toHaveProperty('titulo');
    expect(curso).not.toHaveProperty('password');
  }
});
