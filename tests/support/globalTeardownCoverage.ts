import fs from 'node:fs/promises';
import path from 'node:path';

const apiURL = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';

type CoverageMap = Record<string, unknown>;

function coberturaActivada(): boolean {
  return process.env.E2E_COVERAGE === '1';
}

async function guardarCoberturaApi(coverage: CoverageMap): Promise<void> {
  if (Object.keys(coverage).length === 0) {
    return;
  }

  const carpetaSalida = path.join(process.cwd(), '.nyc_output');
  await fs.mkdir(carpetaSalida, { recursive: true });

  const rutaFichero = path.join(
    carpetaSalida,
    `playwright-api-${Date.now()}.json`
  );

  await fs.writeFile(rutaFichero, JSON.stringify(coverage), 'utf-8');
}

export default async function globalTeardownCoverage(): Promise<void> {
  if (!coberturaActivada()) {
    return;
  }

  try {
    const response = await fetch(`${apiURL}/__coverage__`);

    if (!response.ok) {
      return;
    }

    const coverage = (await response.json()) as CoverageMap;
    await guardarCoberturaApi(coverage);
  } catch {
    // La cobertura de API es complementaria. No debe ocultar el resultado real
    // de las pruebas de Playwright si el servidor ya ha sido detenido.
  }
}
