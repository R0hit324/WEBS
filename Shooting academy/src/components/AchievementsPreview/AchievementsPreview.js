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

  updateAchievements(achievements) {
    this.options.achievements = achievements;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAchievementsPreview(container, options) {
  return new AchievementsPreview(container, options);
}