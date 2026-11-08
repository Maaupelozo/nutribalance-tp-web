/** Public origin for metadata and sitemap on either hosting target. */
export const SITE_ORIGIN = new URL(
  process.env.PUBLIC_SITE_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    'https://nutribalance-mauricio.maauri.chatgpt.site',
).origin;
