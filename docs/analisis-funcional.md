# Análisis funcional · NutriBalance

## Escenario y problema

Escenario 2, NutriTurnos, del Trabajo Práctico Integrador de Desarrollo Web 2026. La profesional tiene pacientes, turnos e información de consulta distribuida entre agenda, mensajes y registros manuales. Necesita consultar el historial sin perder el contexto de cada encuentro.

## Usuarios y necesidades

- Visitante/paciente: conocer el servicio y enviar una solicitud sencilla, distinguiendo solicitud de confirmación.
- Nutricionista: revisar solicitudes, confirmar o reprogramar, registrar/editar pacientes y agregar consultas a su historial.
- Equipo evaluador: recorrer el flujo publicado, comprobar la BD y entender las decisiones de diseño.

## Alcance prioritario

Página pública → solicitud con fecha/hora preferidas → registro pendiente en BD → autenticación → agenda profesional → confirmación/gestión → ficha → nueva consulta → historial persistente.

No se ofrece reserva libre de huecos. El horario solicitado es una preferencia. Esto concilia el TP con la necesidad de la profesional de organizar la agenda manualmente.

## Requerimientos funcionales

| ID | Requerimiento | Implementación |
|---|---|---|
| RF01 | Mostrar servicio y CTA | `/` |
| RF02 | Solicitar turno sin cuenta | Formulario en `/solicitar-turno`, POST `/api/solicitudes` |
| RF03 | Registrar paciente y solicitud pendiente | Transacción SQL; contactos y fecha/hora |
| RF04 | Restringir panel | Identidad de plataforma y permiso profesional en servidor |
| RF05 | Alta y edición de pacientes | Listado, formulario y ficha |
| RF06 | Gestionar turnos | Pendiente, confirmado, atendido, cancelado; reprogramación |
| RF07 | Registrar consulta | Fecha, motivo, observaciones, peso/talla y métricas, objetivos, indicaciones |
| RF08 | Mostrar historial cronológico | Consultas ordenadas por fecha y registro |
| RF09 | Persistir entre recargas y dispositivos autorizados | Base D1 relacional, GET/POST del panel |
| RF10 | Evitar conflictos | Validaciones de formulario/servidor, triggers SQL y revisión de cambios |
| RF11 | Bloquear horarios | Tabla de bloqueos y controles de agenda |

## Requerimientos no funcionales

- UI clara, sistema verde/crema consistente y lenguaje de Argentina.
- Responsive: landing y formulario con una columna en móvil; agenda desplazable; panel con menú adaptable.
- Accesibilidad: labels, foco visible, enlace de salto, navegación semántica, mensajes de estado/error y soporte de movimiento reducido.
- Datos de prueba exclusivamente ficticios.
- No exponer historia ni lista de pacientes desde endpoints públicos.
- No mostrar éxito cuando falla el guardado en servidor.
- URLs separadas y metadata para las páginas públicas; panel no indexable.
- Código y migraciones versionados, proceso de ejecución documentado.

## Decisiones UX y cambios derivados del feedback

- Texto principal y controles mayores; jerarquía de próxima consulta frente a tarjetas del mismo peso.
- Ficha centrada en evolución y objetivos antes del historial detallado.
- Panel amplio para consulta con grupos de mediciones, evolución y objetivos/indicaciones.
- Confirmación del envío con código y estado **pendiente**, sin prometer correo/WhatsApp.
- Historial conserva registros finalizados.
- Acceso profesional separado de las demostraciones visuales.

## Criterios de aceptación del flujo

1. Enviar formulario válido produce un código y una fila de paciente/turno en BD.
2. Repetir el mismo identificador no duplica la solicitud.
3. Un visitante anónimo o una identidad sin permiso no puede leer ni cambiar el panel.
4. Confirmar un horario ocupado genera conflicto y no sobrescribe el turno anterior.
5. Guardar consulta incorpora motivo, medidas, observaciones e indicaciones al historial.
6. Recargar conserva el registro y el estado atendido del turno asociado.

## Fuera del MVP evaluable

Pagos, recetarios, diarios, archivos reales, firma/sello digital, tokens de obra social, recordatorios automáticos, teleconsulta, IA y cálculos avanzados. Las vistas heredadas son prototipos complementarios; no acreditan persistencia clínica.
