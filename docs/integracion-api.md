# Integrar NutriBalance con la API Express

Este plan está dirigido al equipo que integra el frontend del TP con el backend del compañero. Compara el código D1 con el contrato v1.0.0 y define qué comprobar antes de sustituir la capa de datos.

## Estado verificado el 26 de octubre de 2026

El código recuperado de Sites parte del commit `8d56c797ab281f2858ba8982a36f0cce6e18a111`, en una rama local `tp/cierre-integracion`. La etiqueta local `respaldo-v4-2026-10-26` conserva ese punto. El proyecto tiene React, TypeScript, Vinext, un Worker y D1. No contiene un servidor Express, migraciones PostgreSQL ni credenciales del backend externo.

Las peticiones HTTPS a `/api/v1/auth/csrf` y `/api/v1/availability?date=2026-10-27` de `https://api.neadev.com` responden **HTTP 530, Cloudflare 1033**. Esto impide comprobar la API; no demuestra que no exista código en otro entorno. No se probó un login ni una escritura contra Express.

La inspección de D1 desplegada confirma las tablas `patients`, `appointments`, `consultations`, `schedule_blocks` y `app_state`. Las tres tablas del flujo principal están vacías al revisarlas. Tener las tablas no acredita un recorrido de producción ya realizado.

El sitio conserva audiencia privada del propietario. La URL es `https://nutribalance-mauricio.maauri.chatgpt.site`; todavía no acredita acceso público para el evaluador.

## Fuentes del contrato

Las copias de los archivos recibidos se conservan sin cambios en [api-externa](api-externa/README-frontend.md). Cada fuente tiene una función:

| Archivo | Uso |
|---|---|
| [openapi.json](api-externa/openapi.json) | Contrato principal: rutas, esquemas, campos, seguridad y errores |
| [contrato-api-frontend.md](api-externa/contrato-api-frontend.md) | Reglas de negocio y recorrido de pantallas |
| [README-frontend.md](api-externa/README-frontend.md) | Coordinación, fechas, cookies, CSRF y origen |
| [ejemplos.json](api-externa/ejemplos.json) | Datos ficticios; no son credenciales ni prueba de persistencia |

## Comparación con el código

La integración cambia estas decisiones de la aplicación:

| Área | Implementación D1 | API Express propuesta | Adaptación necesaria |
|---|---|---|---|
| Rutas | `/api/solicitudes`, `/api/panel`; comandos por entidad | `/api/v1` con recursos separados | Reemplazar `lib/api-client.ts` y adaptar carga/guardado del panel |
| Identificadores | `number` en pacientes, turnos, consultas y claves de UI | UUID `string` | Cambiar tipos, selecciones, relaciones y generación de IDs; los genera el servidor |
| Pacientes | `name`, `age`, `dni`, `goal`, `os`, `allergies`, `notes` | `firstName`, `lastName`, `birthDate`, `documentNumber`, `background`, `allergies`, `medication` | Adaptar formularios; no dividir nombres ni convertir edad a fecha automáticamente |
| Solicitud | Crea paciente provisional y turno; fecha/hora preferidas | Crea `pending` sin paciente; `startsAt` exacto de un slot | Rediseñar selección y confirmación; buscar/crear ficha y vincular `patientId` |
| Horarios | 45 minutos por solicitud; preferencias 08–18; pendientes pueden coincidir | 30 minutos, lunes–viernes 09–17, horizonte de 60 días; pendiente ocupa slot | Obtener disponibilidad; mostrar hora argentina; refrescar ante 409 |
| Estados | Estado de UI y `confirmed`; incluye ausencia, reprogramación y bloqueos | `pending`, `confirmed`, `attended`, `cancelled`; terminales sin cambios | Restringir acciones; reprogramar implica cancelar y solicitar otro turno |
| Autenticación | Identidad ChatGPT y lista profesional en servidor | Email/contraseña, cookie `nutri.sid`, CSRF en memoria | Construir login y recuperación de sesión; mantener autorización en cada endpoint |
| Consultas | `reason`, `notes`, `goal`, `indications`, medidas adicionales; IDs numéricos | `reason`, `observations`, `objective`, `instructions`, peso/talla/cintura | Adaptar campos y unidades; no descartar silenciosamente datos que Express no almacena |
| Listados | Snapshot completo + revisión compartida | `{data,meta}` paginado por recurso | Resolver búsqueda y paginación por pantalla; no asumir que la primera página contiene todo |
| Errores | `{error:string}`; validación 422 y conflictos 409 | `{error:{code,message,details},requestId}`; validación 400 | Interpretar códigos y errores por campo, conservar formularios |
| Persistencia | D1/SQLite, esquema y migración presentes | PostgreSQL propuesto | Solicitar migraciones reales; acordar importación de datos por separado |
| Despliegue | Worker en `chatgpt.site` | Frontend y API con origen común/proxy | Verificar proxy, cookies, HTTPS y sesión desde navegador |

El contrato no contempla bloqueos, pagos, documentos, diarios, recordatorios, portal de paciente ni edición de consultas. Conservá esas funciones fuera de la integración académica hasta acordar soporte real.

## Qué debe entregar el compañero

Antes de comenzar la integración, obtené estos elementos:

- Repositorio y commit del servidor Express implementado, con instrucciones reproducibles.
- Migraciones PostgreSQL, configuración por nombres de variables y datos ficticios de prueba, sin secretos en Git.
- URL operativa y lista de endpoints implementados, con diferencias respecto de OpenAPI.
- Cuenta profesional ficticia por un canal seguro. Los ejemplos no sirven como credenciales.
- Evidencia de persistencia tras reiniciar el servidor y de transacciones ante conflictos simultáneos.
- Configuración de origen/proxy, cookies y CORS que se utilizará en producción.

## Secuencia de integración

Con el backend disponible, seguí esta secuencia en una rama separada:

1. Verificá los endpoints del contrato con la BD real. Registrá commit, URL y diferencias; no tomes Swagger o un mock como servidor implementado.
2. Acordá el hosting. El frontend y la API deben servir al navegador desde un origen común mediante proxy, tal como define el contrato. Conservá D1 y su despliegue hasta validar el reemplazo.
3. Generá tipos desde OpenAPI con una versión fijada de la herramienta elegida. Modelá UUID, null, errores y paginación; eliminá supuestos de IDs numéricos.
4. Implementá `/auth/csrf`, `/auth/login`, `/auth/me` y `/auth/logout`. Usá `credentials: 'include'`. Conservá CSRF en memoria, reemplazalo tras login y enviá `X-CSRF-Token` en todas las mutaciones, incluida la solicitud pública.
5. Ante 401, ofrecé volver a ingresar conservando el formulario en memoria cuando sea posible. Ante `CSRF_INVALID`, renová el token y pedí un reenvío explícito; no repitas automáticamente reservas ni consultas.
6. Adaptá la solicitud a `GET /availability?date=YYYY-MM-DD`. Mostrá los slots en `America/Argentina/Buenos_Aires` y enviá el `startsAt` exacto. Ante `SLOT_UNAVAILABLE`, conservá el contacto, refrescá slots y solicitá otra elección.
7. Adaptá pacientes, agenda y confirmación. Una solicitud sin ficha requiere buscar o crear paciente y confirmar con su UUID. Mostrá carga, vacío y error en cada recurso.
8. Adaptá la consulta. Con turno vinculado, verificá que esté confirmado, haya comenzado, pertenezca al paciente y coincida con la fecha local. La API debe insertar consulta y marcar `attended` en una transacción.
9. Probá el recorrido completo desde el navegador desplegado y recargá el historial. Verificá las tres entidades en PostgreSQL y conservá evidencia sin datos reales.
10. Publicá el commit probado y documentá cómo regresar a D1. Acordá cualquier traslado de datos de forma explícita; las bases y modelos no son intercambiables.

### Cookies, CORS y HTTPS

Cambiar `VITE_API_URL` no resuelve la sesión entre `chatgpt.site` y `neadev.com`. Una cookie `SameSite=Lax` no acompaña normalmente un `fetch` entre esos sitios. CORS con credenciales tampoco cambia esa política. El contrato pide origen común: el navegador solicita `/api/v1` y el proxy conecta con Express, preservando cookies, CSRF y controles de origen.

La integración de Sites conserva su autenticación de plataforma. Si se decide sustituirla o alojar el frontend en otro servicio para usar Express, documentá el cambio de hosting y autorización antes de aplicarlo. No agregues un proxy genérico ni reenvíes cookies/credenciales a destinos elegidos por el visitante.

En desarrollo, usá `localhost` para ambos procesos (puertos 5173 y 3000 según el contrato). En producción, verificá HTTPS, cookie HttpOnly/Secure, `Cache-Control: no-store`, cierre de sesión y expiración real desde el navegador. No guardes contraseña ni identificador de sesión en `localStorage`.

## Criterios de aceptación

La integración está terminada cuando se comprueban estos resultados:

- Visitante: ve solo slots futuros, solicita uno, recibe comprobante y no accede a datos clínicos.
- Profesional: inicia sesión, busca/crea ficha, confirma vinculando al paciente y cierra sesión.
- Consulta: guarda una consulta vinculada, cambia el turno a atendido y aparece después de recargar.
- Fallos: 400/401/403/404/409/429 y expiración tienen recuperación clara; un conflicto no pierde lo escrito ni duplica una creación.
- Seguridad: usuario anónimo y cuenta sin permiso no pueden leer ni escribir recursos privados.
- Datos: pacientes, turnos y consultas persisten en PostgreSQL; una carrera por el mismo slot produce un solo turno.
- Entrega: repositorio y deploy corresponden al commit probado, y la URL es accesible para el evaluador.

## Resultado de esta preparación

El flujo activo sigue utilizando D1. Se conserva el contrato y un plan de adaptación, pero **el cliente Express no está implementado ni conectado**. No hay pruebas de extremo a extremo contra el backend externo. El bloqueo se resuelve con una API operativa y el código del compañero.
