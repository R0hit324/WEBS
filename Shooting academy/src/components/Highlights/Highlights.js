const HIGHLIGHTS_DATA = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    text: "Alwar's first RRA-certified academy",
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "10m",
    badge: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "25m",
    badge: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "50m",
    badge: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    muted: false
  }
];

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class Highlights {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || HIGHLIGHTS_DATA,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const itemsHtml = this.options.items.map(item => `
      <li class="highlights__item">
        <span class="highlights__icon" aria-hidden="true">${item.icon}</span>
        <span class="highlights__text ${item.muted ? 'highlights__text--muted' : ''}">${item.text}${item.badge ? ` <span class="highlights__badge" aria-hidden="true">${item.badge}</span>` : ''}</span>
      </li>
    `).join('');

    this.container.innerHTML = `
      <section class="highlights" aria-label="Academy highlights">
        <div class="container">
          <ul class="highlights__list" role="list">${itemsHtml}</ul>
        </div>
      </section>
    `;
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const items = this.container.querySelectorAll('.highlights__item');
    
    gsap.fromTo(items, 
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: this.container.querySelector('.highlights'),
          start: 'top 85%',
          end: 'top 60%',
          scrub: false
        }
      }
    );
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.highlights')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createHighlights(container, options) {
  return new Highlights(container, options);
}