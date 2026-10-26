# NutriBalance · TP Integrador de Desarrollo Web 2026

MVP del **escenario 2: NutriTurnos**, adaptado al proyecto NutriBalance. Permite presentar el servicio, solicitar un turno, revisarlo desde el panel profesional y registrar una consulta en el historial del paciente.

Versión publicada: https://nutribalance-mauricio.maauri.chatgpt.site (acceso público autorizado por el propietario; panel protegido por servidor).

**Solo datos ficticios.** Esta aplicación es una entrega académica, no un sistema clínico listo para uso real.

## Flujo principal

1. Visitar `/` y abrir `/solicitar-turno`.
2. Enviar nombre, correo, teléfono, fecha y hora preferidos. La solicitud se guarda en D1 con estado pendiente.
3. Acceder a `/ingresar` con una cuenta profesional autorizada.
4. Abrir `/panel`, actualizar los datos y revisar el turno en la agenda o ficha del paciente.
5. Confirmar o reprogramar. Los turnos confirmados no pueden superponerse entre sí ni con un bloqueo.
6. Abrir el turno, seleccionar **Registrar consulta** y completar motivo, medidas, observaciones, objetivos y plan/indicaciones.
7. Guardar. La consulta se incorpora al historial y el turno asociado pasa a atendido. Recargar para comprobar persistencia.

La solicitud pública no expone huecos de agenda ni confirma automáticamente una reserva. La profesional conserva el control del horario definitivo.

## Stack y justificación

- **React + TypeScript:** frontend existente y tipos compartidos entre formularios, cliente HTTP y servidor.
- **CSS propio:** dirección editorial con verde bosque/marfil, títulos Source Serif 4, interfaz Manrope y fuentes WOFF2 locales. Tokens compartidos, foco visible y movimiento reducido.
- **Vinext/Vite:** renderizado de páginas públicas y rutas HTTP en un mismo proyecto. Conserva la integración de hosting del proyecto original.
- **Cloudflare Workers:** backend mínimo; dos endpoints para el flujo principal.
- **D1 (SQLite) + Drizzle:** relaciones entre pacientes, turnos y consultas; migraciones SQL versionadas. No se usa `localStorage` como reemplazo de la base de datos del flujo obligatorio.
- **Autenticación de la plataforma:** inicio de sesión con ChatGPT y lista de cuentas autorizadas en el servidor. No se inventa un login de contraseña en el navegador.

El flujo comprobable utiliza D1. La integración Express del compañero se conserva como evolución pendiente de un servidor operativo. Ver [comparación y plan de integración](docs/integracion-api.md), con el contrato recibido y los criterios para cambiar de backend.

## Rutas

| Ruta | Finalidad | Acceso |
|---|---|---|
| `/` | Presentación del servicio, CTA y preguntas frecuentes | Compatible con visitantes anónimos |
| `/solicitar-turno` | Formulario y comprobante de solicitud | Compatible con visitantes anónimos |
| `/ingresar` | Inicio de sesión profesional | Identidad de plataforma |
| `/panel` | Agenda, pacientes e historial | Cuenta autorizada, comprobación en servidor |
| `/demo-paciente` | Complemento visual con datos ficticios locales | Demostración, no acceso a la BD clínica |
| `/demo-profesional` | Prototipo visual anterior para revisión de UI | Demostración, no acceso a la BD clínica |
| `/api/solicitudes` | POST de solicitud pública | Datos mínimos; no permite consultar historiales |
| `/api/panel` | GET de datos y POST de cambios | Identidad + permiso profesional |
| `/robots.txt`, `/sitemap.xml` | SEO de las páginas públicas | Sin información clínica |

**Visibilidad del hosting:** el propietario autorizó el acceso público el 26 de octubre de 2026. Se comprobó el inicio con HTTP 200 sin credenciales y la API del panel con HTTP 401 para un visitante anónimo. El acceso público al sitio no concede permisos profesionales.

## Estructura

```text
app/page.tsx                  Página pública renderizada en servidor
app/solicitar-turno/           Solicitud de turno
app/ingresar/                 Acceso profesional
app/panel/                    Página protegida y dashboard
app/api/                      Backend mínimo
components/public/            Cabecera y formulario público
lib/types.ts                  Tipos del dominio
lib/api-client.ts             Cliente HTTP y detección de cambios
lib/validation.ts             Validaciones puras
lib/server/                   Autorización y repositorio SQL
lib/demo-data.ts              Ejemplos ficticios de los prototipos
app/globals.css               Entrada de estilos
app/styles/                   Tokens, bases, páginas públicas y panel
db/schema.ts                  Esquema Drizzle
drizzle/                      Migraciones SQL y metadatos
tests/                        Validación del dominio, BD y Worker
docs/                         Análisis, modelo de datos y defensa
```

## Ejecución local

Requisitos: Node.js 22.13 o superior, pnpm y Python 3 (solo para pruebas SQL). Instalar las versiones bloqueadas por `pnpm-lock.yaml`:

```sh
pnpm install --frozen-lockfile
```

Copiar `.env.example` a `.dev.vars` y completar `PROFESSIONAL_EMAILS` únicamente en ese archivo ignorado. No subir cuentas autorizadas ni secretos al repositorio.

Una descarga o clon limpio usa automáticamente el perfil portable en Windows/macOS/Linux. En ese perfil, la autenticación simulada es `seedy@sites.test`, exclusiva de loopback; agregarla a la configuración **local** para probar el panel. La identidad simulada no debe habilitarse ni autorizarse en producción.

Construir una vez para obtener la configuración de D1:

```sh
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chubby_blue_marvel.sql
pnpm dev
```

Aplicar la migración solo una vez por base local. Si se agregan migraciones, ejecutarlas en orden. Los datos de desarrollo y producción son independientes. Para publicar se utiliza el flujo de Sites, que aplica las migraciones de producción.

## Variables de servidor

- `PROFESSIONAL_EMAILS`: lista de correos profesionales autorizados, separados por comas. Se configura como secreto de entorno del hosting; el frontend no recibe la lista.
- `DB`: binding D1, declarado en `.openai/hosting.json` y provisionado por el hosting.

La sesión de ChatGPT demuestra identidad; el servidor valida además la pertenencia a la lista profesional. Un usuario autenticado cualquiera no obtiene acceso al panel.

## Verificación

```sh
pnpm exec tsc --noEmit
pnpm test
python3 tests/database_test.py
pnpm build
node --import ./scripts/sites-env.mjs tests/worker-flow.mjs
```

La prueba del Worker usa el build real con una base D1 aislada en Miniflare; no modifica producción. Verifica 401/403, solicitud, prevención de duplicados, confirmación, control de versión, consulta y recarga.

En Windows, `install:ci` heredado requiere Bash; podés instalar con `pnpm install --frozen-lockfile` desde PowerShell. Usá pnpm 11.25.0 según `packageManager`. Si una descarga vence, repetí la instalación con `--fetch-timeout=180000 --network-concurrency=4`; conserva la caché y el lockfile. Para las pruebas SQL, usá el ejecutable Python 3 disponible en tu equipo.

## Alcance y límites

- Persistencia del MVP: pacientes (incluidos datos de contacto), agenda, bloqueos y consultas.
- Consultas finalizadas: no se sobrescriben; los registros anteriores se conservan.
- Solicitudes públicas: idempotentes por identificador; repetir el mismo envío no crea otro turno.
- Comprobante: fecha y hora provienen del registro guardado, también cuando un reintento trae preferencias distintas.
- Consulta finalizada vinculada: el servidor guarda la consulta y marca el turno atendido en la misma transacción, aunque el cliente no envíe un cambio de estado separado.
- Borradores: disponibles en el prototipo visual; el panel persistente ofrece consultas finalizadas porque no implementa reapertura/edición de borradores.
- Sesión vencida durante un guardado: el formulario sigue abierto y permite ingresar en otra pestaña. Volvé al formulario para reenviar conscientemente; no hay reintento automático.
- Cambios simultáneos: control de revisión para evitar sobrescribir una modificación de otra sesión. Ante conflicto, actualizar datos y reintentar.
- Complementos heredados: pagos, archivos, diario, token, objetivos adicionales y configuración visual no integran el flujo persistente obligatorio. No presentarlos como almacenamiento clínico de servidor.
- No hay recordatorios automáticos, facturación, firma electrónica, IA clínica ni receta digital.
- No se cargan automáticamente datos del prototipo local a la base de producción.

## Entrega y defensa

El [rediseño editorial](docs/rediseno-editorial.md) explica la nueva identidad, composición, formulario y prioridades del panel. Los estilos heredados se conservan en una capa de compatibilidad. La revisión visual en navegador y móvil sigue pendiente: el entorno no dispone de navegador automatizable.

Ver [análisis funcional](docs/analisis-funcional.md), [modelo de datos](docs/modelo-datos.md), [guía de defensa](docs/defensa.md), [verificación](docs/verificacion.md) y [estado de entrega](docs/estado-entrega.md).

Pendientes del equipo: publicar este código en su repositorio GitHub, identificar los integrantes y sus contribuciones reales, adjuntar el enlace/capturas del prototipo y completar la medición Lighthouse/PageSpeed y la revisión final en un celular.

## Limpieza del proyecto

La limpieza del proyecto retiró 61 componentes de catálogo sin consumidores, auxiliares y ejemplos ajenos al flujo, SVG iniciales, vendor, scripts npm antiguos y metadatos temporales del asistente. Se quitaron 21 dependencias directas sin uso, incluidas las del catálogo y Tailwind; el CSS propio se procesa con Vite. Se conservan las rutas de demostración, el contexto de diseño en `DESIGN.md`/`PRODUCT.md`, la documentación del TP y las herramientas necesarias para Sites/D1.

## Uso de IA

Se utilizó IA como apoyo para prototipado, generación de código, revisión y documentación. El equipo debe revisar lo incorporado y poder explicar los componentes, las validaciones, la autorización, el modelo relacional, las transacciones y el despliegue. No atribuir al equipo pruebas, entrevistas o decisiones que no haya realizado o validado.
