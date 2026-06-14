import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '../support/env';

test('consulta API y valida que la UI local muestra formación relacionada', async ({ request, page }) => {
  const response = await request.get(`${API_BASE_URL}/api/cursos`, {
    params: { tecnologia: 'Azure' },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.total).toBeGreaterThan(0);

  await page.goto('/cursos.html');
  await expect(page.getByText(/Azure/i).first()).toBeVisible();
});
