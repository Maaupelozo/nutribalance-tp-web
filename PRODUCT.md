# NutriBalance

## Platform

Web. React + TypeScript, Vinext/Vite y Cloudflare Worker. La interfaz principal usa una API Express externa; el contrato del equipo especifica PostgreSQL. D1/SQLite conserva una implementación anterior. Sitio público con panel profesional autorizado por Express.

## Users

El visitante conoce el servicio y solicita una fecha y hora preferidas. La persona profesional revisa solicitudes, administra pacientes y registra consultas. El equipo evaluador del TP necesita comprobar el flujo y su persistencia.

## Product Purpose

Centralizar solicitudes, agenda, pacientes e historial para el escenario NutriTurnos del TP de Desarrollo Web 2026. La identidad profesional elegida por el propietario es Mauricio Pelozo.

## Capabilities and Constraints

- Solicitud pública pendiente con comprobante e idempotencia; no es una reserva de disponibilidad garantizada.
- Pacientes, turnos y consultas del flujo principal se gestionan mediante Express. Las funciones D1 permanecen como respaldo independiente.
- Panel con sesión profesional y protección CSRF administradas por Express.
- Solo datos ficticios. Sin testimonios, matrícula, especialidades ni credenciales inventadas.
- La API Express está conectada; su servidor y esquema físico no forman parte de este repositorio.
- Portal paciente, documentos, diario y pagos son complementos visuales.
- No hay fotografía autorizada del profesional. La portada utiliza composición tipográfica.

## Confirmed design brief

El propietario aprobó aplicar la propuesta editorial, cálida y profesional: identidad de Mauricio visible, tipografía con carácter, verde profundo/marfil, composiciones variadas, formulario claro y panel centrado en atender. Conservar el flujo persistente y la audiencia pública ya autorizada.
