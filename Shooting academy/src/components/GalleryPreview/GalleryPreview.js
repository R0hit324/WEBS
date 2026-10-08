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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    this.initAnimations();
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

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.gallery-preview');
    const header = this.container.querySelector('.gallery-preview__header');
    const items = this.container.querySelectorAll('.gallery-item');
    const cta = this.container.querySelector('.gallery-preview__cta');

    if (!section) return;

    // Header entrance
    gsap.fromTo(header, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 55%',
          scrub: false
        }
      }
    );

    // Items staggered entrance with scale
    gsap.fromTo(items, 
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false
        }
      }
    );

    // CTA entrance
    if (cta) {
      gsap.fromTo(cta, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 45%',
            scrub: false
          }
        }
      );
    }

    // Subtle parallax on items
    items.forEach((item, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      gsap.to(item, {
        y: -20 * direction,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }

  updateItems(items) {
    this.options.items = items;
    this.render();
    this.initAnimations();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.gallery-preview')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createGalleryPreview(container, options) {
  return new GalleryPreview(container, options);
}