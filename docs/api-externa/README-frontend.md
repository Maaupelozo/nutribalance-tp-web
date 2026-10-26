# Contrato para frontend - NutriTurnos

Versión 1.0.0, 16/10/2026. Estado: diseño listo para implementar; NO hay servidor ni autenticación implementados todavía.

La fuente de verdad es `openapi.json`, OpenAPI 3.0.3. Se puede importar en Swagger Editor, Postman o una herramienta de mocks compatible. `ejemplos.json` contiene datos ficticios y respuestas para desarrollar las pantallas. El contrato cubre el TP académico, no el sistema comercial presupuestado.

## Decisiones para trabajar en paralelo

- API REST JSON, prefijo `/api/v1`; nombres de propiedades en inglés, mensajes al usuario en español.
- Una sola profesional precargada. El visitante solicita turnos sin cuenta. No hay registro, recuperación de contraseña ni portal de pacientes.
- Una base PostgreSQL y un único proceso desplegable Express; módulos internos independientes.
- En producción, frontend y API bajo el mismo origen mediante proxy. En desarrollo se admite frontend en `http://localhost:5173` y API en `http://localhost:3000`; ambos deben usar `localhost`, no mezclarlo con `127.0.0.1`.
- Fechas de nacimiento/consulta: `YYYY-MM-DD` sin conversión UTC. Instantes de turnos: ISO 8601 con offset obligatorio; respuestas normalizadas a UTC `Z`. Mostrar turnos en `America/Argentina/Buenos_Aires`.
- Turnos de 30 minutos, lunes a viernes 09:00-17:00, horizonte de 60 días. Es una simplificación de diseño, no un requisito literal del TP. No incluye feriados ni calendario configurable.
- Campos opcionales omitidos en creación se guardan como null y aparecen como null en respuestas. En PATCH, ausente conserva y null limpia solo campos nullable. No enviar strings vacíos como sustituto de null.

## Sesión y protección CSRF

1. Llamar `GET /auth/csrf` con `credentials: 'include'`. Crea cookie de sesión anónima y devuelve `csrfToken`.
2. Enviar `POST /auth/login`, JSON de email/password, `credentials: 'include'` y header `X-CSRF-Token`.
3. Guardar en memoria el nuevo `csrfToken` de la respuesta: el login regenera cookie y token. No guardar contraseña ni identificador de sesión en localStorage.
4. Las mutaciones de pacientes, turnos, consultas y logout usan ese token y la cookie. La solicitud pública también obtiene CSRF; CSRF no reemplaza el límite de solicitudes.
5. Al recargar, llamar `GET /auth/me`: 200 recupera user/token/expiresAt; 401 muestra login. El formulario público puede usar `/auth/csrf` sin iniciar sesión.
6. Logout exitoso devuelve 204 sin JSON. Borrar estado de usuario y token. Volver a obtener CSRF para un nuevo login.
7. Si retorna 403 CSRF_INVALID, renovar con `/auth/csrf` y pedir que se reenvíe la acción. No reintentar automáticamente creaciones clínicas o reservas.

La sesión autenticada vence 12 horas después del login, sin renovación por actividad. Cookie `nutri.sid`, HttpOnly; Secure en producción, SameSite=Lax. El navegador administra esa cookie. La API no devuelve JWT. GET de sesión, CSRF y recursos privados: `Cache-Control: no-store`. Cada mutación requiere sesión anónima o autenticada según corresponda y CSRF vinculado a ella.

```ts
const API = import.meta.env.VITE_API_URL ?? '/api/v1';
const csrfResponse = await fetch(`${API}/auth/csrf`, { credentials: 'include' });
if (!csrfResponse.ok) throw new Error('No se pudo iniciar la sesión');
const { csrfToken } = await csrfResponse.json();
const response = await fetch(`${API}/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ email, password }),
});
// Comprobar response.ok antes de usar el cuerpo como Session.
// El token devuelto por login reemplaza al anterior.
```

## Pantallas y endpoints

| Pantalla | Operaciones |
|---|---|
| Solicitar turno | GET /availability?date=YYYY-MM-DD; POST /appointment-requests |
| Login | GET /auth/csrf; POST /auth/login |
| Sesión y navegación privada | GET /auth/me; POST /auth/logout |
| Listado de pacientes | GET /patients?q=Ana&page=1&pageSize=20 |
| Alta/edición de paciente | POST /patients; GET y PATCH /patients/{patientId} |
| Agenda | GET /appointments?from=YYYY-MM-DD&to=YYYY-MM-DD; GET/PATCH /appointments/{appointmentId} |
| Historia clínica | GET/POST /patients/{patientId}/consultations |

## Flujo del visitante a la consulta

1. Consultar horarios del día elegido. La API devuelve solo intervalos libres; no expone contactos.
2. Enviar startsAt EXACTAMENTE como figura en el slot, con nombre y teléfono. La respuesta 201 muestra recibo con id, fecha y estado pending. No muestra ni crea una historia clínica.
3. Profesional accede a agenda y revisa la solicitud. Busca una ficha o la crea; nunca se identifica automáticamente a alguien solo por teléfono o email.
4. Confirma mediante PATCH con `{ "status": "confirmed", "patientId": "UUID" }`. La ficha queda vinculada al turno.
5. Abre la ficha y registra consulta, opcionalmente con appointmentId. Cuando está vinculado, la API guarda consulta y cambia a attended atómicamente.
6. Recarga historial; devuelve la consulta más reciente primero.

Una solicitud pendiente ya ocupa el horario. Ante 409 SLOT_UNAVAILABLE, refrescar disponibilidad y pedir otra elección, sin borrar datos de contacto. Cancelar libera el horario. La API no permite reprogramación en esta versión: cancelar y crear otra solicitud.

## Estados del turno

| Estado actual | Acciones permitidas |
|---|---|
| pending | Confirmar vinculando paciente; cancelar |
| confirmed | Marcar atendido; cancelar; registrar consulta vinculada |
| attended / cancelled | Solo lectura |

Reenviar el mismo estado no duplica ni altera datos. Un turno ya vinculado no cambia de paciente. Se admite marcar attended sin consulta, pero luego una consulta vinculada exige confirmed: la UI debe preferir “Registrar consulta” cuando se quiere completar ambos pasos. No hay un endpoint para devolver estados hacia atrás.

## Errores y validación

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisá los campos indicados.",
    "details": [{ "field": "firstName", "message": "El nombre es obligatorio." }]
  },
  "requestId": "req-ejemplo-001"
}
```

| HTTP | Uso en pantalla |
|---|---|
| 400 | Mostrar details junto a cada campo; mensaje general si no hay detalles. |
| 401 | Login: credenciales inválidas; otras rutas privadas: volver al login. |
| 403 | Renovar CSRF; conservar los datos escritos. |
| 404 | Avisar recurso inexistente y permitir volver al listado. |
| 409 | Conflicto de negocio; consultar error.code y conservar el formulario. |
| 429 | Mostrar espera; respetar Retry-After en segundos. |
| 500 | Mensaje de error recuperable; permitir reintento consciente y mostrar requestId. |

Los mensajes pueden mejorar sin cambiar el contrato: la lógica usa `error.code`, no el texto. Fechas futuras de consulta/nacimiento son inválidas. Formularios clínicos sin cálculos automáticos: unidades kg y cm visibles. Los límites numéricos del contrato son controles técnicos, no interpretación clínica.

## Listados y coordinación

Todos los listados usan `{ data: [], meta: { page, pageSize, total, totalPages } }`. Sin resultados: total y totalPages valen 0; page conserva lo solicitado. Página fuera del total: lista vacía. No hay respuesta 204 para listados ni envoltorio data para objetos individuales.

Los ejemplos tienen fechas estáticas: el mock puede mostrarlas, pero para probar contra API real se elige una fecha futura ofrecida por disponibilidad. Los tokens y passwords de ejemplos son ficticios, no credenciales de producción.

Los esquemas pueden generar tipos con openapi-typescript; fijar versión de la herramienta al configurarla. No duplicar interfaces manualmente si se automatiza generación. Swagger UI es documentación; un mock no constituye persistencia ni backend terminado.

Antes de cambiar un nombre, ruta, estado o campo obligatorio, actualizar OpenAPI, ejemplos, specs y avisar al otro desarrollador. Se propone congelar esta v1.0.0 para el MVP. No se agregan funcionalidades del presupuesto comercial sin un cambio explícito del alcance académico.
