import { test as base } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

import { HeaderComponent } from '@com/HeaderComponent';
import { ContactoDirectoComponent } from '@com/ContactoDirectoComponent';
import { FabricaPaginas } from '@factories/FabricaPaginas';

import { PagInicio } from '@pom/PagInicio';
import { PagClientes } from '@pom/PagClientes';
import { PagCertificaciones } from '@pom/PagCertificaciones';
import { PagCursosEtiquetas } from '@pom/PagCursosEtiquetas';
import { PagCursosGrafico } from '@pom/PagCursosGrafico';
import { PagExperiencia } from '@pom/PagExperiencia';
import { PagJardin } from '@pom/PagJardin';
import { PagMetodo } from '@pom/PagMetodo';

import { PedirInformacionCursoFlow } from '@flows/PedirInformacionCursoFlow';

type AppFixtures = {
  /*
   * Fixture automática.
   *
   * No se usa directamente en los tests.
   * Se ejecuta alrededor de cada test que importe `test` desde AppFixtures.
   *
   * Su misión es recoger window.__coverage__ al final de la prueba
   * y guardarlo en .nyc_output para que Istanbul/nyc pueda generar
   * posteriormente el reporte HTML o LCOV.
   */
  guardarCoberturaIstanbul: void;

  fabricaPaginas: FabricaPaginas;

  cabecera: HeaderComponent;
  contactoDirecto: ContactoDirectoComponent;

  pagInicio: PagInicio;
  pagClientes: PagClientes;
  pagCertificaciones: PagCertificaciones;
  pagCursosEtiquetas: PagCursosEtiquetas;
  pagCursosGrafico: PagCursosGrafico;
  pagExperiencia: PagExperiencia;
  pagJardin: PagJardin;
  pagMetodo: PagMetodo;

  pedirInformacionCursoFlow: PedirInformacionCursoFlow;
};

function crearNombreSeguro(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const test = base.extend<AppFixtures>({
  guardarCoberturaIstanbul: [
    async ({ page }, use, testInfo) => {
      await use();

      try {
        const coverage = await page.evaluate(() => {
          return (
            window as unknown as {
              __coverage__?: unknown;
            }
          ).__coverage__ ?? null;
        });

        if (!coverage) {
          return;
        }

        const carpetaSalida = path.join(process.cwd(), '.nyc_output');

        await fs.mkdir(carpetaSalida, {
          recursive: true,
        });

        const nombreTest = crearNombreSeguro(
          testInfo.titlePath().join(' ')
        );

        const nombreFichero = [
          'playwright',
          testInfo.workerIndex,
          testInfo.retry,
          Date.now(),
          nombreTest,
        ].join('-');

        const rutaFichero = path.join(
          carpetaSalida,
          `${nombreFichero}.json`
        );

        await fs.writeFile(
          rutaFichero,
          JSON.stringify(coverage),
          'utf-8'
        );

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

  fabricaPaginas: async ({ page }, use) => {
    await use(new FabricaPaginas(page));
  },

  cabecera: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },

  contactoDirecto: async ({ page }, use) => {
    await use(new ContactoDirectoComponent(page));
  },

  pagInicio: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearInicio());
  },

  pagClientes: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearClientes());
  },

  pagCertificaciones: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearCertificaciones());
  },

  pagCursosEtiquetas: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearCursosEtiquetas());
  },

  pagCursosGrafico: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearCursosGrafico());
  },

  pagExperiencia: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearExperiencia());
  },

  pagJardin: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearJardin());
  },

  pagMetodo: async ({ fabricaPaginas }, use) => {
    await use(fabricaPaginas.crearMetodo());
  },

  pedirInformacionCursoFlow: async ({ pagCursosGrafico }, use) => {
    await use(new PedirInformacionCursoFlow(pagCursosGrafico));
  },
});

export { expect } from '@playwright/test';