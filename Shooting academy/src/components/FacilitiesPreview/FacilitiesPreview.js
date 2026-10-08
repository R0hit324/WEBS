const FACILITIES = [
  {
    name: '10m Indoor Range',
    description: 'Climate-controlled 10m range with electronic target systems (SIUS/MEGALINK). 20 firing points for air pistol and air rifle.',
    imageSrc: null,
    imageAlt: '10m indoor shooting range'
  },
  {
    name: '25m Range',
    description: 'Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.',
    imageSrc: null,
    imageAlt: '25m shooting range'
  },
  {
    name: '50m Outdoor Range',
    description: 'Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol.',
    imageSrc: null,
    imageAlt: '50m outdoor shooting range'
  }
];

const FACILITY_ICONS = {
  '10m Indoor Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`,
  '25m Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  '50m Outdoor Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
};

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class FacilitiesPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      facilities: options.facilities || FACILITIES,
      ctaLabel: options.ctaLabel || 'View Facilities',
      ctaHref: options.ctaHref || '#facilities',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const facilitiesHtml = this.options.facilities.map(facility => `
      <article class="facility-card">
        ${facility.imageSrc
          ? `<img src="${facility.imageSrc}" alt="${facility.imageAlt}" class="facility-card__image" loading="lazy">`
          : `
            <div class="facility-card__placeholder" role="img" aria-label="${facility.name} placeholder">
              <span class="facility-card__placeholder-icon" aria-hidden="true">${FACILITY_ICONS[facility.name] || ''}</span>
              <span class="facility-card__placeholder-text">Facility Image</span>
            </div>
          `
        }
        <div class="facility-card__content">
          <h3 class="facility-card__name">${facility.name}</h3>
          <p class="facility-card__desc">${facility.description}</p>
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="facilities-preview section" aria-labelledby="facilities-preview-title">
        <div class="container">
          <div class="facilities-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Facilities</p>
              <h2 id="facilities-preview-title" class="section-heading__title">World-Class <span class="section-heading__title-accent">Infrastructure</span></h2>
              <p class="section-heading__subtitle">Three dedicated ranges meeting international standards, designed for training excellence.</p>
            </div>
          </div>
          <div class="facilities-preview__grid" role="list">${facilitiesHtml}</div>
          <div class="facilities-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.facilities-preview');
    const header = this.container.querySelector('.facilities-preview__header');
    const cards = this.container.querySelectorAll('.facility-card');
    const cta = this.container.querySelector('.facilities-preview__cta');

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

    // Cards staggered entrance
    gsap.fromTo(cards, 
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.2,
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

    // Subtle parallax on cards
    cards.forEach((card, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      gsap.to(card, {
        y: -15 * direction,
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

  updateFacilities(facilities) {
    this.options.facilities = facilities;
    this.render();
    this.initAnimations();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.facilities-preview')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createFacilitiesPreview(container, options) {
  return new FacilitiesPreview(container, options);
}