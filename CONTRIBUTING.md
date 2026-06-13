# Cómo contribuir en clase

Este repositorio se usa como laboratorio docente. Cada alumno trabaja sobre una issue asignada y abre una Pull Request.

## Flujo de trabajo

1. No trabajes directamente sobre main.
2. Haz fork del repositorio.
3. Clona tu fork.
4. Crea una rama por ejercicio.

```bash
git checkout -b alumno-04/contacto-directo
```

5. Implementa el cambio.
6. Ejecuta calidad y tests.

```bash
npm run quality
npm run test:e2e:local
```

7. Haz commit.

```bash
git add .
git commit -m "Añade prueba de Contacto Directo"
```

8. Sube la rama.

```bash
git push -u origin alumno-04/contacto-directo
```

9. Abre una Pull Request contra main.

## Reglas

- No subir node_modules.
- No subir playwright-report ni test-results.
- No subir .env ni secretos.
- No comentar tests para que pasen.
- Si un test solo aplica a local-first, usa el decorador de entorno.
- Los specs deben expresar intención, no detalles técnicos.
- Si añades localizadores complejos, encapsúlalos en POM o COM.

## Checklist antes de abrir PR

- [ ] He ejecutado npm run quality.
- [ ] He ejecutado npm run test:e2e:local.
- [ ] El cambio está relacionado con mi issue.
- [ ] No he tocado archivos generados.
- [ ] La Pull Request explica qué se ha cambiado y cómo se prueba.
