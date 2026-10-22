const FACILITY_ICONS = {
  '10m Indoor Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`,
  '25m Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  '50m Outdoor Range': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
};

const FACILITY_PLACEHOLDER_ICON = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`;

export class FacilitiesPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      facilities: options.facilities || [],
      ctaLabel: options.ctaLabel || 'View Facilities',
      ctaHref: options.ctaHref || '/facilities',
      ...options
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.facilities && this.options.facilities.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.FACILITIES)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.facilities = (data || []).map(item => ({
        name: item.name,
        description: item.description || item.short_description || '',
        imageSrc: item.image_url,
        imageAlt: item.image_alt || item.name
      }));
    } catch (error) {
      console.error('Failed to load facilities:', error);
      this.options.facilities = [];
    }
  }

  render() {
    const facilitiesHtml = this.options.facilities.map(facility => `
      <article class="facility-card">
        ${facility.imageSrc
          ? `<img src="${facility.imageSrc}" alt="${facility.imageAlt || facility.name}" class="facility-card__image" loading="lazy"
               onerror="this.onerror=null;this.style.display='none';const f=this.nextElementSibling;if(f)f.style.display='flex';">`
          : ''
        }
        <div class="facility-card__placeholder" role="img" aria-label="${facility.name} placeholder"
             style="${facility.imageSrc ? 'display:none' : ''}">
          <span class="facility-card__placeholder-icon" aria-hidden="true">${FACILITY_ICONS[facility.name] || FACILITY_PLACEHOLDER_ICON}</span>
          <span class="facility-card__placeholder-text">Facility Image</span>
        </div>
        <div class="facility-card__content">
          <h3 class="facility-card__name">${facility.name}</h3>
          ${facility.description ? `<p class="facility-card__desc">${facility.description}</p>` : ''}
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="facilities-preview section" aria-labelledby="facilities-preview-title">
        <div class="container">
          <div class="facilities-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Facilities</p>
              <h2 id="facilities-preview-title" class="section-heading__title">World-Class <span class="section-heading__title-accent">Infrastructure</span></h2>
              <p class="section-heading__subtitle">Three dedicated ranges meeting international standards, designed for training excellence.</p>
            </div>
          </div>
          <div class="facilities-preview__grid" role="list">${facilitiesHtml}</div>
          <div class="facilities-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;
  }

  updateFacilities(facilities) {
    this.options.facilities = facilities;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createFacilitiesPreview(container, options) {
  return new FacilitiesPreview(container, options);
}
