const DEFAULT_GALLERY = [];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'academy', label: 'Academy' },
  { id: 'training', label: 'Training' },
  { id: 'competitions', label: 'Competitions' },
  { id: 'events', label: 'Events' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'achievements', label: 'Achievements' }
];

const PLACEHOLDER_ICON = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

const EMPTY_ICON = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

const CLOSE_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const PREV_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

const NEXT_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

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

export class GalleryPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || DEFAULT_GALLERY,
      ...options
    };
    this.currentFilter = 'all';
    this.lightboxOpen = false;
    this.currentIndex = 0;
    this.filteredItems = [];
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const items = sortGallery(this.options.items);

    if (items.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.filteredItems = filterGallery(items, this.currentFilter);

    const gridHtml = this.filteredItems.map((item, index) => this.renderGalleryItem(item, index)).join('');

    this.container.innerHTML = `
      <section class="gallery-page" aria-labelledby="gallery-page-title">
        <div class="container">
          <header class="gallery-page__hero">
            <div class="gallery-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="gallery-page-title" class="gallery-page__title">Photo <span class="gallery-page__title-accent">Gallery</span></h1>
            <p class="gallery-page__description">Training sessions, competitions, events, and daily life at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="gallery-page__filters" role="group" aria-label="Filter gallery by category">
            ${CATEGORIES.map(cat => `
              <button class="gallery-page__filter ${cat.id === this.currentFilter ? 'gallery-page__filter--active' : ''}" data-filter="${cat.id}">${cat.label}</button>
            `).join('')}
          </div>

          <div class="gallery-page__grid" role="list">${gridHtml}</div>

          <div class="gallery-page__cta-section">
            <div class="gallery-page__cta-actions" role="group" aria-label="Gallery page actions">
              <a href="/contact" class="btn btn--primary btn--large">Contact Us</a>
            </div>
          </div>

          <!-- Lightbox -->
          <div class="lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
            <div class="lightbox__backdrop"></div>
            <div class="lightbox__container">
              <button class="lightbox__close" aria-label="Close lightbox">
                <span class="lightbox__close-icon" aria-hidden="true">${CLOSE_ICON}</span>
              </button>
              <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
                <span class="lightbox__nav-icon" aria-hidden="true">${PREV_ICON}</span>
              </button>
              <div class="lightbox__image-wrapper">
                <img class="lightbox__image" src="" alt="" loading="lazy">
              </div>
              <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
                <span class="lightbox__nav-icon" aria-hidden="true">${NEXT_ICON}</span>
              </button>
              <div class="lightbox__caption">
                <div class="lightbox__caption-title"></div>
                <div class="lightbox__caption-desc"></div>
                <div class="lightbox__counter"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.bindLightboxEvents();
  }

  renderGalleryItem(item, index) {
    const featured = item.featured ? 'gallery-item--featured' : '';
    const categoryLabel = CATEGORIES.find(c => c.id === item.category)?.label || item.category || 'Academy';

    return `
      <article class="gallery-item ${featured}" role="listitem" data-index="${index}" data-category="${item.category || 'academy'}" tabindex="0" aria-label="View ${item.title || 'gallery image'}">
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
      <section class="gallery-page" aria-labelledby="gallery-page-title">
        <div class="container">
          <header class="gallery-page__hero">
            <div class="gallery-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="gallery-page-title" class="gallery-page__title">Photo <span class="gallery-page__title-accent">Gallery</span></h1>
            <p class="gallery-page__description">Training sessions, competitions, events, and daily life at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="gallery-page__grid">
            <div class="gallery-page__empty" role="status">
              <span class="gallery-page__empty-icon" aria-hidden="true">${EMPTY_ICON}</span>
              <h2 class="gallery-page__empty-title">No Images Yet</h2>
              <p class="gallery-page__empty-desc">Academy photos will appear here once uploaded through the CMS.</p>
            </div>
          </div>

          <div class="gallery-page__cta-section">
            <div class="gallery-page__cta-actions" role="group" aria-label="Gallery page actions">
              <a href="/contact" class="btn btn--primary btn--large">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    const filterButtons = this.container.querySelectorAll('.gallery-page__filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filter;
        this.updateFilterUI();
        this.render();
      });
    });

    const gridItems = this.container.querySelectorAll('.gallery-item');
    gridItems.forEach((item, index) => {
      item.addEventListener('click', () => this.openLightbox(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(index);
        }
      });
    });
  }

  bindLightboxEvents() {
    const lightbox = this.container.querySelector('#gallery-lightbox');
    if (!lightbox) return;

    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');
    const backdrop = lightbox.querySelector('.lightbox__backdrop');

    this.closeLightbox = this.closeLightbox.bind(this);
    this.openLightboxAtIndex = this.openLightboxAtIndex.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    closeBtn.addEventListener('click', this.closeLightbox);
    prevBtn.addEventListener('click', () => this.openLightboxAtIndex(this.currentIndex - 1));
    nextBtn.addEventListener('click', () => this.openLightboxAtIndex(this.currentIndex + 1));
    backdrop.addEventListener('click', this.closeLightbox);

    document.addEventListener('keydown', this.handleKeydown);
  }

  unbindLightboxEvents() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  updateFilterUI() {
    const filterButtons = this.container.querySelectorAll('.gallery-page__filter');
    filterButtons.forEach(btn => {
      btn.classList.toggle('gallery-page__filter--active', btn.dataset.filter === this.currentFilter);
    });
  }

  openLightbox(index) {
    if (this.filteredItems.length === 0) return;
    this.currentIndex = index;
    this.showLightboxItem();
    this.openLightboxUI();
  }

  openLightboxAtIndex(index) {
    if (index < 0 || index >= this.filteredItems.length) return;
    this.currentIndex = index;
    this.showLightboxItem();
  }

  showLightboxItem() {
    const item = this.filteredItems[this.currentIndex];
    if (!item) return;

    const lightbox = this.container.querySelector('#gallery-lightbox');
    const image = lightbox.querySelector('.lightbox__image');
    const title = lightbox.querySelector('.lightbox__caption-title');
    const desc = lightbox.querySelector('.lightbox__caption-desc');
    const counter = lightbox.querySelector('.lightbox__counter');
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');

    if (item.image) {
      image.src = item.image;
      image.alt = item.title || 'Gallery image';
    } else {
      image.src = '';
      image.alt = item.title || 'Gallery image';
    }

    title.textContent = item.title || 'Untitled';
    desc.textContent = item.description || '';
    counter.textContent = `${this.currentIndex + 1} / ${this.filteredItems.length}`;

    prevBtn.disabled = this.currentIndex === 0;
    nextBtn.disabled = this.currentIndex === this.filteredItems.length - 1;
  }

  openLightboxUI() {
    const lightbox = this.container.querySelector('#gallery-lightbox');
    if (!lightbox) return;

    this.lightboxOpen = true;
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';

    const closeBtn = lightbox.querySelector('.lightbox__close');
    closeBtn.focus();
  }

  closeLightbox() {
    const lightbox = this.container.querySelector('#gallery-lightbox');
    if (!lightbox) return;

    this.lightboxOpen = false;
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
    this.unbindLightboxEvents();
  }

  handleKeydown(e) {
    if (!this.lightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        if (this.currentIndex > 0) {
          this.openLightboxAtIndex(this.currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (this.currentIndex < this.filteredItems.length - 1) {
          this.openLightboxAtIndex(this.currentIndex + 1);
        }
        break;
    }
  }

  updateItems(items) {
    this.options.items = items;
    this.render();
  }

  destroy() {
    this.unbindLightboxEvents();
    this.container.innerHTML = '';
  }
}

export function createGalleryPage(container, options) {
  return new GalleryPage(container, options);
}