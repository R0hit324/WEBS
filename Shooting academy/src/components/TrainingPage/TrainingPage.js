const RANGE_CARDS = [
  {
    distance: '10m',
    discipline: 'Air Pistol / Air Rifle',
    description: 'Olympic-standard 10m indoor range with electronic target systems. Climate-controlled environment for precision training and competition preparation.',
    features: [
      'Electronic scoring targets (SIUS/MEGALINK)',
      '20 firing points',
      'Climate-controlled',
      'Beginner to elite programs'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    placeholderIcon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`
  },
  {
    distance: '25m',
    discipline: 'Sport Pistol / Standard Pistol',
    description: 'Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.',
    features: [
      'Turning target systems',
      'Rapid fire capability',
      'Competition-grade lighting',
      'Coaching bay available'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    placeholderIcon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    distance: '50m',
    discipline: 'Free Pistol / Rifle 3 Positions',
    description: 'Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol disciplines.',
    features: [
      'Outdoor range with wind flags',
      'Rifle 3-positions capable',
      'Free pistol discipline',
      'Tournament ready'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    placeholderIcon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  }
];

const AUDIENCES = [
  {
    title: 'Beginners',
    description: 'Fundamentals of safety, stance, grip, and trigger control. Structured entry-level programs.',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    title: 'Kids / Youth',
    description: 'Age-appropriate training with focus on safety, discipline, and fun. Junior development pathways.',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    title: 'Competitive Athletes',
    description: 'Advanced training for state, national, and international competition. Data-driven performance optimization.',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  },
  {
    title: 'Recreational Shooters',
    description: 'Flexible pay-and-play sessions for hobbyists. Skill-building at your own pace.',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
  }
];

const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export class TrainingPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      ranges: options.ranges || RANGE_CARDS,
      audiences: options.audiences || AUDIENCES,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const { ranges, audiences } = this.options;

    const rangesHtml = ranges.map(range => `
      <article class="training-range-card">
        <div class="training-range-card__visual">
          ${range.imageSrc
            ? `<img src="${range.imageSrc}" alt="${range.distance} range" class="training-range-card__image" loading="lazy">`
            : `
              <div class="training-range-card__placeholder" role="img" aria-label="${range.distance} range placeholder">
                <span class="training-range-card__placeholder-icon" aria-hidden="true">${range.placeholderIcon}</span>
                <span class="training-range-card__placeholder-text">Range Image</span>
              </div>
            `
          }
        </div>
        <div class="training-range-card__content">
          <h3 class="training-range-card__distance">${range.distance}</h3>
          <p class="training-range-card__discipline">${range.discipline}</p>
          <p class="training-range-card__desc">${range.description}</p>
          <ul class="training-range-card__features" role="list">
            ${range.features.map(feature => `
              <li class="training-range-card__feature">
                <span class="training-range-card__feature-icon" aria-hidden="true">${CHECK_ICON}</span>
                <span>${feature}</span>
              </li>
            `).join('')}
          </ul>
          <a href="/training#${range.distance.toLowerCase()}" class="btn btn--secondary training-range-card__cta">Learn More</a>
        </div>
      </article>
    `).join('');

    const audiencesHtml = audiences.map(audience => `
      <article class="training-audience-card">
        <span class="training-audience-card__icon" aria-hidden="true">${audience.icon}</span>
        <h3 class="training-audience-card__title">${audience.title}</h3>
        <p class="training-audience-card__desc">${audience.description}</p>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="training-page" aria-labelledby="training-page-title">
        <div class="container">
          <header class="training-page__hero">
            <div class="training-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="training-page-title" class="training-page__title">Training Programs & <span class="training-page__title-accent">Ranges</span></h1>
            <p class="training-page__description">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition. Programs structured for every level.</p>
          </header>

          <div class="training-page__section" id="ranges">
            <div class="training-page__section-header">
              <p class="training-page__section-pretitle">Our Ranges</p>
              <h2 class="training-page__section-title">Three Ranges for Every <span class="training-page__section-title-accent">Discipline</span></h2>
            </div>
            <div class="training-page__ranges-grid" role="list">${rangesHtml}</div>
          </div>

          <div class="training-page__section" id="audiences">
            <div class="training-page__section-header">
              <p class="training-page__section-pretitle">Who We Train</p>
              <h2 class="training-page__section-title">Programs for Every <span class="training-page__section-title-accent">Shooter</span></h2>
            </div>
            <div class="training-page__audiences-grid" role="list">${audiencesHtml}</div>
          </div>

          <div class="training-page__cta-section">
            <div class="training-page__cta-actions" role="group" aria-label="Training page actions">
              <a href="/contact" class="btn btn--primary btn--large">Contact Us</a>
            </div>
            <p class="training-page__note">Specific program schedules, fees, and enrollment details are managed through our registration system. Contact us for current availability.</p>
          </div>
        </div>
      </section>
    `;
  }

  updateRanges(ranges) {
    this.options.ranges = ranges;
    this.render();
  }

  updateAudiences(audiences) {
    this.options.audiences = audiences;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createTrainingPage(container, options) {
  return new TrainingPage(container, options);
}