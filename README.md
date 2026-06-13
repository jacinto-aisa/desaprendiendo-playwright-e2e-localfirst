# Desaprendiendo Playwright E2E Local-first

Repositorio docente para practicar Playwright, Page Objects, Component Objects, fixtures, flows, builders, API testing y CI/CD con
GitHub Actions.

## Objetivo

Aprender a construir y mantener una suite E2E profesional sobre una copia local-first del portfolio Desaprendiendo.

## Requisitos

- Node.js LTS
- npm
- Git

## Instalación

```bash
npm ci
npx playwright install
```

## Calidad del código

```bash
npm run quality
```

## Ejecutar local-first

```bash
npm run test:e2e:local
```

## Ejecutar producción

```bash
npm run test:e2e:prod
```

## Ejecutar con navegador visible

```bash
npm run test:e2e:local:headed
```

## Ver reporte

```bash
npm run report:e2e
```

## Participar en clase

1. Haz fork del repositorio.
2. Clona tu fork.
3. Crea una rama para tu ejercicio.
4. Ejecuta `npm run quality`.
5. Ejecuta `npm run test:e2e:local`.
6. Implementa tu tarea.
7. Abre una Pull Request.
8. Revisa el resultado de GitHub Actions.
