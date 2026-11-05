// Shared HTML escaping for database-derived strings rendered into markup.
// Defense layer for display-side escaping of user-submitted content
// (the database stores raw text by design; every sink that interpolates
// DB values into HTML must escape them first).

export function escapeHtml(value: string): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate a URL for use inside a src/href attribute. Only http(s) URLs are
// allowed through (storage/CDN images, maps embeds); javascript:, data:,
// file: and any other scheme are rejected so an attacker-controlled record
// cannot obtain an executing attribute context. Returns an already-escaped
// string suitable for direct interpolation into markup.
export function safeUrl(value: string): string {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  // Allow only site-absolute paths ("/..."), absolute HTTPS URLs,
  // loopback http:// (local development), and inline data:image/*
  // URLs (inert in img/iframe contexts; svg scripts are blocked in
  // data: documents). Rejects javascript:, data:text/*, vbscript:,
  // file: and any other scheme.
  const isSiteRelative = raw.startsWith('/') && !raw.startsWith('//');
  const isHttps = /^https:\/\//i.test(raw);
  const isLocalHttp = /^http:\/\/(?:localhost|127\.0\.0\.1)/i.test(raw);
  const isDataImage = /^data:image\/(?:png|jpe?g|webp|gif|avif|svg\+xml)[;,]/i.test(raw);
  if (!isSiteRelative && !isHttps && !isLocalHttp && !isDataImage) return '';
  return escapeHtml(raw);
}

export const NS = { escapeHtml, safeUrl };
