const ABOUT_CONTENT = {
  intro: {
    title: 'Academy Introduction',
    content: `Matsya Shooting Sports Academy is Alwar's first RRA-certified academy, dedicated to developing precision, discipline, confidence, and performance in shooting sports. Located in Alwar, Rajasthan, we provide world-class training facilities across 10m, 25m, and 50m ranges under the guidance of certified coaches.`
  },
  story: {
    title: 'Our Story',
    content: `Established with a vision to bring professional shooting sports training to Alwar and the surrounding region, Matsya Shooting Sports Academy was founded to create a structured pathway for aspiring shooters. From beginners taking their first shot to competitive athletes preparing for state and national championships, our academy serves as a hub for excellence in shooting sports.`
  },
  vision: {
    title: 'Vision',
    content: `To be the premier shooting sports academy in Rajasthan, recognized for producing champions who embody precision, discipline, and sporting excellence at national and international levels.`
  },
  mission: {
    title: 'Mission',
    content: `To provide accessible, professional, and structured shooting sports training that develops technical mastery, mental fortitude, and competitive readiness in every athlete — regardless of their starting level.`
  },
  philosophy: {
    title: 'Coaching Philosophy',
    content: `Our coaching philosophy centers on four pillars: Precision, Discipline, Confidence, and Performance. We believe that technical excellence is built through systematic, data-driven training combined with mental conditioning. Every shooter receives individualized attention within a structured program that progresses from fundamentals to advanced competition preparation.`
  },
  whyChooseUs: {
    title: 'Why Choose Us',
    items: [
      'Alwar\'s first RRA-certified academy',
      'Three dedicated ranges: 10m, 25m, 50m',
      'NRAI-certified coaches: Aman Choudhary & Chaman Choudhary',
      'Electronic scoring systems (SIUS/MEGALINK) on 10m range',
      'Structured programs for beginners, youth, and competitive athletes',
      'Climate-controlled indoor facilities',
      'Competition-grade outdoor 50m range with wind flags',
      'Individualized coaching within group training structure'
    ]
  },
  highlights: [
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      title: 'RRA Certified',
      desc: 'Alwar\'s first and only RRA-certified shooting academy'
    },
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      title: 'Three Ranges',
      desc: '10m indoor, 25m, and 50m outdoor ranges meeting ISSF standards'
    },
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      title: 'Expert Coaching',
      desc: 'Led by NRAI-certified coaches with national-level experience'
    }
  ]
};

const PLACEHOLDER_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

export class AboutPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      content: options.content || ABOUT_CONTENT,
      imageSrc: options.imageSrc || null,
      imageAlt: options.imageAlt || 'Academy facility',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const { content, imageSrc, imageAlt } = this.options;

    const visualHtml = imageSrc
      ? `<img src="${imageSrc}" alt="${imageAlt}" class="about-page__image" loading="lazy">`
      : `
        <div class="about-page__placeholder" role="img" aria-label="Academy facility placeholder">
          <span class="about-page__placeholder-icon" aria-hidden="true">${PLACEHOLDER_ICON}</span>
          <span class="about-page__placeholder-text">Academy Facility Image</span>
        </div>
      `;

    const whyItemsHtml = content.whyChooseUs.items.map(item => `
      <li style="display: flex; align-items: flex-start; gap: var(--spacing-3); margin-bottom: var(--spacing-3); padding-left: 0; list-style: none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: var(--color-accent-bright); margin-top: 2px;"><polyline points="20 6 9 17 4 12"/></svg>
        <span style="color: var(--color-text-secondary); line-height: var(--line-height-relaxed);">${item}</span>
      </li>
    `).join('');

    const highlightsHtml = content.highlights.map(h => `
      <article class="about-page__highlight-card">
        <span class="about-page__highlight-icon" aria-hidden="true">${h.icon}</span>
        <h3 class="about-page__highlight-title">${h.title}</h3>
        <p class="about-page__highlight-desc">${h.desc}</p>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="about-page" aria-labelledby="about-page-title">
        <div class="container">
          <header class="about-page__hero">
            <div class="about-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="about-page-title" class="about-page__title">About <span class="about-page__title-accent">Matsya Shooting Sports Academy</span></h1>
            <p class="about-page__description">Alwar's first RRA-certified academy dedicated to professional shooting sports training across 10m, 25m, and 50m ranges.</p>
            <div class="about-page__visual">${visualHtml}</div>
          </header>

          <div class="about-page__section" id="introduction">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Introduction</p>
              <h2 class="about-page__section-title">${content.intro.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${content.intro.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="story">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Our Journey</p>
              <h2 class="about-page__section-title">${content.story.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${content.story.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="vision-mission">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Vision & Mission</p>
              <h2 class="about-page__section-title">Guiding <span class="about-page__section-title-accent">Principles</span></h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block">
                <h3 class="about-page__content-title">${content.vision.title}</h3>
                <p class="about-page__content-text">${content.vision.content}</p>
              </div>
              <div class="about-page__content-block">
                <h3 class="about-page__content-title">${content.mission.title}</h3>
                <p class="about-page__content-text">${content.mission.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="philosophy">
            <div class="about-page__section-header">
              <p class="about-page__section-pretile">Approach</p>
              <h2 class="about-page__section-title">${content.philosophy.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${content.philosophy.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="why-choose">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Why Choose Us</p>
              <h2 class="about-page__section-title">The Matsya <span class="about-page__section-title-accent">Advantage</span></h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <ul style="list-style: none; padding: 0;">${whyItemsHtml}</ul>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="highlights">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Highlights</p>
              <h2 class="about-page__section-title">Academy <span class="about-page__section-title-accent">Highlights</span></h2>
            </div>
            <div class="about-page__highlights-grid" role="list">${highlightsHtml}</div>
          </div>

          <div class="about-page__cta-section">
            <div class="about-page__cta-actions" role="group" aria-label="About page actions">
              <a href="/contact" class="btn btn--primary btn--large">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAboutPage(container, options) {
  return new AboutPage(container, options);
}