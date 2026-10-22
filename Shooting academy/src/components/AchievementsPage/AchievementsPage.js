const DEFAULT_ACHIEVEMENTS = [];

const MEDAL_ICONS = {
  gold: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  silver: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  bronze: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  participation: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 12.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 12.27l6.91-1.01L12 2z"/></svg>`
};

const MEDAL_LABELS = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  participation: 'Participation'
};

const MEDAL_CLASSES = {
  gold: 'medalist-card__medal-badge--gold',
  silver: 'medalist-card__medal-badge--silver',
  bronze: 'medalist-card__medal-badge--bronze',
  participation: 'medalist-card__medal-badge--participation'
};

const EMPTY_ICON = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

const PLACEHOLDER_ICON = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

function sortAchievements(achievements) {
  return [...achievements]
    .filter(a => a.visible !== false)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });
}

function filterAchievements(achievements, filter) {
  if (filter === 'all') return achievements;
  return achievements.filter(a => a.medal === filter);
}

export class AchievementsPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      achievements: options.achievements || DEFAULT_ACHIEVEMENTS,
      ...options
    };
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
    this.bindFilterEvents();
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
    const achievements = sortAchievements(this.options.achievements);

    if (achievements.length === 0) {
      this.renderEmptyState();
      return;
    }

    const filtered = filterAchievements(achievements, this.currentFilter);

    const achievementsHtml = filtered.map(a => this.renderMedalistCard(a)).join('');

    this.container.innerHTML = `
      <section class="achievements-page" aria-labelledby="achievements-page-title">
        <div class="container">
          <header class="achievements-page__hero">
            <div class="achievements-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="achievements-page-title" class="achievements-page__title">Achievements & <span class="achievements-page__title-accent">Medalists</span></h1>
            <p class="achievements-page__description">Celebrating the competitive success of our athletes across state, national, and international championships.</p>
          </header>

          <div class="achievements-page__filters" role="group" aria-label="Filter achievements by medal type">
            <button class="achievements-page__filter achievements-page__filter--active" data-filter="all">All</button>
            <button class="achievements-page__filter" data-filter="gold">Gold</button>
            <button class="achievements-page__filter" data-filter="silver">Silver</button>
            <button class="achievements-page__filter" data-filter="bronze">Bronze</button>
          </div>

          <div class="achievements-page__grid" role="list">${achievementsHtml}</div>
        </div>
      </section>
    `;
  }

  renderMedalistCard(a) {
    const medal = a.medal || 'gold';
    const medalIcon = MEDAL_ICONS[medal] || MEDAL_ICONS.gold;
    const medalClass = MEDAL_CLASSES[medal] || MEDAL_CLASSES.gold;
    const medalLabel = MEDAL_LABELS[medal] || MEDAL_LABELS.gold;

    return `
      <article class="medalist-card" data-medal="${medal}" role="listitem">
        <div class="medalist-card__visual">
          ${a.photo
            ? `<img src="${a.photo}" alt="${a.photoAlt || a.athlete || 'Athlete photo'}" class="medalist-card__image" loading="lazy"
                 onerror="this.onerror=null;this.style.display='none';const f=this.nextElementSibling;if(f)f.style.display='flex';"
               ><div class="medalist-card__placeholder" role="img" aria-label="${a.athlete || 'Athlete'} photo placeholder" style="display:none">
                 <span class="medalist-card__placeholder-icon" aria-hidden="true">${PLACEHOLDER_ICON}</span>
                 <span class="medalist-card__placeholder-text">Athlete Photo</span>
               </div>`
            : `
              <div class="medalist-card__placeholder" role="img" aria-label="${a.athlete || 'Athlete'} photo placeholder">
                <span class="medalist-card__placeholder-icon" aria-hidden="true">${PLACEHOLDER_ICON}</span>
                <span class="medalist-card__placeholder-text">Athlete Photo</span>
              </div>
            `
          }
          <span class="medalist-card__medal-badge ${medalClass}" aria-label="${medalLabel} medal">
            <span class="medalist-card__medal-icon" aria-hidden="true">${medalIcon}</span>
          </span>
        </div>
        <div class="medalist-card__content">
          <header class="medalist-card__header">
            ${a.athlete ? `<h2 class="medalist-card__athlete">${a.athlete}</h2>` : ''}
            ${a.year ? `<span class="medalist-card__year">${a.year}</span>` : ''}
          </header>
          ${a.event ? `<p class="medalist-card__event">${a.event}</p>` : ''}
          ${a.competition ? `<p class="medalist-card__competition">${a.competition}</p>` : ''}
          ${a.discipline ? `<p class="medalist-card__discipline">${a.discipline}</p>` : ''}
          ${a.description ? `
            <p class="medalist-card__description">${a.description}</p>
          ` : ''}
        </div>
      </article>
    `;
  }

  renderEmptyState() {
    this.container.innerHTML = `
      <section class="achievements-page" aria-labelledby="achievements-page-title">
        <div class="container">
          <header class="achievements-page__hero">
            <div class="achievements-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="achievements-page-title" class="achievements-page__title">Achievements & <span class="achievements-page__title-accent">Medalists</span></h1>
            <p class="achievements-page__description">Celebrating the competitive success of our athletes across state, national, and international championships.</p>
          </header>

          <div class="achievements-page__grid">
            <div class="achievements-page__empty" role="status">
              <span class="achievements-page__empty-icon" aria-hidden="true">${EMPTY_ICON}</span>
              <h2 class="achievements-page__empty-title">No Achievements Yet</h2>
              <p class="achievements-page__empty-desc">Verified achievements and medalists will be displayed here once added through the CMS.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindFilterEvents() {
    const filterButtons = this.container.querySelectorAll('.achievements-page__filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filter;
        this.updateFilterUI();
        this.render();
      });
    });
  }

  updateFilterUI() {
    const filterButtons = this.container.querySelectorAll('.achievements-page__filter');
    filterButtons.forEach(btn => {
      btn.classList.toggle('achievements-page__filter--active', btn.dataset.filter === this.currentFilter);
    });
  }

  updateAchievements(achievements) {
    this.options.achievements = achievements;
    this.render();
    this.bindFilterEvents();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAchievementsPage(container, options) {
  return new AchievementsPage(container, options);
}
