# Verificación y pendientes de entrega

## Pruebas automáticas

- Dominio: fechas reales/bisiestas, solicitud ficticia, correo, horario, estados, medidas, tamaños e identificadores.
- BD: aplicar el SQL real en SQLite; FK, DNI único, turnos contiguos/superpuestos, confirmación sobre pendiente, bloqueos, inmutabilidad y rollback de revisión antigua.
- Integración del Worker: ejecutar el build en Miniflare con D1 aislada; 401/403, solicitud idempotente, confirmación, consulta, atendido y recarga.
- TypeScript y build de producción.

La ejecución de cada prueba debe verificarse antes de presentar su resultado como aprobado.

## Revisión SEO implementada

- Landing y solicitud tienen `title`, meta description, canonical y contenido HTML renderizado en servidor.
- `lang="es-AR"`, jerarquía de encabezados y navegación semántica.
- `robots.txt` y sitemap incluyen solo las páginas públicas pertinentes.
- Panel, acceso y prototipos llevan `noindex`.
- Ilustración SVG decorativa, sin petición de imagen pesada ni fotografía de una persona inventada.
- CSS responsive, foco visible, enlace de salto y movimiento reducido.

## Pendiente antes de entregar

1. Revisión complementaria en un teléfono físico y contraste con herramienta específica.
2. Reporte Lighthouse/PageSpeed en una URL pública accesible. No se declara una puntuación no medida.
3. Publicar el repositorio en GitHub con historial y participación del equipo.
4. Habilitar la audiencia pública del sitio si el propietario lo autoriza; el panel mantiene su autorización propia.
5. Adjuntar prototipo y análisis, modelo, documentación final y uso de IA.
6. Ensayar el flujo con las cuentas autorizadas que se usarán en la defensa.

La URL del sitio, la audiencia de hosting y la autorización del panel son tres cuestiones distintas. Un sitio publicado con audiencia privada todavía no acredita el requisito de URL pública del TP.

## Resultados observados en esta iteración

- 7 pruebas de dominio aprobadas.
- 7 pruebas de integridad SQL aprobadas.
- Prueba de integración sobre el Worker compilado con D1 aislada: aprobada para autorización, solicitud, idempotencia, confirmación, conflicto de versión, consulta y recarga.
- Navegador de escritorio: solicitud ficticia enviada desde el formulario y comprobante pendiente observado. Se verificó su fila en la BD local.
- Navegador de escritorio: formulario de consulta y visualización del motivo, observaciones e indicaciones en el historial del prototipo visual.
- Corrección durante QA: el identificador idempotente se genera con `getRandomValues`, compatible con el preview HTTP; no depende de `randomUUID` disponible únicamente en contextos seguros del navegador.
- No se ha medido una puntuación Lighthouse/PageSpeed ni realizado una prueba en un teléfono físico.

- Responsive observado en navegador mediante marcos de 390 × 844 px: inicio, solicitud y panel sin desbordamiento horizontal. Es una revisión de viewport, no una prueba en teléfono físico. La ruta temporal de QA se quitó antes del deploy.
- Comprobación SEO sobre el HTML servido por el Worker: un H1 en inicio, description, canonical, sitemap público y robots. No equivale a una puntuación Lighthouse.

## Captura de la página pública

![Página pública de NutriBalance en escritorio](evidencias/inicio-escritorio.jpg)

Captura del preview revisado. El endpoint y la BD se verificaron aparte con las pruebas de integración.
