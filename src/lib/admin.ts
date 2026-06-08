/**
 * Hardcoded admin password for the /admin/upload page.
 *
 * NOTE: This is intentionally simple for now. Because the upload page is a
 * client component, this value ships in the browser bundle — it gates the UI
 * and is re-checked on the server before any Blob token is issued, but it is
 * NOT a real secret. Swap this for a proper auth flow (e.g. an env var checked
 * only on the server, or NextAuth) before relying on it to protect anything.
 */
export const ADMIN_PASSWORD = "CMCphoto2024";
