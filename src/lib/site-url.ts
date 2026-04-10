/**
 * Canonical site origin for metadata, OG tags, PWA manifest, and sitemap.
 *
 * On Vercel: set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. https://yourdomain.com).
 * If unset, `VERCEL_URL` is used so preview and production deployments resolve correctly.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}
