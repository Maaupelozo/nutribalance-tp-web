# Fuentes de NutriBalance

Las familias Manrope y Source Serif 4 se descargaron desde la API oficial de Google Fonts el 26 de octubre de 2026. Las licencias SIL Open Font License se conservan en esta carpeta.

- Manrope: pesos 400 y 600, normal. Fuente original: https://fonts.google.com/specimen/Manrope
- Source Serif 4: peso 400, normal e italic. Fuente original: https://fonts.google.com/specimen/Source+Serif+4
- Licencia Manrope: https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- Licencia Source Serif: https://github.com/adobe-fonts/source-serif/blob/release/LICENSE.md

Los archivos originales TTF se convirtieron a WOFF2 con fontTools y Brotli, conservando caracteres y metadatos. No se crearon variantes de dibujo ni se modificaron los nombres de las familias. Las cuatro fuentes WOFF2 ocupan 170.424 bytes. La aplicación las sirve desde `/fonts/` con `font-display: swap` y precarga las dos variantes regulares de texto y títulos.
