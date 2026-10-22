const MEDAL_ICONS = {
  gold: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  silver: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  bronze: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
};

const EMPTY_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

const MEDAL_LABELS = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze'
};

const MEDAL_CLASSES = {
  gold: 'medalist-card__medal-badge--gold',
  silver: 'medalist-card__medal-badge--silver',
  bronze: 'medalist-card__medal-badge--bronze'
};

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

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.achievements && this.options.achievements.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.ACHIEVEMENTS)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.achievements = (data || []).map(item => ({
        id: item.id,
        athlete: item.athlete_name,
        photo: item.photo_url || '',
        photoAlt: item.photo_alt || item.athlete_name,
        event: item.event || '',
        discipline: item.discipline || '',
        competition: item.competition || '',
        year: item.year || '',
        medal: item.medal,
        description: item.description || '',
        featured: Boolean(item.is_featured),
        visible: item.is_visible !== false,
        displayOrder: item.display_order ?? 0
      }));
    } catch (error) {
      console.error('Failed to load achievements:', error);
      this.options.achievements = [];
    }
  }

  render() {
    const achievements = this.options.achievements;

    if (achievements.length === 0) {
      this.renderEmptyState();
      return;
    }

    const achievementsHtml = achievements.map(a => `
      <article class="achievement-card" data-medal="${a.medal}" role="listitem">
        <div class="achievement-card__medal" aria-hidden="true">${MEDAL_ICONS[a.medal] || MEDAL_ICONS.gold}</span>
        <h3 class="achievement-card__event">${a.event || '[Event]'}</h3>
        <div class="achievement-card__details">
          <span class="achievement-card__discipline">${a.discipline || '[Discipline]'}</span>
          <span class="achievement-card__athlete">${a.athlete || '[Athlete Name]'}</span>
          <span class="achievement-card__year">${a.year || '[Year]'}</span>
        </div>
      </article>
    `).join('');

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
          <div class="achievements-preview__grid" role="list">${achievementsHtml}</div>
          <div class="achievements-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  renderEmptyState() {
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
          <div class="achievements-preview__grid">
            <div class="achievements-preview__empty" role="status">
              <span class="achievements-preview__empty-icon" aria-hidden="true">${EMPTY_ICON}</span>
              <h3 class="achievements-preview__empty-title">No Achievements Yet</h3>
              <p class="achievements-preview__empty-desc">Verified achievements and medalists will be displayed here once added through the CMS.</p>
            </div>
          </div>
          <div class="achievements-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
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
