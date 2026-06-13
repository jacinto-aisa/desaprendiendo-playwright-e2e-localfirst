// tests/critical/contactoDirecto.spec.ts
import {
  test,
  testsPorEntorno,
} from '../support/DecoradorTestPorEntorno';

const paginasConContactoDirecto = [
  { nombre: 'Inicio', ruta: '/index.html' },
  { nombre: 'Experiencia', ruta: '/experiencia.html' },
  { nombre: 'Certificaciones', ruta: '/certificaciones.html' },
];

testsPorEntorno.describeSoloLocalFirst(
  'contacto directo local-first',
  () => {
    for (const pagina of paginasConContactoDirecto) {
      test(`muestra contacto directo correcto en ${pagina.nombre}`, async ({
        page,
        contactoDirecto,
      }) => {
        await page.goto(pagina.ruta);
        await contactoDirecto.deberiaPermitirContactoDirecto();
      });
    }
  }
);
