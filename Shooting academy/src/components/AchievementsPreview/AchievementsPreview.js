const ACHIEVEMENTS_PLACEHOLDER = [
  {
    event: 'State Championship',
    discipline: '10m Air Pistol',
    athlete: '[Athlete Name]',
    year: '2024',
    medal: 'gold'
  },
  {
    event: 'District Tournament',
    discipline: '25m Sport Pistol',
    athlete: '[Athlete Name]',
    year: '2024',
    medal: 'silver'
  },
  {
    event: 'Regional Meet',
    discipline: '50m Rifle 3P',
    athlete: '[Athlete Name]',
    year: '2023',
    medal: 'bronze'
  }
];

const MEDAL_ICONS = {
  gold: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  silver: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  bronze: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
};

const EMPTY_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AchievementsPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      achievements: options.achievements || [],
      ctaLabel: options.ctaLabel || 'View Achievements',
      ctaHref: options.ctaHref || '#achievements',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const achievements = this.options.achievements.length > 0
      ? this.options.achievements
      : ACHIEVEMENTS_PLACEHOLDER;

    const isPlaceholder = this.options.achievements.length === 0;

    if (isPlaceholder) {
      this.container.innerHTML = `
        <section class="achievements-preview section" aria-labelledby="achievements-preview-title">
          <div class="container">
            <div class="achievements-preview__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Achievements</p>
                <h2 id="achievements-preview-title" class="section-heading__title">Celebrating <span class="section-heading__title-accent">Excellence</span></h2>
                <p class="section-heading__subtitle">Our shooters consistently podium at state, national, and international competitions.</p>
              </div>
            </div>
            <div class="achievements-preview__grid" role="list">
              ${achievements.map(a => `
                <article class="achievement-card" data-placeholder="true">
                  <span class="achievement-card__medal" aria-hidden="true">${MEDAL_ICONS[a.medal] || MEDAL_ICONS.gold}</span>
                  <h3 class="achievement-card__event">${a.event}</h3>
                  <div class="achievement-card__details">
                    <span class="achievement-card__discipline">${a.discipline}</span>
                    <span class="achievement-card__athlete">${a.athlete}</span>
                    <span class="achievement-card__year">${a.year}</span>
                  </div>
                </article>
              `).join('')}
            </div>
            <div class="achievements-preview__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;
    } else {
      this.container.innerHTML = `
        <section class="achievements-preview section" aria-labelledby="achievements-preview-title">
          <div class="container">
            <div class="achievements-preview__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Achievements</p>
                <h2 id="achievements-preview-title" class="section-heading__title">Celebrating <span class="section-heading__title-accent">Excellence</span></h2>
                <p class="section-heading__subtitle">Our shooters consistently podium at state, national, and international competitions.</p>
              </div>
            </div>
            <div class="achievements-preview__grid" role="list">
              ${achievements.map(a => `
                <article class="achievement-card">
                  <span class="achievement-card__medal" aria-hidden="true">${MEDAL_ICONS[a.medal] || MEDAL_ICONS.gold}</span>
                  <h3 class="achievement-card__event">${a.event}</h3>
                  <div class="achievement-card__details">
                    <span class="achievement-card__discipline">${a.discipline}</span>
                    <span class="achievement-card__athlete">${a.athlete}</span>
                    <span class="achievement-card__year">${a.year}</span>
                  </div>
                </article>
              `).join('')}
            </div>
            <div class="achievements-preview__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;
    }
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.achievements-preview');
    const header = this.container.querySelector('.achievements-preview__header');
    const cards = this.container.querySelectorAll('.achievement-card');
    const cta = this.container.querySelector('.achievements-preview__cta');

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
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.12,
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

    // Subtle floating animation on cards
    cards.forEach((card, index) => {
      const delay = index * 0.5;
      gsap.to(card, {
        y: -10,
        ease: 'sine.inOut',
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        delay
      });
    });
  }

  updateAchievements(achievements) {
    this.options.achievements = achievements;
    this.render();
    this.initAnimations();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.achievements-preview')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createAchievementsPreview(container, options) {
  return new AchievementsPreview(container, options);
}