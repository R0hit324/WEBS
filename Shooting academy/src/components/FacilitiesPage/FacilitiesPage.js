const FACILITY_ICONS = {
  '10m Indoor Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`,
  '25m Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  '50m Outdoor Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
};

const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function detailValueText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.values(value).filter(v => v != null).join(', ').trim();
  }
  return String(value).trim();
}

function sortFacilities(facilities) {
  return [...facilities]
    .filter(f => f.visible !== false)
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
}

export class FacilitiesPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      facilities: options.facilities || [],
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
        id: item.id,
        name: item.name,
        category: item.category || 'Facility',
        description: item.description || item.short_description || '',
        image: item.image_url || null,
        imageAlt: item.image_alt || item.name,
        specifications: detailValueText(item.specifications),
        equipment: detailValueText(item.equipment),
        capacity: item.capacity || null,
        features: Array.isArray(item.features) ? item.features : [],
        visible: item.is_visible !== false,
        displayOrder: item.display_order ?? 0
      }));
    } catch (error) {
      console.error('Failed to load facilities:', error);
      this.options.facilities = [];
    }
  }

  render() {
    const facilities = sortFacilities(this.options.facilities);

    const facilitiesHtml = facilities.map(facility => {
      const hasDetails = facility.specifications || facility.equipment || facility.capacity;

      return `
      <article class="facility-card" data-facility-id="${facility.id}">
        <div class="facility-card__visual">
          ${facility.image
            ? `<img src="${facility.image}" alt="${facility.imageAlt || facility.name}" class="facility-card__image" loading="lazy"
                 onerror="this.onerror=null;this.style.display='none';const f=this.nextElementSibling;if(f)f.style.display='flex';"
               >
               <div class="facility-card__placeholder" role="img" aria-label="${facility.name} placeholder" style="display:none">
                 <span class="facility-card__placeholder-icon" aria-hidden="true">${FACILITY_ICONS[facility.name] || ''}</span>
                 <span class="facility-card__placeholder-text">Facility Image</span>
               </div>`
            : `
              <div class="facility-card__placeholder" role="img" aria-label="${facility.name} placeholder">
                <span class="facility-card__placeholder-icon" aria-hidden="true">${FACILITY_ICONS[facility.name] || ''}</span>
                <span class="facility-card__placeholder-text">Facility Image</span>
              </div>
            `
          }
        </div>
        <div class="facility-card__content">
          <header class="facility-card__header">
            <h2 class="facility-card__name">${facility.name}</h2>
            <span class="facility-card__category">${facility.category}</span>
          </header>
          ${facility.description ? `<p class="facility-card__desc">${facility.description}</p>` : ''}
          ${hasDetails ? `
            <div class="facility-card__details">
              ${facility.specifications ? `
                <div class="facility-detail">
                  <span class="facility-detail__label">Specifications</span>
                  <span class="facility-detail__value">${facility.specifications}</span>
                </div>
              ` : ''}
              ${facility.equipment ? `
                <div class="facility-detail">
                  <span class="facility-detail__label">Equipment</span>
                  <span class="facility-detail__value">${facility.equipment}</span>
                </div>
              ` : ''}
              ${facility.capacity ? `
                <div class="facility-detail">
                  <span class="facility-detail__label">Capacity</span>
                  <span class="facility-detail__value">${facility.capacity}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
          ${facility.features && facility.features.length > 0 ? `
            <ul class="facility-card__features" role="list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-2);">
              ${facility.features.map(feature => `
                <li style="display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                  <span aria-hidden="true">${CHECK_ICON}</span>
                  <span>${feature}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      </article>
    `;
    }).join('');

    this.container.innerHTML = `
      <section class="facilities-page" aria-labelledby="facilities-page-title">
        <div class="container">
          <header class="facilities-page__hero">
            <div class="facilities-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="facilities-page-title" class="facilities-page__title">Our <span class="facilities-page__title-accent">Facilities</span></h1>
            <p class="facilities-page__description">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition. Designed for training excellence.</p>
          </header>

          <div class="facilities-page__grid" role="list">${facilitiesHtml}</div>

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

export function createFacilitiesPage(container, options) {
  return new FacilitiesPage(container, options);
}
