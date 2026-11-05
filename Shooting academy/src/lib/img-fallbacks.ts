// Capture-phase image fallback handlers.
//
// Replaces the per-<img> inline onerror/onload attributes shipped in the page
// markup. Inline attribute handlers execute in the document's JS context and a
// strict Content-Security-Policy (script-src without 'unsafe-inline') blocks
// them. These capture-phase listeners keep the same behavior while allowing
// `script-src 'self'` on every response.
//
// Semantics preserved from the inline handlers:
//  - <img> load error                → hide the image and reveal its next
//                                      element sibling (the CSS placeholder).
//  - .pc-roomphoto load error        → remove the decorative layer entirely.
//  - .medalist-card__image load      → store photographic orientation ratio
//                                      ('wide'|'landscape'|'square'|'portrait')
//                                      as data-orient on .medalist-card.
export function installImageFallbacks(): void {
  if (document.documentElement.dataset.imgFallbacksInstalled === '1') return;
  document.documentElement.dataset.imgFallbacksInstalled = '1';

  document.addEventListener(
    'error',
    (event) => {
      const img = event.target as HTMLImageElement | null;
      if (!img || img.tagName !== 'IMG') return;

      if (img.classList.contains('pc-roomphoto')) {
        img.remove();
        return;
      }

      img.style.display = 'none';
      const fallback = img.nextElementSibling as HTMLElement | null;
      if (fallback) fallback.style.display = 'flex';
    },
    true
  );

  document.addEventListener(
    'load',
    (event) => {
      const img = event.target as HTMLImageElement | null;
      if (!img || img.tagName !== 'IMG') return;
      if (!img.classList.contains('medalist-card__image')) return;

      const card = img.closest('.medalist-card') as HTMLElement | null;
      if (!card) return;

      const ratio = img.naturalWidth / Math.max(1, img.naturalHeight);
      card.dataset.orient =
        ratio > 1.9 ? 'wide' : ratio >= 1.08 ? 'landscape' : ratio > 0.92 ? 'square' : 'portrait';
    },
    true
  );
}
