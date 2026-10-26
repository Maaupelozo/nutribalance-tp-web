# Integración con la API Express

Guía para mantener el frontend NutriBalance conectado al backend del equipo. Contrato original: [OpenAPI v1.0.0](api-externa/openapi.json). API: `https://api.neadev.com/api/v1`.

## Estado verificado el 26 de octubre de 2026

La API está operativa. Acepta el origen `https://nutribalance-mauricio.maauri.chatgpt.site`, credenciales y el encabezado `X-CSRF-Token`. `/auth/csrf` devuelve 200 y una cookie HttpOnly/Secure/SameSite=None. El login de la cuenta profesional suministrada devuelve 200; una petición privada sin sesión devuelve 401. No se conservó la contraseña en archivos.

La interfaz principal utiliza Express para sesión, disponibilidad, solicitudes, pacientes, turnos y consultas. D1 se conserva como respaldo independiente; no se importaron ni borraron sus datos.

## Recorrido de una petición

```text
Navegador → /api/v1 del sitio → https://api.neadev.com/api/v1
```

El Worker actúa como gateway de destino fijo. Solo admite las rutas y métodos del contrato. Reenvía la cookie `nutri.sid` y el token CSRF, sin cookies ni encabezados de identidad de la plataforma. Las mutaciones requieren que `Origin` coincida con el origen del sitio.

La cookie recibida de Express se publica con `Path=/api/v1`, sin `Domain` y con `SameSite=Lax`; mantiene HttpOnly y Secure. Así el navegador conserva una sesión del mismo origen, sin depender de cookies de terceros. El gateway no genera sesiones propias ni almacena contraseñas o tokens. Las respuestas llevan `Cache-Control: no-store`; el timeout del backend es de 15 segundos.

## Adaptación del frontend

| Área | Comportamiento |
|---|---|
| Login | Email/contraseña, CSRF anónimo antes de enviar, token reemplazado después del login |
| Recarga | `/auth/me` recupera la sesión y su CSRF; un visitante se dirige al acceso |
| Solicitud | Consulta disponibilidad, muestra hora argentina y envía el `startsAt` exacto |
| Contacto | Nombre y teléfono obligatorios; correo opcional; sin inventar una ficha a partir del contacto |
| Ficha | Nombre y apellido separados, fecha de nacimiento, documento, contacto, antecedentes, alergias y medicación |
| Identificadores | UUID strings generados por Express |
| Listados | Búsqueda y paginación reales; la agenda admite períodos de hasta 31 días |
| Confirmación | Búsqueda o creación explícita de ficha, seguida del vínculo `patientId` |
| Estados | Pending, confirmed, attended, cancelled; cancelar para solicitar otro horario |
| Consulta | Motivo, indicaciones y fecha; observaciones, objetivo y medidas opcionales con unidades visibles |
| Consulta vinculada | Solo desde turno confirmado que ya comenzó; se envía el UUID del turno |
| Errores | Mensajes por campo, 401 con formulario conservado, 409 que refresca disponibilidad, espera de Retry-After |
| CSRF vencido | Renueva token y pide un reenvío explícito; no repite creaciones automáticamente |
| Logout | Procesa 204 sin leer JSON y limpia el estado de la interfaz |

Los pagos, adjuntos, diario, bloqueos y configuración editable no forman parte de esta API. Permanecen únicamente en los prototipos anteriores. No se muestran como operaciones persistentes en el panel conectado.

## Evidencia

La prueba del Worker compilado contra Express real comprobó login, permisos anónimos, rechazo de CSRF inválido, creación/edición/recarga de paciente, solicitud pública, conflicto 409 del mismo horario, vínculo y confirmación, creación de consulta independiente, recarga de historial, cancelación que libera el slot y logout con sesión invalidada.

Se conservó una ficha ficticia identificada como prueba de integración y su consulta. El turno de prueba quedó cancelado. Esto comprueba recuperación por HTTP; no incluye inspección directa de PostgreSQL ni prueba de persistencia tras reiniciar el backend.

No se ejecutó una consulta vinculada contra el backend real: el turno creado para la prueba estaba en el futuro y el contrato exige que haya comenzado. La UI impide registrar desde un turno futuro. Ese recorrido debe comprobarse con un turno confirmado cuyo horario ya haya comenzado.

No hubo un navegador automatizable disponible. La verificación HTTP y del Worker no reemplaza la revisión visual, de teclado y móvil del login y los formularios.

## Mantener y recuperar

No modifiques las copias del contrato para ocultar diferencias del servidor. Acordá cambios de rutas y campos con el equipo y actualizá el cliente y las pruebas.

El repositorio conserva las rutas D1 anteriores, las migraciones y las versiones de Sites. Para regresar al flujo anterior, publicá una versión D1 verificada. Los registros de ambos sistemas son independientes: cambiar de versión no importa pacientes ni turnos.
