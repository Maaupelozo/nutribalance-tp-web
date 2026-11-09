# 7. Evidencias de SEO y calidad — NutriBalance

El **8 de noviembre de 2026** se auditó la [portada pública](https://nutribalance-mauricio.maauri.chatgpt.site/) con **Lighthouse 13.6.0**, Chrome local y perfil móvil. La ejecución produjo el [reporte HTML](../evidencias/lighthouse-inicio-mobile-2026-11-08.report.html) y el [resultado JSON](../evidencias/lighthouse-inicio-mobile-2026-11-08.report.json). Es una medición de laboratorio de una ejecución; las puntuaciones pueden variar según el equipo, la red y la carga del servidor.

| Categoría | Puntuación |
|---|---:|
| Rendimiento | 77/100 |
| Accesibilidad | 100/100 |
| Buenas prácticas | 81/100 |
| SEO | 100/100 |

| Métrica móvil | Resultado |
|---|---:|
| First Contentful Paint | 2,3 s |
| Largest Contentful Paint | 2,3 s |
| Speed Index | 7,6 s |
| Total Blocking Time | 440 ms |
| Cumulative Layout Shift | 0 |

La portada, `/robots.txt` y `/sitemap.xml` respondieron **HTTP 200**. El sitemap publicado incluye la portada y `/solicitar-turno`. El código define títulos, descripciones, URL canónica y `lang="es-AR"` para las páginas públicas; el acceso y el panel se excluyen de la indexación.

## Mejoras realizadas

- Se incorporaron metadatos por página, URL canónica, `robots.txt` y sitemap para orientar la indexación a las páginas públicas.
- Se usaron fuentes WOFF2 alojadas con la aplicación y precarga de las dos variantes principales.
- Se ajustaron las vistas móviles, el foco visible, las etiquetas y los mensajes del formulario, con soporte de `prefers-reduced-motion`.
- Se evitó publicar información clínica en HTML público; las rutas privadas exigen sesión profesional y las respuestas de la API usan `Cache-Control: no-store`.

## Hallazgos y próximos ajustes

Lighthouse estima **62 KiB de JavaScript** y **11 KiB de CSS** sin uso en la carga inicial. Conviene revisar la división de paquetes y retirar estilos heredados que no intervienen en la portada. El puntaje de buenas prácticas baja por tres avisos de APIs obsoletas en `cdn-cgi/challenge-platform/scripts/jsd/main.js`, un recurso servido por la plataforma; esa atribución surge de las URL indicadas en el reporte, no de una inspección de su código fuente.

La API pública de PageSpeed Insights respondió **HTTP 429** por cuota; por eso esta entrega usa el reporte local de Lighthouse. La auditoría cubre la portada en perfil móvil y no reemplaza una prueba manual completa del panel, teclado o dispositivo físico.
