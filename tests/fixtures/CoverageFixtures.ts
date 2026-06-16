import { test as base, expect, type TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

type CoverageFixtures = {
  /**
   * Fixture automática y transversal para las pruebas UI de Playwright.
   *
   * Cuando E2E_COVERAGE=1, al terminar cada prueba intenta leer
   * window.__coverage__ desde el navegador y guarda el fragmento en
   * .nyc_output. Después `nyc report` combina todos los fragmentos y genera
   * el informe HTML/LCOV/text-summary.
   *
   * Si la prueba es API pura y no usa navegador, no debe importar este fixture.
   * Si la prueba usa `page`, conviene importar `test` desde este fichero o desde
   * AppFixtures para que la cobertura sea real y homogénea.
   */
  guardarCoberturaIstanbul: void;
};

type GlobalConCoverage = typeof globalThis & {
  __coverage__?: unknown;
};

function coberturaActivada(): boolean {
  return process.env.E2E_COVERAGE === '1';
}

function crearNombreSeguro(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

async function guardarFragmentoCobertura(
  coverage: unknown,
  testInfo: TestInfo
): Promise<string> {
  const carpetaSalida = path.join(process.cwd(), '.nyc_output');

  await fs.mkdir(carpetaSalida, {
    recursive: true,
  });

  const nombreTest = crearNombreSeguro(testInfo.titlePath.join(' '));
  const nombreFichero = [
    'playwright-browser',
    testInfo.project.name,
    testInfo.workerIndex,
    testInfo.retry,
    Date.now(),
    nombreTest,
  ].join('-');

  const rutaFichero = path.join(carpetaSalida, `${nombreFichero}.json`);

  await fs.writeFile(rutaFichero, JSON.stringify(coverage), 'utf-8');

  return rutaFichero;
}

export const test = base.extend<CoverageFixtures>({
  guardarCoberturaIstanbul: [
    async ({ page }, use, testInfo) => {
      await use();

      if (!coberturaActivada() || page.isClosed()) {
        return;
      }

      try {
        const coverage = await page.evaluate(() => {
          return (globalThis as GlobalConCoverage).__coverage__ ?? null;
        });

        if (!coverage) {
          await testInfo.attach('istanbul-coverage-info', {
            body:
              'La prueba no ha generado window.__coverage__. Normalmente significa que no ha cargado una página instrumentada.',
            contentType: 'text/plain',
          });
          return;
        }

        const rutaFichero = await guardarFragmentoCobertura(coverage, testInfo);

        await testInfo.attach('istanbul-coverage', {
          path: rutaFichero,
          contentType: 'application/json',
        });
      } catch (error) {
        await testInfo.attach('istanbul-coverage-error', {
          body: String(error),
          contentType: 'text/plain',
        });
      }
    },
    {
      auto: true,
    },
  ],
});

export { expect };
