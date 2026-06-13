import test from "@playwright/test";
import { ContactoDirectoComponent } from "../com/ContactoDirectoComponent";

// tests/critical/contactoDirecto.spec.ts
const paginasConContactoDirecto = [
  '/index.html',
  '/experiencia.html',
  '/certificaciones.html',
];

for (const ruta of paginasConContactoDirecto) {
  test(`debería mostrar contacto directo en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);

    const contactoDirecto = new ContactoDirectoComponent(page);

    await contactoDirecto.deberiaPermitirContactoDirecto();
  });
}