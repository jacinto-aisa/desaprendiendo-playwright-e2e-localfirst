import { test as base, expect } from '@playwright/test';
import { CursosApiClient } from '@api-client/CursosApiClient';
import { obtenerToken } from '@support/auth';

type ApiFixtures = {
  cursosApi: CursosApiClient;
  cursosApiAutenticada: CursosApiClient;
};

export const test = base.extend<ApiFixtures>({
  cursosApi: async ({ request }, use) => {

    await use(new CursosApiClient(request));
  },

  cursosApiAutenticada: async ({ request }, use) => {
    const token = await obtenerToken(request);
    await use(new CursosApiClient(request, token));
  },
});

export { expect };

