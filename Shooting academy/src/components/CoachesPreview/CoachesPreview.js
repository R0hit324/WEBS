const COACHES = [
  {
    name: 'Aman Choudhary',
    role: 'Head Coach',
    bio: 'NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines.',
    imageSrc: null,
    imageAlt: 'Coach Aman Choudhary'
  },
  {
    name: 'Chaman Choudhary',
    role: 'Senior Coach',
    bio: 'Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes.',
    imageSrc: null,
    imageAlt: 'Coach Chaman Choudhary'
  }
];

const COACH_PLACEHOLDER_ICON = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

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

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createCoachesPreview(container, options) {
  return new CoachesPreview(container, options);
}