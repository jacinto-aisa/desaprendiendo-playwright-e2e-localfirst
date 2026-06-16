import { test, expect } from '@fixtures/ApiFixtures';
import { crearDecoradorTestsPorEntorno } from '@support/DecoradorTestPorEntorno';

const testsPorEntorno = crearDecoradorTestsPorEntorno(test);

testsPorEntorno.describeSoloLocalFirst('API Client contra API local', () => {
  test('API Client autenticado busca cursos Azure', async ({ cursosApi }) => {
    const cursos = await cursosApi.buscarPorTecnologia('Azure');

    expect(cursos.total).toBeGreaterThan(0);
    expect(cursos.data[0]).toHaveProperty('titulo');
  });
});
