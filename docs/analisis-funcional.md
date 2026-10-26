# Análisis funcional · NutriBalance

## Escenario y problema

Escenario 2, NutriTurnos, del Trabajo Práctico Integrador de Desarrollo Web 2026. La profesional tiene pacientes, turnos e información de consulta distribuida entre agenda, mensajes y registros manuales. Necesita consultar el historial sin perder el contexto de cada encuentro.

## Usuarios y necesidades

- Visitante/paciente: conocer el servicio y enviar una solicitud sencilla, distinguiendo solicitud de confirmación.
- Nutricionista: revisar solicitudes, vincular fichas al confirmar, cancelar, registrar/editar pacientes y agregar consultas a su historial.
- Equipo evaluador: recorrer el flujo publicado, comprobar la BD y entender las decisiones de diseño.

## Alcance prioritario

Página pública → disponibilidad → solicitud pendiente → autenticación → buscar/crear ficha → vincular y confirmar turno → nueva consulta → historial persistente.

Express ofrece horarios libres de 30 minutos. La solicitud ocupa el horario, pero requiere confirmación profesional. El contacto de una solicitud no se convierte automáticamente en una ficha clínica.

## Requerimientos funcionales

| ID | Requerimiento | Implementación |
|---|---|---|
| RF01 | Mostrar servicio y CTA | `/` |
| RF02 | Solicitar turno sin cuenta | Disponibilidad y POST `/api/v1/appointment-requests` |
| RF03 | Registrar solicitud pendiente | Contacto y startsAt exacto; ficha creada por separado |
| RF04 | Restringir panel | Sesión profesional y CSRF administrados por Express |
| RF05 | Alta y edición de pacientes | Listado, formulario y ficha |
| RF06 | Gestionar turnos | Pendiente, confirmado, atendido, cancelado; reprogramar mediante cancelación y nueva solicitud |
| RF07 | Registrar consulta | Fecha, motivo, observaciones, peso/talla y métricas, objetivos, indicaciones |
| RF08 | Mostrar historial cronológico | Consultas ordenadas por fecha y registro |
| RF09 | Persistir entre recargas y dispositivos autorizados | API Express; listados y detalle de recursos |
| RF10 | Evitar conflictos | Validaciones, errores por campo y conflicto SLOT_UNAVAILABLE del backend |
| RF11 | Consultar disponibilidad | Slots públicos sin información clínica |

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

1. Enviar formulario válido produce un comprobante UUID y un turno pendiente, sin ficha clínica automática.
2. Volver a solicitar un slot ocupado devuelve 409; el cliente no repite creaciones automáticamente.
3. Un visitante anónimo no puede leer ni cambiar datos privados de Express.
4. Confirmar un horario ocupado genera conflicto y no sobrescribe el turno anterior.
5. Guardar consulta incorpora motivo, medidas, observaciones e indicaciones al historial.
6. Recargar conserva el registro. Si la consulta se vincula a un turno confirmado que ya comenzó, Express debe marcarlo como atendido en la misma transacción.

## Fuera del MVP evaluable

Pagos, recetarios, diarios, archivos reales, firma/sello digital, tokens de obra social, recordatorios automáticos, teleconsulta, IA y cálculos avanzados. Las vistas heredadas son prototipos complementarios; no acreditan persistencia clínica.
