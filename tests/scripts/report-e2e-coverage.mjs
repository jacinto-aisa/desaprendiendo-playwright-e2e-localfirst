import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const tempDir = path.resolve('.nyc_output');
const reportDir = path.resolve('coverage', 'e2e');

function listarFragmentosCobertura() {
  if (!fs.existsSync(tempDir)) {
    return [];
  }

  return fs
    .readdirSync(tempDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(tempDir, file));
}

function crearDiagnosticoSinCobertura() {
  fs.mkdirSync(reportDir, { recursive: true });

  const diagnostico = [
    'No se han encontrado fragmentos de cobertura en .nyc_output.',
    '',
    'Causas habituales:',
    '1. Se ha ejecutado npm run test:e2e:local o npm run test:e2e en vez de npm run test:e2e:coverage.',
    '2. Las pruebas UI no están importando test desde @fixtures/CoverageFixtures o @fixtures/AppFixtures.',
    '3. La web no se ha servido desde web-local-instrumented.',
    '4. La variable E2E_COVERAGE no vale 1.',
    '5. Las pruebas han fallado antes de abrir una página instrumentada.',
    '',
    'Comando recomendado:',
    'npm run coverage:e2e',
    '',
  ].join('\n');

  fs.writeFileSync(
    path.join(reportDir, 'COBERTURA_NO_GENERADA.txt'),
    diagnostico,
    'utf-8'
  );
}

function ejecutarNycReport() {
  const comando = [
    'npx --no-install nyc report',
    '--temp-dir .nyc_output',
    '--report-dir coverage/e2e',
    '--reporter=html',
    '--reporter=lcov',
    '--reporter=json',
    '--reporter=json-summary',
    '--reporter=cobertura',
    '--reporter=text-summary',
  ].join(' ');

  return spawnSync(comando, {
    stdio: 'inherit',
    shell: true,
  });
}

const fragmentos = listarFragmentosCobertura();

if (fragmentos.length === 0) {
  crearDiagnosticoSinCobertura();
  console.error('No hay fragmentos de cobertura en .nyc_output. Revisa coverage/e2e/COBERTURA_NO_GENERADA.txt');
  process.exit(1);
}

console.log(`Generando informe Istanbul/NYC con ${fragmentos.length} fragmento(s) de cobertura...`);

const resultado = ejecutarNycReport();

if (resultado.status !== 0) {
  process.exit(resultado.status ?? 1);
}

const rutasEsperadas = [
  path.join(reportDir, 'index.html'),
  path.join(reportDir, 'lcov.info'),
  path.join(reportDir, 'coverage-summary.json'),
  path.join(reportDir, 'coverage-final.json'),
  path.join(reportDir, 'cobertura-coverage.xml'),
];

const faltantes = rutasEsperadas.filter((ruta) => !fs.existsSync(ruta));

if (faltantes.length > 0) {
  console.error('El informe se ha generado parcialmente. Faltan estos ficheros:');
  for (const ruta of faltantes) {
    console.error(`- ${path.relative(process.cwd(), ruta)}`);
  }
  process.exit(1);
}

console.log('Informe de cobertura generado correctamente:');
console.log('- coverage/e2e/index.html');
console.log('- coverage/e2e/lcov.info');
console.log('- coverage/e2e/coverage-summary.json');
console.log('- coverage/e2e/coverage-final.json');
console.log('- coverage/e2e/cobertura-coverage.xml');
