const DEFAULT_FACILITIES = [
  {
    id: '10m-range',
    name: '10m Indoor Range',
    category: 'Shooting Range',
    description: 'Olympic-standard 10m indoor range with electronic target systems. Climate-controlled environment for precision training and competition preparation.',
    image: null,
    imageAlt: '10m indoor shooting range',
    specifications: null,
    equipment: null,
    capacity: null,
    features: [
      'Electronic scoring targets (SIUS/MEGALINK)',
      '20 firing points',
      'Climate-controlled environment',
      'Air pistol & air rifle disciplines'
    ],
    visible: true,
    displayOrder: 1
  },
  {
    id: '25m-range',
    name: '25m Range',
    category: 'Shooting Range',
    description: 'Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.',
    image: null,
    imageAlt: '25m shooting range',
    specifications: null,
    equipment: null,
    capacity: null,
    features: [
      'Turning target systems',
      'Rapid fire capability',
      'Competition-grade lighting',
      'Sport pistol & standard pistol disciplines'
    ],
    visible: true,
    displayOrder: 2
  },
  {
    id: '50m-range',
    name: '50m Outdoor Range',
    category: 'Shooting Range',
    description: 'Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol disciplines.',
    image: null,
    imageAlt: '50m outdoor shooting range',
    specifications: null,
    equipment: null,
    capacity: null,
    features: [
      'Outdoor range with wind flags',
      'Rifle 3-positions capable',
      'Free pistol discipline',
      'Tournament ready'
    ],
    visible: true,
    displayOrder: 3
  }
];

const FACILITY_ICONS = {
  '10m Indoor Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>`,
  '25m Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  '50m Outdoor Range': `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
};

const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function sortFacilities(facilities) {
  return [...facilities]
    .filter(f => f.visible !== false)
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
}

export class FacilitiesPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      facilities: options.facilities || DEFAULT_FACILITIES,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const facilities = sortFacilities(this.options.facilities);

    const facilitiesHtml = facilities.map(facility => `
      <article class="facility-card" data-facility-id="${facility.id}">
        <div class="facility-card__visual">
          ${facility.image
            ? `<img src="${facility.image}" alt="${facility.imageAlt}" class="facility-card__image" loading="lazy">`
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
          <p class="facility-card__desc">${facility.description}</p>
          <div class="facility-card__details">
            ${facility.specifications ? `
              <div class="facility-detail">
                <span class="facility-detail__label">Specifications</span>
                <span class="facility-detail__value">${facility.specifications}</span>
              </div>
            ` : `
              <div class="facility-detail">
                <span class="facility-detail__label">Specifications</span>
                <span class="facility-detail__value facility-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${facility.equipment ? `
              <div class="facility-detail">
                <span class="facility-detail__label">Equipment</span>
                <span class="facility-detail__value">${facility.equipment}</span>
              </div>
            ` : `
              <div class="facility-detail">
                <span class="facility-detail__label">Equipment</span>
                <span class="facility-detail__value facility-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${facility.capacity ? `
              <div class="facility-detail">
                <span class="facility-detail__label">Capacity</span>
                <span class="facility-detail__value">${facility.capacity}</span>
              </div>
            ` : ''}
          </div>
          ${facility.features && facility.features.length > 0 ? `
            <ul class="facility-card__features" role="list" style="list-style: none; padding: 0; margin: 0 0 var(--spacing-6); display: flex; flex-direction: column; gap: var(--spacing-2);">
              ${facility.features.map(feature => `
                <li style="display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                  <span aria-hidden="true">${CHECK_ICON}</span>
                  <span>${feature}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
          <a href="/contact" class="btn btn--secondary facility-card__cta">Enquire About This Facility</a>
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="facilities-page" aria-labelledby="facilities-page-title">
        <div class="container">
          <header class="facilities-page__hero">
            <div class="facilities-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="facilities-page-title" class="facilities-page__title">Our <span class="facilities-page__title-accent">Facilities</span></h1>
            <p class="facilities-page__description">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition. Designed for training excellence.</p>
          </header>

          <div class="facilities-page__grid" role="list">${facilitiesHtml}</div>

          <div class="facilities-page__cta-section">
            <div class="facilities-page__cta-actions" role="group" aria-label="Facilities page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
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

export function createFacilitiesPage(container, options) {
  return new FacilitiesPage(container, options);
}