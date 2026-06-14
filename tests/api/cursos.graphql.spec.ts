import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '@support/env';

test('devuelve contrato mínimo de cursos', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/graphql`, {
        data: {
            query: `
                query CursosPorTecnologia($tecnologia: String!) {
                cursos(tecnologia: $tecnologia) {
                    id
                    titulo
                    tecnologia
                    duracionHoras
                }
            }
        }
        `,
        variables: { tecnologia: 'Azure' },
        },
    });
    const body = await response.json();
    expect(body.data.cursos.length).toBeGreaterThan(0);
});
