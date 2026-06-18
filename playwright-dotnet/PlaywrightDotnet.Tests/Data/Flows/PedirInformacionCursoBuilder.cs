using System.Collections.Generic;

namespace PlaywrightDotnet.Tests.Data.Flows
{
    public class PedirInformacionCursoBuilder
    {
        private EscenarioPedirInformacionCurso escenario = new EscenarioPedirInformacionCurso();

        public static PedirInformacionCursoBuilder UnEscenario() => new PedirInformacionCursoBuilder();

        public PedirInformacionCursoBuilder ConNombre(string nombre)
        {
            escenario.Nombre = nombre;
            return this;
        }

        public PedirInformacionCursoBuilder ConDescripcion(string descripcion)
        {
            escenario.Descripcion = descripcion;
            return this;
        }

        public PedirInformacionCursoBuilder EnPaginaInicial(string paginaInicial)
        {
            escenario.PaginaInicial = paginaInicial;
            return this;
        }

        public PedirInformacionCursoBuilder SeleccionandoBurbujas(params int[] burbujas)
        {
            escenario.Burbujas = new List<int>(burbujas);
            return this;
        }

        public PedirInformacionCursoBuilder ConTags(string[] tags)
        {
            escenario.Tags = tags;
            return this;
        }

        public PedirInformacionCursoBuilder DesplegandoGrupo(int grupo)
        {
            escenario.Grupo = grupo;
            return this;
        }

        public PedirInformacionCursoBuilder ConAccionFinal(string accionFinal)
        {
            escenario.AccionFinal = accionFinal;
            return this;
        }

        public EscenarioPedirInformacionCurso Build()
        {
            // Clone simple fields to return a fresh instance
            return new EscenarioPedirInformacionCurso
            {
                Nombre = escenario.Nombre,
                Descripcion = escenario.Descripcion,
                PaginaInicial = escenario.PaginaInicial,
                Burbujas = new List<int>(escenario.Burbujas),
                Tags = escenario.Tags,
                Grupo = escenario.Grupo,
                AccionFinal = escenario.AccionFinal,
            };
        }
    }
}
