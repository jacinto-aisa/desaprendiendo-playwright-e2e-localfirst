import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';
test('devuelve contrato mínimo de cursos', async ({ request, page }) => {
    const response = await request.get(`${API_BASE_URL}/api/cursos`, {
        params: { tecnologia: 'Azure' },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const titulo = body.data[0].titulo;

    await page.goto('/cursos_graph.html');
    await expect(page.getByText(titulo).first()).toBeVisible();
});