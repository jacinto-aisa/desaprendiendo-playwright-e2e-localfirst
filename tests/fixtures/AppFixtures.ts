import { test as base } from './CoverageFixtures';

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

export const test = base.extend<AppFixtures>({
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

export { expect } from './CoverageFixtures';