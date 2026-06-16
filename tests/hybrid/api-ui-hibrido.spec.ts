import { test, expect } from '@fixtures/CoverageFixtures';
import { API_BASE_URL } from '@support/env';
import { crearDecoradorTestsPorEntorno } from '@support/DecoradorTestPorEntorno';

const testsPorEntorno = crearDecoradorTestsPorEntorno(test);

testsPorEntorno.describeSoloLocalFirst('Pruebas híbridas API + UI local-first', () => {
  test('consulta API y valida que la UI local muestra formación relacionada', async ({
    request,
    page,
  }) => {
    const response = await request.get(`${API_BASE_URL}/api/cursos`, {
      params: { tecnologia: 'Azure' },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.total).toBeGreaterThan(0);

    await page.goto('/cursos.html');
    await expect(page.getByText(/Azure/i).first()).toBeVisible();
  });
});
