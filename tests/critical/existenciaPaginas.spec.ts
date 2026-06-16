import { test, expect } from '@playwright/test';
import { crearDecoradorTestsPorEntorno } from '@support/DecoradorTestPorEntorno';

const testsPorEntorno = crearDecoradorTestsPorEntorno(test);

const paginasCriticas = [
  { nombre: 'Inicio', ruta: '/index.html' },
  { nombre: 'Cursos', ruta: '/cursos.html' },
  { nombre: 'Clientes', ruta: '/clientes.html' },
  { nombre: 'Certificaciones', ruta: '/certificaciones.html' },
  { nombre: 'Experiencia', ruta: '/experiencia.html' },
  { nombre: 'Método', ruta: '/metodo_docente.html' },
];

const paginasSoloLocalFirst = [
  { nombre: 'Cursos Etiquetas', ruta: '/cursos_etiquetas.html' },
  { nombre: 'Cursos Graph', ruta: '/cursos_graph.html' },
  { nombre: 'Jardín', ruta: '/jardin.html' },
];

test.describe('existencia de páginas críticas comunes', () => {
  for (const pagina of paginasCriticas) {
    test(`existe la página ${pagina.nombre}`, async ({ page }) => {
      const response = await page.goto(pagina.ruta);
      expect(response?.ok()).toBeTruthy();
    });
  }
});

testsPorEntorno.describeSoloLocalFirst(
  'existencia de páginas exclusivas del diseño local-first',
  () => {
    for (const pagina of paginasSoloLocalFirst) {
      test(`existe la página ${pagina.nombre}`, async ({ page }) => {
        const response = await page.goto(pagina.ruta);
        expect(response?.ok()).toBeTruthy();
      });
    }
  }
);
