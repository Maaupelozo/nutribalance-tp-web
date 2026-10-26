# Verificación y pendientes de entrega

## Integración Express — 26 de octubre de 2026

TypeScript, compilación y pruebas unitarias del cliente/gateway: aprobadas. La ejecución del Worker compilado contra la API real verificó login, 401 anónimo, CSRF inválido 403, validación 400, alta/edición/recarga de paciente, solicitud 201, conflicto de slot 409, confirmación vinculada, consulta independiente e historial, cancelación/liberación de horario y logout 204 con posterior 401.

La ficha ficticia de verificación tiene UUID `51581661-7a50-4887-a845-681167437ccb`; la consulta `6e46ff37-83ef-4053-bcca-49c77e11eabf`. El turno `21380706-5943-4911-b39f-9580081a4e59` quedó cancelado. No se guardaron credenciales en archivos. Estas lecturas no acreditan inspección directa ni reinicio de PostgreSQL.

Pendientes: revisión en navegador, móvil y teclado; consulta vinculada a un turno que ya comenzó; persistencia después de reiniciar el backend. No hubo un navegador automatizable disponible. Ver [la integración](integracion-api.md) y la prueba optativa `tests/express-live-flow.mjs`.

Las secciones de dominio, SQL y D1 siguientes documentan el respaldo anterior. No deben atribuirse al backend Express.

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
4. Mantener la audiencia pública ya autorizada y comprobar el acceso externo; el panel mantiene su autorización propia.
5. Adjuntar prototipo y análisis, modelo, documentación final y uso de IA.
6. Ensayar el flujo con las cuentas autorizadas que se usarán en la defensa.

La URL del sitio, la audiencia de hosting y la autorización del panel son tres cuestiones distintas. Un sitio publicado con audiencia privada todavía no acredita el requisito de URL pública del TP.

## Evidencia previa conservada

Estos resultados proceden de la iteración anterior. No equivalen a una nueva ejecución en este equipo:

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

## Verificación del 26 de octubre de 2026

La revisión parte del commit `8d56c797ab281f2858ba8982a36f0cce6e18a111`. Se ejecutaron estos controles sobre los cambios de cierre:

| Control | Resultado |
|---|---|
| TypeScript (`pnpm exec tsc --noEmit`) | Aprobado |
| Dominio y cliente HTTP (`pnpm test`) | 10 pruebas aprobadas |
| Migración en SQLite (`python3 tests/database_test.py`) | 7 pruebas aprobadas |
| Build de producción | Aprobado con Vinext/Vite en Windows |
| Worker compilado + D1 aislada | Aprobado: permisos, solicitud, idempotencia, confirmación, revisión, consulta, atendido y recarga |
| Reintento con otra hora en el formulario | Devuelve la hora original guardada, sin crear otro paciente/turno |
| Consulta sin comando separado de asistencia | El servidor cambia el turno a atendido |
| Consulta inválida | No agrega registros ni cambia la revisión |
| Conflicto de revisión | HTTP 409 y `Cache-Control: no-store` |
| Sesión vencida | Pruebas del cliente preservan 401 y verifican un solo envío, sin reintento automático |
| API Express externa | Bloqueada: HTTP 530, Cloudflare 1033 en CSRF y disponibilidad |
| D1 desplegada, antes de la prueba | Tablas presentes; pacientes, turnos y consultas vacíos |
| Navegador y responsive de esta iteración | Sin verificar: el inventario de navegadores de automatización está vacío |
| Lighthouse/PageSpeed | Pendiente; la API de PageSpeed devuelve 429 por cuota agotada, sin puntuación |

Las pruebas de Worker ejecutan SQL real en D1 local aislada. No constituyen una prueba de producción ni de PostgreSQL. La cuenta de preview y `.dev.vars` son ficticias, locales e ignoradas por Git.

La instalación inicial venció durante descargas y se reanudó con la caché y un tiempo de espera mayor, sin cambiar las versiones del lockfile. En este equipo el runner de Node y el build necesitaron ejecución fuera de la restricción que impedía crear procesos; los primeros fallos de `spawn EPERM` no fueron fallos de las reglas de negocio.

## Comprobación posterior a la publicación

La versión 5 publicada corresponde al commit `2d0975844547139237fcc6b49c0ac2da6fc3a632`. Una petición real a `/api/solicitudes` devuelve 201 y el código `NT-F4C738E4CD`, para el 28 de octubre de 2026 a las 15:00 Argentina. El reenvío con la misma clave y otra hora devuelve el mismo comprobante. La lectura independiente de D1 encuentra un paciente ficticio y un turno pendiente con ese código; ninguna consulta ni duplicados. Esto acredita solicitud y persistencia de producción, no el recorrido profesional completo.

El propietario autorizó el acceso público. Después del cambio se comprobó el inicio sin credenciales (200) y la API del panel anónima (401, `Cache-Control: no-store`). El acceso público al sitio no concede identidad ni permisos profesionales.

## Rediseño editorial posterior

El propietario aprobó aplicar la propuesta de identidad, tipografía, composición, formulario y panel. TypeScript, diez pruebas de dominio/cliente HTTP, el build y el Worker con D1 aislada aprobaron sobre el rediseño. La prueba del Worker comprueba también la identidad de Mauricio, las secciones públicas, los metadatos y los grupos semánticos del formulario.

Una revisión independiente de código verificó la dirección y los vínculos de consulta. Sus dos ajustes se aplicaron y se revisaron: el menú móvil cerrado no recibe foco y el botón anuncia su estado; la fecha pasó a información de apoyo debajo del H1. El veredicto se limita a esas correcciones y al código. Sin navegador ni nuevas capturas, no acredita composición renderizada, interacción de teclado ni responsive visual.

## Limpieza posterior del proyecto

Se retiraron 82 archivos versionados sin uso en el flujo activo: catálogo UI, auxiliares de ese catálogo, ejemplos, recursos iniciales, scripts npm heredados, configuración de shadcn/Tailwind y metadatos temporales de diseño. Se eliminaron 21 dependencias directas; pnpm retiró 142 paquetes de la instalación y actualizó su lockfile.

Tras la limpieza aprobaron TypeScript, diez pruebas de dominio/cliente HTTP, siete pruebas SQL, el build y la integración Worker + D1 aislada. Las páginas públicas, la autorización, la solicitud idempotente, la confirmación, la consulta y la recarga permanecen comprobadas. Se preservaron la base local, la configuración del hosting, las demos activas, las migraciones, las pruebas y los documentos del TP.
