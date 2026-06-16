# Cobertura real E2E con Playwright + Istanbul/NYC

Este proyecto genera cobertura real de la aplicación local-first cuando las pruebas de Playwright navegan por la web instrumentada y cuando las pruebas API ejercitan la API local instrumentada.

## Comando principal

```bash
npm run coverage:e2e
```

También se puede usar el alias docente:

```bash
npm run test:e2e:coverage
```

Ambos comandos hacen lo mismo:

1. Limpian cobertura anterior.
2. Instrumentan `web-local` en `web-local-instrumented`.
3. Instrumentan `api-local` en `api-local-instrumented`.
4. Ejecutan Playwright contra el entorno local-first.
5. Guardan fragmentos Istanbul en `.nyc_output`.
6. Generan el informe final en `coverage/e2e`.

## Salidas generadas

Después de ejecutar el comando deben aparecer estos ficheros:

```text
coverage/e2e/index.html
coverage/e2e/lcov.info
coverage/e2e/coverage-summary.json
coverage/e2e/coverage-final.json
coverage/e2e/cobertura-coverage.xml
```

Uso recomendado:

- `coverage/e2e/index.html`: informe visual para abrir en navegador.
- `coverage/e2e/lcov.info`: fichero recomendado para SonarQube/SonarCloud en proyectos JavaScript/TypeScript.
- `coverage/e2e/coverage-summary.json`: resumen automático para CI.
- `coverage/e2e/coverage-final.json`: cobertura completa en formato JSON Istanbul.
- `coverage/e2e/cobertura-coverage.xml`: formato XML Cobertura para herramientas que lo admitan.

## SonarQube / SonarCloud

El proyecto incluye `sonar-project.properties` con esta línea importante:

```properties
sonar.javascript.lcov.reportPaths=coverage/e2e/lcov.info
```

Por tanto, el orden correcto en CI es:

```bash
npm ci
npx playwright install --with-deps chromium
npm run coverage:e2e
sonar-scanner
```

## CodeQL

CodeQL no consume directamente cobertura de tests. CodeQL genera análisis estático de seguridad y calidad en formato SARIF. Para GitHub Actions, lo correcto es mantener CodeQL separado y subir `coverage/e2e/lcov.info` como artifact o pasarlo a SonarCloud/Codecov/Coveralls si se desea visualizar cobertura.

## Por qué se corrigió el problema

Antes, `coverage:e2e` estaba definido así:

```json
"coverage:e2e": "npm run test:e2e:coverage && npm run coverage:e2e:report"
```

Eso tiene un problema didáctico importante: si alguna prueba fallaba, `&&` impedía ejecutar `nyc report`. Entonces podían existir fragmentos en `.nyc_output`, pero no se generaba `coverage/e2e/lcov.info` ni `coverage/e2e/index.html`.

Ahora `test:e2e:coverage` ejecuta un script orquestador:

```text
tests/scripts/run-e2e-coverage.mjs
```

Ese script intenta generar el informe incluso si alguna prueba falla. Así el directorio `coverage/e2e` no queda vacío sin explicación.

Si no hay ningún fragmento en `.nyc_output`, se genera un diagnóstico en:

```text
coverage/e2e/COBERTURA_NO_GENERADA.txt
```
