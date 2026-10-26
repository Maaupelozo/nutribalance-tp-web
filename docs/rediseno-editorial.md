# Rediseño editorial de NutriBalance

Este documento permite al equipo explicar los cambios visuales del sitio y su relación con el flujo del TP. El propietario aprobó la dirección editorial, cálida y profesional para Mauricio Pelozo.

## Decisiones de interfaz

- La portada presenta al profesional desde la cabecera y la composición principal. La planta, el arco y la tarjeta flotante se reemplazan por una composición tipográfica propia, sin fotografía ni credenciales inventadas.
- Los títulos públicos usan Source Serif 4; el panel, los textos y los controles usan Manrope. Las fuentes se sirven localmente en WOFF2, con sus licencias.
- Los colores compartidos se declaran en `app/styles/tokens.css`. El verde bosque estructura regiones completas de la portada; el marfil y el blanco cálido ordenan lectura y formularios.
- Las secciones alternan presentación, conversación, filas de servicios y pasos de solicitud. Los números se reservan para la secuencia real del trámite.
- El aviso académico permanece en el footer, las preguntas frecuentes y el formulario; solo se admiten datos ficticios.
- El formulario conserva lo escrito ante errores, muestra mensajes de validación por campo y resume fecha/hora elegidas. El resumen habla de preferencia; no inventa disponibilidad.
- El comprobante muestra los datos persistidos por el servidor, incluso si un reintento cambia la hora del formulario.
- El resumen del panel prioriza próxima consulta, pendientes y pacientes. El panel persistente oculta navegación a módulos sin persistencia de servidor. Los prototipos visuales conservan sus módulos complementarios.
- Los vínculos de turno se pasan explícitamente al abrir una consulta. Una consulta general no arrastra el turno de otra acción anterior.
- El movimiento se limita a feedback de controles y una apertura discreta de la composición principal; se respeta `prefers-reduced-motion`.

## Organización del frontend

`app/globals.css` funciona como entrada de estilos. Los archivos tienen responsabilidades separadas:

| Archivo | Responsabilidad |
|---|---|
| `fonts.css` | Fuentes locales y variantes |
| `tokens.css` | Colores, tipografía, espaciado, radios y movimiento compartidos |
| `foundation.css` | Controles, foco, selección, botones y movimiento reducido |
| `public.css` | Portada, solicitud, comprobante y acceso |
| `workspace.css` | Panel y ficha del paciente |
| `workspace-legacy.css` | Estilos heredados de componentes y prototipos; conserva compatibilidad y aún contiene reglas superpuestas |

La separación reduce el acoplamiento entre las páginas públicas y el panel. No se afirma haber eliminado toda la deuda de CSS heredada.

## Evidencia y límites

TypeScript, build y pruebas de dominio/cliente HTTP se ejecutan sobre el rediseño. La prueba del Worker verifica las nuevas páginas públicas, los permisos y el flujo persistente con D1 aislada.

El cálculo de contraste sobre los colores declarados dio 10,83:1 para texto principal/marfil, 5,01:1 para secundario/marfil, 4,78:1 para arcilla/marfil y 11,67:1 para blanco/verde bosque. Son mediciones de pares de tokens, no una auditoría de todos los estados y superficies renderizados.

El inventario de navegadores de automatización está vacío. No se dispone de capturas nuevas de escritorio/móvil ni de una prueba interactiva de teclado o lector de pantalla. La revisión de CSS responsive y del código no reemplaza esa comprobación visual. PageSpeed había devuelto 429 por cuota en la revisión previa; no se atribuye una puntuación al rediseño.

El backend D1, la autorización profesional y el contrato Express pendiente se conservan. No se requieren migraciones para este cambio de interfaz.
