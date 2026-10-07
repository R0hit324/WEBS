const GALLERY_ITEMS = [
  {
    category: 'Training',
    title: '10m Range Session',
    imageSrc: null,
    imageAlt: 'Shooter at 10m range',
    featured: true
  },
  {
    category: 'Competition',
    title: 'State Championship 2024',
    imageSrc: null,
    imageAlt: 'Competition event',
    featured: false
  },
  {
    category: 'Facilities',
    title: '25m Range View',
    imageSrc: null,
    imageAlt: '25m range interior',
    featured: false
  },
  {
    category: 'Team',
    title: 'Coach with Athletes',
    imageSrc: null,
    imageAlt: 'Coaching session',
    featured: false
  },
  {
    category: 'Training',
    title: '50m Outdoor Practice',
    imageSrc: null,
    imageAlt: 'Outdoor range training',
    featured: false
  },
  {
    category: 'Events',
    title: 'Annual Awards Ceremony',
    imageSrc: null,
    imageAlt: 'Awards ceremony',
    featured: false
  }
];

const GALLERY_PLACEHOLDER_ICON = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

export class GalleryPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || GALLERY_ITEMS,
      ctaLabel: options.ctaLabel || 'View Gallery',
      ctaHref: options.ctaHref || '#gallery',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const itemsHtml = this.options.items.map((item, index) => `
      <article class="gallery-item ${item.featured ? 'gallery-item--featured' : ''}" style="--item-index: ${index};">
        ${item.imageSrc
          ? `<img src="${item.imageSrc}" alt="${item.imageAlt}" class="gallery-item__image" loading="lazy">`
          : `
            <div class="gallery-item__placeholder" role="img" aria-label="${item.title} placeholder">
              <span class="gallery-item__placeholder-icon" aria-hidden="true">${GALLERY_PLACEHOLDER_ICON}</span>
              <span class="gallery-item__placeholder-text">Gallery Image</span>
            </div>
          `
        }
        <div class="gallery-item__overlay">
          <div class="gallery-item__info">
            <span class="gallery-item__category">${item.category}</span>
            <h3 class="gallery-item__title">${item.title}</h3>
          </div>
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="gallery-preview section" aria-labelledby="gallery-preview-title">
        <div class="container">
          <div class="gallery-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Gallery</p>
              <h2 id="gallery-preview-title" class="section-heading__title">Moments of <span class="section-heading__title-accent">Focus</span></h2>
              <p class="section-heading__subtitle">Training sessions, competitions, and the daily pursuit of excellence at our academy.</p>
            </div>
          </div>
          <div class="gallery-preview__grid" role="list">${itemsHtml}</div>
          <div class="gallery-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  updateItems(items) {
    this.options.items = items;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createGalleryPreview(container, options) {
  return new GalleryPreview(container, options);
}