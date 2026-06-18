using System.Collections.Generic;

namespace PlaywrightDotnet.Tests.Data.Flows
{
    public class EscenarioPedirInformacionCurso
    {
        public string Nombre { get; set; } = "pedirInformacionCurso";
        public string Descripcion { get; set; } = "Selecciona filtros en cursos graph, despliega un grupo y solicita información de un curso.";
        public string PaginaInicial { get; set; } = "/cursos_graph";
        // Ahora permitimos indicar tags (nombres) en lugar de índices de burbuja
        public List<int> Burbujas { get; set; } = new List<int> { 1, 2, 1 };
        public string[] Tags { get; set; } = null;
        public int Grupo { get; set; } = 2;
        public string AccionFinal { get; set; } = "solicitarPrimerCurso";
    }
}
