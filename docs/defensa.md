# Guía breve de defensa

## Demostración sugerida (5–7 minutos)

1. Mostrar la página pública y explicar el problema de la nutricionista.
2. Solicitar turno con datos ficticios. Señalar que queda pendiente y conserva un código.
3. Ingresar como profesional autorizado y actualizar la agenda.
4. Buscar o crear la ficha correcta y vincularla al confirmar el turno. Para reprogramar, cancelar y solicitar otro horario.
5. Registrar consulta con motivo, peso/talla, observaciones, objetivos e indicaciones.
6. Mostrar el historial y recargar: los datos se recuperan de BD, no de `localStorage`.
7. Explicar pacientes, turnos y consultas; mostrar el contrato y las rutas HTTP. Las migraciones D1 conservadas pertenecen al respaldo anterior.
8. Mostrar verificación de SEO, responsive y permisos; reconocer los pendientes de medición si siguen abiertos.

## Decisiones para explicar

- React y TypeScript permiten mantener el frontend y tipar el cliente del contrato Express.
- El servidor existe para autorizar, validar, guardar y recuperar el flujo principal. No se desarrolla un sistema comercial completo.
- SQL es apropiado por las relaciones paciente–turno–consulta.
- La solicitud no confirma automáticamente: la profesional controla su agenda.
- Las páginas públicas se renderizan en servidor y tienen títulos, descripciones, H1 y URLs propias.
- Express administra la sesión y autoriza cada recurso privado. Ocultar botones no alcanza.
- Los conflictos de horario se resuelven en el backend y devuelven 409; el formulario conserva los datos y refresca disponibilidad.
- Los complementos visuales no se presentan como funciones completas de servidor.

## Preguntas que todos deben poder responder

- ¿Qué componente contiene el formulario público y qué endpoint recibe los datos?
- ¿Cómo se evita una solicitud duplicada por doble envío?
- ¿Qué ocurre si falla la BD o dos usuarios guardan al mismo tiempo?
- ¿Dónde se controla que una cuenta tenga permiso profesional?
- ¿Cómo se relaciona un paciente con sus consultas?
- ¿Por qué el estado pendiente no equivale a confirmado?
- ¿Qué evidencia demuestra persistencia después de recargar?
- ¿Qué cambios de interfaz surgieron del feedback recibido?

## Completar por el equipo

- Integrantes y responsabilidades reales, con commits identificables.
- URL del repositorio GitHub entregado.
- Link/capturas de wireframes y prototipo.
- Pruebas reales con usuarios y observaciones, si se realizan.
- Dificultades que el equipo efectivamente encontró y resolvió.
- Reporte Lighthouse/PageSpeed y revisión en dispositivos propios.

No inventar participación, pruebas ni métricas. El uso de IA está permitido y debe declararse: explicar qué se generó, qué revisó el equipo y cómo verificó su funcionamiento.

La integración real comprobó una consulta independiente. Para demostrar que una consulta vinculada marca el turno como atendido, el turno confirmado debe haber comenzado y coincidir con la fecha de la consulta. No uses un turno futuro para esa parte de la demostración.
