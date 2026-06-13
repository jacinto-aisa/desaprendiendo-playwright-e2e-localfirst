import { AccionFinalPedirInformacionCurso, EscenarioPedirInformacionCurso } from "./EscenarioPedirInformacionCurso";


export class PedirInformacionCursoBuilder {
  private escenario: EscenarioPedirInformacionCurso = {
    nombre: 'pedirInformacionCurso',
    descripcion:
      'Selecciona filtros en cursos graph, despliega un grupo y solicita información de un curso.',
    paginaInicial: '/cursos_graph.html',
    burbujas: [1, 2, 1],
    grupo: 2,
    accionFinal: 'solicitarPrimerCurso',
  };

  static unEscenario(): PedirInformacionCursoBuilder {
    return new PedirInformacionCursoBuilder();
  }

  conNombre(nombre: string): this {
    this.escenario.nombre = nombre;
    return this;
  }

  conDescripcion(descripcion: string): this {
    this.escenario.descripcion = descripcion;
    return this;
  }

  enPaginaInicial(paginaInicial: string): this {
    this.escenario.paginaInicial = paginaInicial;
    return this;
  }

  seleccionandoBurbujas(...burbujas: number[]): this {
    this.escenario.burbujas = burbujas;
    return this;
  }

  desplegandoGrupo(grupo: number): this {
    this.escenario.grupo = grupo;
    return this;
  }

  conAccionFinal(accionFinal: AccionFinalPedirInformacionCurso): this {
    this.escenario.accionFinal = accionFinal;
    return this;
  }

  build(): EscenarioPedirInformacionCurso {
    return {
      ...this.escenario,
      burbujas: [...this.escenario.burbujas],
    };
  }
}
