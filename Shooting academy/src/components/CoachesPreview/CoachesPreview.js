const COACHES = [
  {
    name: 'Aman Choudhary',
    role: 'Head Coach',
    bio: 'NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines.',
    imageSrc: '/coaches/Aman.jpeg',
    imageAlt: 'Coach Aman Choudhary'
  },
  {
    name: 'Chaman Choudhary',
    role: 'Senior Coach',
    bio: 'Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes.',
    imageSrc: '/coaches/Chaman.jpeg',
    imageAlt: 'Coach Chaman Choudhary'
  }
];

const COACH_PLACEHOLDER_ICON = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class CoachesPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      coaches: options.coaches || COACHES,
      ctaLabel: options.ctaLabel || 'Meet Our Coaches',
      ctaHref: options.ctaHref || '#coaches',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const coachesHtml = this.options.coaches.map(coach => `
      <article class="coach-card">
        ${coach.imageSrc
          ? `<img src="${coach.imageSrc}" alt="${coach.imageAlt}" class="coach-card__image" loading="lazy">`
          : `
            <div class="coach-card__placeholder" role="img" aria-label="${coach.name} photo placeholder">
              <span class="coach-card__placeholder-icon" aria-hidden="true">${COACH_PLACEHOLDER_ICON}</span>
              <span class="coach-card__placeholder-text">Coach Photo</span>
            </div>
          `
        }
        <div class="coach-card__content">
          <h3 class="coach-card__name">${coach.name}</h3>
          <p class="coach-card__role">${coach.role}</p>
          <p class="coach-card__bio">${coach.bio}</p>
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="coaches-preview section" aria-labelledby="coaches-preview-title">
        <div class="container">
          <div class="coaches-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Our Coaches</p>
              <h2 id="coaches-preview-title" class="section-heading__title">Expert Guidance from <span class="section-heading__title-accent">Certified Coaches</span></h2>
              <p class="section-heading__subtitle">Led by NRAI-certified professionals dedicated to developing champions at every level.</p>
            </div>
          </div>
          <div class="coaches-preview__grid" role="list">${coachesHtml}</div>
          <div class="coaches-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.coaches-preview');
    const header = this.container.querySelector('.coaches-preview__header');
    const cards = this.container.querySelectorAll('.coach-card');
    const cta = this.container.querySelector('.coaches-preview__cta');

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

    // Cards staggered entrance with subtle scale
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

    // Subtle hover-like parallax on cards
    cards.forEach(card => {
      gsap.to(card, {
        y: -15,
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

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.coaches-preview')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createCoachesPreview(container, options) {
  return new CoachesPreview(container, options);
}