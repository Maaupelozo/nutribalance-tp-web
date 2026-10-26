# Estado de entrega del TP

Este documento permite al equipo preparar la defensa de NutriBalance y distinguir evidencia comprobada de tareas pendientes. Fecha de revisión: 26 de octubre de 2026. La consigna original fija la entrega y defensa final para esa fecha y la recuperación para el 16 de noviembre de 2026.

## Flujo disponible

El código implementa página profesional, solicitud pública, autorización del panel, agenda, alta/edición de pacientes, ficha, consulta e historial sobre D1. El flujo se prueba con el Worker compilado y una base D1 local aislada. La consulta finalizada y el estado atendido se guardan desde el servidor dentro de una misma transacción.

El contrato Express está conservado en el repositorio, junto con su [plan de integración](integracion-api.md). El cliente Express no está implementado. La API externa devuelve Cloudflare 1033 y no permite comprobar persistencia ni sesión.

## Requisitos y evidencia

La matriz corresponde al escenario 2 y a los requisitos comunes de la consigna original:

| Requisito | Evidencia disponible | Pendiente |
|---|---|---|
| Análisis funcional | [Problema, usuarios, alcance y requisitos](analisis-funcional.md) | Validación y revisión por el equipo |
| UI/UX y prototipo | Prototipos navegables `/demo-profesional` y `/demo-paciente`; captura conservada | Adjuntar wireframes y enlace/capturas del prototipo utilizado por el equipo |
| Responsive y accesibilidad | CSS adaptable, labels, foco, modales, mensajes y revisión previa documentada | Revisión visual de esta versión y teléfono físico; no hubo navegador automatizable disponible |
| Página pública y solicitud | HTML renderizado, inicio anónimo 200 y solicitud HTTP 201 guardada en D1 | Recorrido visual desde un navegador externo |
| Pacientes, turnos e historial | Worker + D1 aislada, siete pruebas SQL y paciente/turno ficticios comprobados en D1 de producción | Consulta e historial manuales en producción con cuenta profesional autorizada |
| Autenticación | 401 anónimo y 403 cuenta sin permiso en Worker | Probar entrada/salida real de la cuenta usada en la defensa |
| Modelo de datos | [Esquema y explicación](modelo-datos.md), Drizzle y SQL | Revisión oral por todos los integrantes |
| SEO | Prueba de HTML: H1, description, canonical, sitemap y robots | Medición Lighthouse/PageSpeed; la API de Google devuelve 429 por cuota |
| Deploy | Cambios publicados en Sites con D1 y comprobación HTTP | Recorrido visual del flujo profesional |
| URL pública | Audiencia pública autorizada; inicio anónimo 200 y API privada 401 | Mantener acceso para la defensa |
| Git/GitHub | Historial recuperado, rama de trabajo y respaldo local | Repositorio GitHub del equipo con acceso e integrantes reales |
| Documento final y uso de IA | README y [guía de defensa](defensa.md) | Completar distribución real de tareas y dificultades del equipo |

## Prepará la demostración

Antes de la defensa, completá estos pasos:

1. Revisá el código y ensayá las explicaciones de la [guía de defensa](defensa.md). No atribuyas a integrantes contribuciones no verificadas.
2. Publicá el código en el GitHub del equipo conservando su historial. Asociá la versión demostrada con su commit real.
3. Comprobá el acceso público desde otro dispositivo. El propietario ya autorizó abrir la audiencia; mantené la autorización del panel en servidor.
4. Con una cuenta autorizada, recorré solicitud, confirmación, consulta e historial en producción. Usá exclusivamente datos ficticios y recargá para comprobar persistencia.
5. Verificá el acceso anónimo a páginas públicas y la denegación de datos privados.
6. Revisá móvil, teclado y errores; obtené el reporte Lighthouse/PageSpeed sin inventar resultados.
7. Adjuntá análisis, wireframes/prototipo, modelo de datos, README, evidencias y distribución real de tareas.

Si Express no está operativo, presentá la persistencia D1 que puedas demostrar. Explicá Express como integración pendiente y sus diferencias; no muestres `ejemplos.json` como una base real.

## Reproducí las comprobaciones

Con Node.js 22.13 o superior, pnpm 11.25.0 y Python 3, ejecutá desde la raíz del proyecto:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm test
python3 tests/database_test.py
pnpm build
node --import ./scripts/sites-env.mjs tests/worker-flow.mjs
```

En Windows, sustituí `python3` por la ruta del Python 3 instalado si ese comando no existe. El test del Worker crea una base aislada y no escribe en producción. Consultá [la verificación](verificacion.md) para conocer el alcance de cada resultado.

## Conservá una ruta de retorno

La rama local es `tp/cierre-integracion`. La etiqueta local `respaldo-v4-2026-10-26` identifica la fuente recuperada antes de cambios y `respaldo-v7-antes-redisenio` conserva el punto anterior al rediseño. El respaldo ZIP temporal se retiró en la limpieza; el historial y las etiquetas permanecen en Git.

Los cambios de cierre no agregan migraciones ni sustituyen D1. El hosting mantiene las versiones guardadas previas. Si necesitás regresar, seleccioná una versión anterior verificada en Sites y volvé a comprobar su flujo; no borres la base ni sobrescribas el historial Git.
