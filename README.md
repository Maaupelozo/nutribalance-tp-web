# NutriBalance · TP Integrador de Desarrollo Web 2026

Aplicación del escenario 2, NutriTurnos: página de Mauricio Pelozo, solicitud de turnos, acceso profesional, pacientes e historial de consultas.

Sitio: https://nutribalance-mauricio.maauri.chatgpt.site

**Usá únicamente datos ficticios.** Las credenciales de prueba se entregan por separado y no forman parte del código.

## Flujo principal

1. Abrí `/solicitar-turno`, elegí una fecha y un horario disponible de Argentina.
2. Enviá nombre, teléfono y, opcionalmente, correo. La API genera un turno pendiente y su comprobante UUID; todavía no crea una ficha clínica.
3. Ingresá en `/ingresar` con la cuenta profesional creada en Express.
4. Buscá o creá la ficha del paciente y vinculala al confirmar la solicitud en Agenda.
5. Desde un turno confirmado que ya comenzó, abrí **Registrar consulta**. Al guardar una consulta vinculada, Express debe marcar el turno como atendido en la misma transacción.
6. También podés registrar una consulta independiente desde la ficha. Esa consulta no modifica ningún turno.
7. Recargá el historial y cerrá la sesión al terminar.

Los turnos duran 30 minutos, de lunes a viernes entre 09:00 y 17:00, con un horizonte de 60 días. Cancelar libera el horario. Para reprogramar, cancelá y solicitá un nuevo turno.

## Arquitectura

- React, TypeScript y CSS propio: interfaz editorial en verde bosque y marfil; fuentes locales Manrope y Source Serif 4.
- Vinext/Vite y Cloudflare Worker: páginas públicas y gateway HTTP.
- Express en `https://api.neadev.com/api/v1`: sesiones, pacientes, disponibilidad, turnos y consultas. El contrato del equipo especifica PostgreSQL; este repositorio no contiene el servidor ni sus migraciones.
- Gateway fijo `/api/v1/*`: reenvía únicamente las rutas del contrato y la cookie `nutri.sid`. Mantiene la sesión en el mismo origen del sitio para evitar depender de cookies de terceros. No acepta destinos arbitrarios ni reenvía la identidad de la plataforma.
- Sesión administrada por Express, cookie HttpOnly/Secure y token CSRF en memoria. No se guardan contraseñas, sesiones ni historias clínicas en `localStorage`.

Los endpoints D1 anteriores y las migraciones permanecen como respaldo. La interfaz principal ya no los utiliza. Los prototipos `/demo-profesional` y `/demo-paciente` siguen siendo demostraciones con datos locales, separadas del panel conectado.

## Rutas

| Ruta | Uso |
|---|---|
| `/` | Presentación y preguntas frecuentes |
| `/solicitar-turno` | Disponibilidad y solicitud pública |
| `/ingresar` | Correo y contraseña de Express |
| `/panel` | Resumen, pacientes, agenda, ficha e historial; Express autoriza cada operación privada |
| `/api/v1/*` | Gateway limitado al contrato externo |
| `/demo-profesional`, `/demo-paciente` | Prototipos visuales, sin acceso a datos de Express |
| `/api/panel`, `/api/solicitudes` | Implementación D1 anterior, conservada como respaldo |

El sitio es público. Eso no concede acceso a pacientes ni consultas: Express exige una sesión profesional en cada endpoint privado. El HTML inicial del panel contiene una pantalla de carga, sin datos clínicos.

## Ejecutar en desarrollo

Requisitos: Node.js 22.13 o superior y pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrí `http://localhost:5173`. Ese origen debe estar permitido por el backend. No se necesita copiar la contraseña a una variable de entorno: se introduce en el formulario de acceso.

Para el respaldo D1, `.env.example` documenta `PROFESSIONAL_EMAILS`. Ese valor solo se configura en el servidor; no interviene en el login Express. Las migraciones están en `drizzle/`.

## Verificar

```sh
pnpm exec tsc --noEmit
pnpm test
pnpm build
node --import ./scripts/sites-env.mjs tests/worker-flow.mjs
```

Las pruebas unitarias cubren CSRF, rotación de sesión, cierre 204, conflictos, límites de reintento y restricciones del gateway. `worker-flow.mjs` verifica el respaldo D1 en una base aislada.

La prueba optativa `tests/express-live-flow.mjs` usa el Worker compilado contra Express real. Recibe un objeto JSON con `email` y `password` por stdin; si se ejecuta en una terminal interactiva, oculta la entrada. **Crea una ficha y consulta ficticias y cancela su turno de prueba**. No debe ejecutarse como parte de las pruebas unitarias. Con `--production --read-only` y un `patientId` de prueba verifica la publicación sin crear registros nuevos.

No incluyas credenciales en argumentos, archivos, Git ni capturas.

## Archivos principales

| Archivo | Responsabilidad |
|---|---|
| `lib/express-api.ts` | Cliente tipado, sesión, CSRF, recursos y fechas |
| `lib/server/express-gateway.ts` | Rutas permitidas, cookies, origen y timeout |
| `app/api/v1/[...path]/route.ts` | Entrada HTTP del gateway |
| `components/public/LoginForm.tsx` | Acceso profesional |
| `components/public/RequestForm.tsx` | Horarios, solicitud y comprobante |
| `app/panel/ExpressDashboard.tsx` | Panel conectado a Express |
| `app/panel/Dashboard.tsx` | Prototipos y versión D1 anterior |
| `docs/api-externa/` | Contrato original recibido, sin credenciales |

Consultá [la integración](docs/integracion-api.md), [la verificación](docs/verificacion.md) y [el estado de entrega](docs/estado-entrega.md) para conocer la evidencia y los pendientes.
