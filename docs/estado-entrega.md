# Estado de entrega del TP

Revisión del 26 de octubre de 2026. Este documento distingue el flujo disponible de la evidencia y los pendientes del equipo.

**Actualización del 8 de noviembre de 2026:** el [repositorio GitHub](https://github.com/Maaupelozo/nutribalance-tp-web) ya contiene el código y la configuración Docker/Render. La auditoría móvil de Lighthouse y los tres documentos escritos están en [docs/entrega](entrega/README.md). La tabla siguiente conserva el estado de la revisión del 26 de octubre.

## Flujo disponible

La interfaz principal utiliza la API Express: disponibilidad, solicitud pública, login por correo/contraseña, pacientes, confirmación vinculada a una ficha, consulta e historial. El sitio mantiene su audiencia pública y Express protege cada operación privada.

La versión D1 anterior conserva sus rutas, migraciones y pruebas como respaldo. Sus datos son independientes de Express. Los prototipos de profesional y paciente utilizan datos locales de ejemplo.

## Evidencia y pendientes

| Área | Comprobado | Pendiente |
|---|---|---|
| Sesión | Login 200, usuario profesional, CSRF inválido 403, anónimo 401, logout 204 y sesión invalidada | Recorrido visual con la cuenta usada en la defensa |
| Pacientes | Alta, edición y recuperación posterior por HTTP contra Express | Inspección de migraciones/BD en el repositorio del backend |
| Turnos | Disponibilidad, solicitud 201, conflicto 409, confirmación con paciente, cancelación y liberación del slot | Prueba simultánea con dos navegadores |
| Consultas | Consulta independiente guardada y recuperada en historial contra Express | Consulta vinculada a un turno confirmado que ya comenzó |
| Interfaz | TypeScript, compilación y pruebas de cliente/gateway | Revisión visual, teclado y dispositivo móvil; no hubo navegador automatizable disponible |
| Respaldo D1 | Pruebas de dominio, SQL y Worker aislado conservadas | No atribuir esos resultados a PostgreSQL |
| Persistencia externa | Lecturas independientes recuperan paciente y consulta | Reiniciar Express y verificar persistencia; no hubo acceso directo al servidor |
| Git y entrega | Fuente, README, contrato y plan de integración | GitHub del equipo, integrantes y contribuciones reales |
| SEO y rendimiento | Metadatos, canonical, sitemap, robots y fuentes locales | Medición actual Lighthouse/PageSpeed |

La prueba real dejó una ficha y consulta ficticias identificadas como verificación. El turno utilizado quedó cancelado. No se trasladaron ni borraron datos D1.

## Preparar la demostración

1. Comprobá el acceso público desde otro dispositivo y el login profesional.
2. Solicitá un horario disponible con datos ficticios, buscá o creá una ficha y confirmá el turno vinculándola.
3. Para mostrar una consulta vinculada, usá un turno confirmado cuyo horario ya comenzó. Si todavía está en el futuro, mostrá una consulta independiente y explicá esa diferencia.
4. Recargá el historial y cerrá sesión; verificá que un visitante no puede leer pacientes.
5. Adjuntá prototipo, análisis, modelo real del backend, reporte de rendimiento y distribución de tareas.
6. Revisá el código y ensayá la [guía de defensa](defensa.md). No inventes participación, pruebas ni métricas.

## Recuperar la versión anterior

Sites conserva versiones D1 publicadas antes de la integración. Git mantiene el historial de la rama `tp/cierre-integracion` y las etiquetas de respaldo. Volver a una versión previa no importa ni transforma datos entre bases. No borres ninguna base para cambiar de versión.
