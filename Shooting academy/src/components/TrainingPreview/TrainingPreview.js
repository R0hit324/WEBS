const TRAINING_CARDS = [
  {
    distance: '10m',
    discipline: 'Air Pistol / Air Rifle',
    description: 'Olympic-standard 10m range with electronic target systems. Ideal for precision training and competition preparation.',
    features: [
      'Electronic scoring targets',
      'Climate-controlled environment',
      'Precision training programs',
      'Beginner to elite levels'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  },
  {
    distance: '25m',
    discipline: 'Sport Pistol / Standard Pistol',
    description: 'Professional 25m range for rapid fire and precision events. Equipped for ISSF-standard competitions.',
    features: [
      'Turning target systems',
      'Rapid fire capability',
      'Competition-grade lighting',
      'Coaching bay available'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`
  },
  {
    distance: '50m',
    discipline: 'Free Pistol / Rifle 3 Positions',
    description: 'Full-length 50m outdoor range for rifle and free pistol disciplines. Meets international competition standards.',
    features: [
      'Outdoor range with wind flags',
      'Rifle 3-positions capable',
      'Free pistol discipline',
      'Tournament ready'
    ],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  }
];

const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export class TrainingPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      cards: options.cards || TRAINING_CARDS,
      ctaLabel: options.ctaLabel || 'View Training',
      ctaHref: options.ctaHref || '#training',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const cardsHtml = this.options.cards.map(card => `
      <article class="training-card">
        <span class="training-card__icon" aria-hidden="true">${card.icon}</span>
        <h3 class="training-card__distance">${card.distance}</h3>
        <p class="training-card__discipline">${card.discipline}</p>
        <p class="training-card__description">${card.description}</p>
        <ul class="training-card__features" role="list">
          ${card.features.map(feature => `
            <li class="training-card__feature">
              <span class="training-card__feature-icon" aria-hidden="true">${CHECK_ICON}</span>
              <span>${feature}</span>
            </li>
          `).join('')}
        </ul>
        <a href="${this.options.ctaHref}#${card.distance.toLowerCase()}" class="btn btn--secondary training-card__cta">Learn More</a>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="training-preview section" aria-labelledby="training-preview-title">
        <div class="container">
          <div class="training-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Training Programs</p>
              <h2 id="training-preview-title" class="section-heading__title">Ranges for Every <span class="section-heading__title-accent">Discipline</span></h2>
              <p class="section-heading__subtitle">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition.</p>
            </div>
          </div>
          <div class="training-preview__cards" role="list">${cardsHtml}</div>
          <div class="training-preview__cta">
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

export function createTrainingPreview(container, options) {
  return new TrainingPreview(container, options);
}