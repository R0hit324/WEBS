const ABOUT_FEATURES = [
  {
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    title: 'Precision',
    description: 'Developing exact aim and consistent shot placement through structured methodology.'
  },
  {
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: 'Discipline',
    description: 'Building mental fortitude and routine that translates beyond the range.'
  },
  {
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    title: 'Confidence',
    description: 'Empowering shooters with self-belief through measurable progress and achievement.'
  },
  {
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    title: 'Performance',
    description: 'Optimizing competitive readiness through data-driven training and expert coaching.'
  }
];

const PLACEHOLDER_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

export class AboutPreview {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      features: options.features || ABOUT_FEATURES,
      ctaLabel: options.ctaLabel || 'Explore Academy',
      ctaHref: options.ctaHref || '#about',
      imageSrc: options.imageSrc || null,
      imageAlt: options.imageAlt || 'Academy training facility',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const featuresHtml = this.options.features.map(feature => `
      <div class="about-preview__feature">
        <span class="about-preview__feature-icon" aria-hidden="true">${feature.icon}</span>
        <h3 class="about-preview__feature-title">${feature.title}</h3>
        <p class="about-preview__feature-desc">${feature.description}</p>
      </div>
    `).join('');

    const visualHtml = this.options.imageSrc
      ? `<img src="${this.options.imageSrc}" alt="${this.options.imageAlt}" class="about-preview__image" loading="lazy">`
      : `
        <div class="about-preview__placeholder" role="img" aria-label="Academy facility placeholder">
          <span class="about-preview__placeholder-icon" aria-hidden="true">${PLACEHOLDER_ICON}</span>
          <span class="about-preview__placeholder-text">Academy Facility Image</span>
        </div>
      `;

    this.container.innerHTML = `
      <section class="about-preview section" aria-labelledby="about-preview-title">
        <div class="container">
          <div class="about-preview__grid">
            <div class="about-preview__content">
              <div class="section-heading" style="text-align: left; margin-bottom: var(--spacing-6);">
                <p class="section-heading__pretitle">About Us</p>
                <h2 id="about-preview-title" class="section-heading__title">Where <span class="section-heading__title-accent">Precision</span> Meets Passion</h2>
                <p class="section-heading__subtitle">Established as Alwar's first RRA-certified academy, we provide world-class training across 10m, 25m, and 50m ranges under the guidance of certified coaches.</p>
              </div>
              <div class="about-preview__features" role="list">${featuresHtml}</div>
              <div class="about-preview__cta">
                <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
              </div>
            </div>
            <div class="about-preview__visual">${visualHtml}</div>
          </div>
        </div>
      </section>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAboutPreview(container, options) {
  return new AboutPreview(container, options);
}