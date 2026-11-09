# 1. Análisis funcional — NutriBalance

NutriBalance resuelve el escenario **NutriTurnos** del TP de Desarrollo Web 2026. Presenta los servicios de Mauricio Pelozo y reúne solicitudes de turno, agenda, fichas de pacientes e historial de consultas en un flujo único. La demostración utiliza sólo datos ficticios.

## Problema y usuarios

Cuando los pedidos de turno, la agenda y los registros de consulta se manejan por separado, cuesta saber si un horario está libre y recuperar el seguimiento de una persona. La aplicación busca reducir esa fragmentación y dejar explícito cuándo un pedido está pendiente o confirmado.

| Usuario | Necesidad principal |
|---|---|
| Visitante o paciente | Consultar horarios y enviar una solicitud sin crear una cuenta. |
| Profesional | Identificarse, confirmar o cancelar turnos, gestionar fichas y registrar consultas. |
| Equipo evaluador | Recorrer el flujo público y profesional y comprobar que los datos de prueba se recuperan. |

## Alcance

El recorrido principal es: **portada → disponibilidad → solicitud pendiente → acceso profesional → ficha del paciente → confirmación del turno → consulta → historial**. El frontend usa la API Express del equipo para las operaciones persistentes. Una solicitud guarda datos de contacto y reserva un horario pendiente; la ficha clínica se crea o vincula de forma explícita desde el panel.

El MVP evaluable comprende la web pública, el formulario de turnos, el acceso profesional, pacientes, agenda, consultas e historial. Pagos, recordatorios automáticos, adjuntos, teleconsulta y funciones de IA quedan fuera del alcance. Las pantallas `/demo-paciente` y `/demo-profesional` muestran prototipos con datos locales y no representan operaciones clínicas persistentes.

## Requerimientos

| ID | Requerimiento funcional | Criterio de aceptación |
|---|---|---|
| RF01 | Mostrar la presentación y el acceso a turnos. | La portada enlaza al formulario público. |
| RF02 | Consultar disponibilidad por fecha. | Se muestran horarios de Argentina sin exponer datos clínicos. |
| RF03 | Enviar una solicitud sin cuenta. | La API devuelve un comprobante y estado pendiente; un conflicto de horario se informa sin duplicar el envío. |
| RF04 | Restringir el panel al profesional. | Sin sesión válida, la API privada responde 401. Las escrituras requieren protección CSRF. |
| RF05 | Crear, buscar y editar pacientes. | La ficha recuperada conserva los cambios tras recargar. |
| RF06 | Confirmar y cancelar turnos. | La confirmación vincula una ficha; cancelar libera el horario. |
| RF07 | Registrar consultas. | Se guardan motivo, observaciones, objetivos, indicaciones y medidas opcionales. |
| RF08 | Consultar el historial. | Las consultas guardadas aparecen al volver a abrir la ficha. |

**Requerimientos no funcionales:** diseño adaptable a móvil, controles etiquetados y foco visible, mensajes claros ante errores, protección de datos privados, metadatos de las páginas públicas y código versionado. La interfaz no debe anunciar éxito si el servidor rechaza una operación.

La [especificación funcional extendida](../analisis-funcional.md) y el [contrato de la API](../api-externa/contrato-api-frontend.md) detallan reglas y campos adicionales.
