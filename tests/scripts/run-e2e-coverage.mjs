import { spawnSync } from 'node:child_process';

function ejecutar(comando, opciones = {}) {
  return spawnSync(comando, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ...opciones.env,
    },
  });
}

function statusDe(resultado) {
  return resultado.status ?? 1;
}

const envCoverage = {
  E2E_TARGET: 'local',
  E2E_COVERAGE: '1',
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://127.0.0.1:3001',
  API_PORT: process.env.API_PORT ?? '3001',
};

const resultadoLimpieza = ejecutar('npm run clean:coverage');
if (resultadoLimpieza.status !== 0) {
  process.exit(statusDe(resultadoLimpieza));
}

const resultadoTests = ejecutar(
  'npx --no-install playwright test --config=tests/playwright.coverage.config.ts',
  { env: envCoverage }
);

/*
 * Importante para CI y docencia:
 * aunque alguna prueba falle, intentamos generar el informe con la cobertura
 * recogida hasta ese momento. Así no aparece coverage/e2e vacío y se puede
 * diagnosticar qué se ha cubierto realmente.
 */
const resultadoInforme = ejecutar('npm run coverage:e2e:report', {
  env: envCoverage,
});

if (resultadoTests.status !== 0) {
  process.exit(statusDe(resultadoTests));
}

process.exit(statusDe(resultadoInforme));
