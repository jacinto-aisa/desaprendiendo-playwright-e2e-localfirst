import fs from 'node:fs';
import path from 'node:path';
import { createInstrumenter } from 'istanbul-lib-instrument';

const sourceRoot = path.resolve('api-local');
const outputRoot = path.resolve('api-local-instrumented');

const instrumenter = createInstrumenter({
  coverageVariable: '__coverage__',
  compact: false,
});

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function shouldInstrument(filePath) {
  return filePath.endsWith('.js');
}

function copyAndInstrument(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    ensureDir(target);
    for (const entry of fs.readdirSync(source)) {
      copyAndInstrument(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  ensureDir(path.dirname(target));

  if (!shouldInstrument(source)) {
    fs.copyFileSync(source, target);
    return;
  }

  const code = fs.readFileSync(source, 'utf8');
  const relativeName = path.relative(process.cwd(), source).replaceAll('\\', '/');
  const instrumented = instrumenter.instrumentSync(code, relativeName);
  fs.writeFileSync(target, instrumented, 'utf8');
}

if (!fs.existsSync(sourceRoot)) {
  throw new Error(`No existe la carpeta ${sourceRoot}`);
}

fs.rmSync(outputRoot, { recursive: true, force: true });
copyAndInstrument(sourceRoot, outputRoot);

console.log(`API instrumentada en: ${outputRoot}`);
