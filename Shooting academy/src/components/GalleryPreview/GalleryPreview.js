const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'academy', label: 'Academy' },
  { id: 'training', label: 'Training' },
  { id: 'competitions', label: 'Competitions' },
  { id: 'events', label: 'Events' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'achievements', label: 'Achievements' }
];

const PLACEHOLDER_ICON = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

const EMPTY_ICON = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

function sortGallery(items) {
  return [...items]
    .filter(i => i.visible !== false)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });
}

function filterGallery(items, filter) {
  if (filter === 'all') return items;
  return items.filter(i => i.category === filter);
}

export class GalleryPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || [],
      ctaLabel: options.ctaLabel || 'View Gallery',
      ctaHref: options.ctaHref || '#gallery',
      ...options
    };
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.items && this.options.items.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.items = (data || []).map(item => ({
        ...item,
        image: item.image_url,
        featured: Boolean(item.is_featured),
        visible: item.is_visible !== false,
        displayOrder: item.display_order ?? 0
      }));
    } catch (error) {
      console.error('Failed to load gallery images:', error);
      this.options.items = [];
    }
  }

  render() {
    const items = sortGallery(this.options.items);

    if (items.length === 0) {
      this.renderEmptyState();
      return;
    }

    const filtered = filterGallery(items, this.currentFilter);

    const gridHtml = filtered.map((item, index) => this.renderGalleryItem(item, index)).join('');

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

          <div class="gallery-preview__filters" role="group" aria-label="Filter gallery by category">
            ${CATEGORIES.map(cat => `
              <button class="gallery-preview__filter ${cat.id === this.currentFilter ? 'gallery-preview__filter--active' : ''}" data-filter="${cat.id}">${cat.label}</button>
            `).join('')}
          </div>

          <div class="gallery-preview__grid" role="list">${gridHtml}</div>

          <div class="gallery-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;

    this.bindFilterEvents();
  }

  renderGalleryItem(item, index) {
    const categoryLabel = CATEGORIES.find(c => c.id === item.category)?.label || item.category || 'Academy';

    return `
      <article class="gallery-item ${item.featured ? 'gallery-item--featured' : ''}" role="listitem" data-index="${index}" data-category="${item.category || 'academy'}" tabindex="0" aria-label="View ${item.title || 'gallery image'}">
        ${item.image
          ? `<img src="${item.image}" alt="${item.title || 'Gallery image'}" class="gallery-item__image" loading="lazy">`
          : `
            <div class="gallery-item__placeholder" role="img" aria-label="${item.title || 'Gallery image'} placeholder">
              <span class="gallery-item__placeholder-icon" aria-hidden="true">${PLACEHOLDER_ICON}</span>
              <span class="gallery-item__placeholder-text">Gallery Image</span>
            </div>
          `
        }
        <div class="gallery-item__overlay">
          <div class="gallery-item__info">
            <span class="gallery-item__category">${categoryLabel}</span>
            <h3 class="gallery-item__title">${item.title || 'Untitled'}</h3>
          </div>
        </div>
      </article>
    `;
  }

  renderEmptyState() {
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

          <div class="gallery-preview__grid">
            <div class="gallery-preview__empty" role="status">
              <span class="gallery-preview__empty-icon" aria-hidden="true">${EMPTY_ICON}</span>
              <h2 class="gallery-preview__empty-title">No Images Yet</h2>
              <p class="gallery-preview__empty-desc">Academy photos will appear here once uploaded through the CMS.</p>
            </div>
          </div>

          <div class="gallery-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  updateFilterUI() {
    const filterButtons = this.container.querySelectorAll('.gallery-preview__filter');
    filterButtons.forEach(btn => {
      btn.classList.toggle('gallery-preview__filter--active', btn.dataset.filter === this.currentFilter);
    });
  }

  bindFilterEvents() {
    const filterButtons = this.container.querySelectorAll('.gallery-preview__filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filter;
        this.updateFilterUI();
        this.render();
      });
    });
  }
}

export function createGalleryPreview(container, options) {
  return new GalleryPreview(container, options);
}
