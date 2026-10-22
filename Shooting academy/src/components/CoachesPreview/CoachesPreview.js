const COACH_PLACEHOLDER_ICON = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

export class CoachesPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      coaches: options.coaches || [],
      ctaLabel: options.ctaLabel || 'Meet Our Coaches',
      ctaHref: options.ctaHref || '/coaches',
      ...options
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.coaches && this.options.coaches.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.COACHES)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.coaches = (data || []).map(item => ({
        name: item.full_name,
        role: item.role,
        bio: item.bio,
        imageSrc: item.photo_url,
        imageAlt: item.photo_alt || item.full_name
      }));
    } catch (error) {
      console.error('Failed to load coaches:', error);
      this.options.coaches = [];
    }
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
