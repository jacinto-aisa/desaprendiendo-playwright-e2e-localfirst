Instrucciones adicionales

- Para arrancar el host web .NET que sirve los archivos estáticos:
  dotnet run --project playwright-dotnet/WebHost

- Para ejecutar los tests desde VS o CLI:
  dotnet test playwright-dotnet/PlaywrightDotnet.Tests

- CI: se añadió .github/workflows/ci.yml que instala .NET 8, restaura herramientas, instala navegadores y ejecuta tests.
- Publicación: .github/workflows/deploy_static_site.yml publica la carpeta web-local-instrumented en GitHub Pages.

Recomendaciones de revisión estática
- Usa herramientas externas antes de push:
  - dotnet format --verify-no-changes
  - dotnet build -warnaserror
- Para HTML/CSS/JS si se mantienen ficheros estáticos, usa herramientas en CI (ej. npm + eslint/stylelint/htmlhint) si necesitas reglas precisas.
