const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export class TrainingPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      cards: options.cards || [],
      ctaLabel: options.ctaLabel || 'View Training',
      ctaHref: options.ctaHref || '/training',
      ...options
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.cards && this.options.cards.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.TRAINING_RANGES)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.cards = (data || []).map(item => ({
        distance: item.distance,
        discipline: item.discipline,
        description: item.description || item.short_description || '',
        features: item.features || [],
        icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      }));
    } catch (error) {
      console.error('Failed to load training ranges:', error);
      this.options.cards = [];
    }
  }

  render() {
    const cardsHtml = this.options.cards.map(card => `
      <article class="training-card">
        <span class="training-card__icon" aria-hidden="true">${card.icon}</span>
        <h3 class="training-card__distance">${card.distance}</h3>
        <p class="training-card__discipline">${card.discipline}</p>
        ${card.description ? `<p class="training-card__description">${card.description}</p>` : ''}
        <ul class="training-card__features" role="list">
          ${card.features.map(feature => `
            <li class="training-card__feature">
              <span class="training-card__feature-icon" aria-hidden="true">${CHECK_ICON}</span>
              <span>${feature}</span>
            </li>
          `).join('')}
          </ul>
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
