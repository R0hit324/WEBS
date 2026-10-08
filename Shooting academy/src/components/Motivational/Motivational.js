const MOTIVATIONAL_WORDS = [
  { word: 'Focus', number: '01' },
  { word: 'Discipline', number: '02' },
  { word: 'Precision', number: '03' },
  { word: 'Consistency', number: '04' }
];

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class Motivational {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      words: options.words || MOTIVATIONAL_WORDS,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const itemsHtml = this.options.words.map((item, index) => `
      <div class="motivational__item">
        <span class="motivational__number">${item.number}</span>
        <span class="motivational__word">${item.word}</span>
        ${index < this.options.words.length - 1 ? '<span class="motivational__divider" aria-hidden="true"></span>' : ''}
      </div>
    `).join('');

    this.container.innerHTML = `
      <section class="motivational" aria-label="Core values">
        <div class="container">
          <div class="motivational__grid" role="list">${itemsHtml}</div>
        </div>
      </section>
    `;
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.motivational');
    const items = this.container.querySelectorAll('.motivational__item');

    if (!section) return;

    // Items staggered entrance with scale
    gsap.fromTo(items, 
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 55%',
          scrub: false
        }
      }
    );

    // Subtle continuous floating animation
    items.forEach((item, index) => {
      gsap.to(item, {
        y: -8,
        ease: 'sine.inOut',
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        delay: index * 0.3
      });
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.motivational')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createMotivational(container, options) {
  return new Motivational(container, options);
}