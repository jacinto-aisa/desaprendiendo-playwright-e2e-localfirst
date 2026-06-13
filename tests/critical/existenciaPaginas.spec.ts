import { test, expect } from '@playwright/test';

const paginasCriticas = [
  { nombre: 'Inicio', ruta: '/index.html' },
  { nombre: 'Cursos', ruta: '/cursos.html' },
  { nombre: 'Clientes', ruta: '/clientes.html' },
  { nombre: 'Certificaciones', ruta: '/certificaciones.html' },
  { nombre: 'Experiencia', ruta: '/experiencia.html' },
  { nombre: 'Cursos Etiquetas', ruta: '/cursos.html' },
  { nombre: 'Cursos Graph', ruta: '/cursos_graph.html' },
  { nombre: 'Jardín', ruta: '/jardin.html' },
  { nombre: 'Método', ruta: '/metodo_docente.html' },
];

for (const pagina of paginasCriticas) {
  test(`existe la página ${pagina.nombre}`, async ({ page }) => {
    const response = await page.goto(pagina.ruta);
    expect(response?.ok()).toBeTruthy();
  });
}
