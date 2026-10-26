declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    PROFESSIONAL_EMAILS?: string;
    BUCKET?: R2Bucket;
  }
}
