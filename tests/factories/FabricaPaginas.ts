import { Page } from '@playwright/test';

import { PagInicio } from '@pom/PagInicio';
import { PagClientes } from '@pom/PagClientes';
import { PagCertificaciones } from '@pom/PagCertificaciones';
import { PagCursosEtiquetas } from '@pom/PagCursosEtiquetas';
import { PagCursosGrafico } from '@pom/PagCursosGrafico';
import { PagExperiencia } from '@pom/PagExperiencia';
import { PagJardin } from '@pom/PagJardin';
import { PagMetodo } from '@pom/PagMetodo';

export class FabricaPaginas {
  constructor(private readonly page: Page) {}

  crearInicio(): PagInicio {
    return new PagInicio(this.page);
  }

  crearClientes(): PagClientes {
    return new PagClientes(this.page);
  }

  crearCertificaciones(): PagCertificaciones {
    return new PagCertificaciones(this.page);
  }

  crearCursosEtiquetas(): PagCursosEtiquetas {
    return new PagCursosEtiquetas(this.page);
  }

  crearCursosGrafico(): PagCursosGrafico {
    return new PagCursosGrafico(this.page);
  }

  crearExperiencia(): PagExperiencia {
    return new PagExperiencia(this.page);
  }

  crearJardin(): PagJardin {
    return new PagJardin(this.page);
  }

  crearMetodo(): PagMetodo {
    return new PagMetodo(this.page);
  }
}
