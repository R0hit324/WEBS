const DEFAULT_COACHES = [
  {
    id: 'aman-choudhary',
    name: 'Aman Choudhary',
    role: 'Head Coach',
    photo: '/coaches/Aman.jpeg',
    photoAlt: 'Coach Aman Choudhary',
    qualifications: null,
    certifications: null,
    experience: null,
    bio: 'NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines. Dedicated to developing technical precision and mental fortitude in every athlete.',
    achievements: null,
    visible: true,
    displayOrder: 1
  },
  {
    id: 'chaman-choudhary',
    name: 'Chaman Choudhary',
    role: 'Senior Coach',
    photo: '/coaches/Chaman.jpeg',
    photoAlt: 'Coach Chaman Choudhary',
    qualifications: null,
    certifications: null,
    experience: null,
    bio: 'Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes. Focuses on building strong fundamentals and competition readiness.',
    achievements: null,
    visible: true,
    displayOrder: 2
  }
];

const COACH_PLACEHOLDER_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

function sortCoaches(coaches) {
  return [...coaches]
    .filter(c => c.visible !== false)
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
}

export class CoachesPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      coaches: options.coaches || DEFAULT_COACHES,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const coaches = sortCoaches(this.options.coaches);

    const coachesHtml = coaches.map(coach => `
      <article class="coach-profile" data-coach-id="${coach.id}">
        <div class="coach-profile__visual">
          ${coach.photo
            ? `<img src="${coach.photo}" alt="${coach.photoAlt}" class="coach-profile__image" loading="lazy">`
            : `
              <div class="coach-profile__placeholder" role="img" aria-label="${coach.name} photo placeholder">
                <span class="coach-profile__placeholder-icon" aria-hidden="true">${COACH_PLACEHOLDER_ICON}</span>
                <span class="coach-profile__placeholder-text">Coach Photo</span>
              </div>
            `
          }
        </div>
        <div class="coach-profile__content">
          <header class="coach-profile__header">
            <h2 class="coach-profile__name">${coach.name}</h2>
            <p class="coach-profile__role">${coach.role}</p>
          </header>
          <div class="coach-profile__bio">
            <p>${coach.bio}</p>
          </div>
          <div class="coach-profile__details">
            ${coach.qualifications ? `
              <div class="coach-detail">
                <span class="coach-detail__label">Qualifications</span>
                <span class="coach-detail__value">${coach.qualifications}</span>
              </div>
            ` : `
              <div class="coach-detail">
                <span class="coach-detail__label">Qualifications</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${coach.certifications ? `
              <div class="coach-detail">
                <span class="coach-detail__label">Certifications</span>
                <span class="coach-detail__value">${coach.certifications}</span>
              </div>
            ` : `
              <div class="coach-detail">
                <span class="coach-detail__label">Certifications</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${coach.experience ? `
              <div class="coach-detail">
                <span class="coach-detail__label">Experience</span>
                <span class="coach-detail__value">${coach.experience}</span>
              </div>
            ` : `
              <div class="coach-detail">
                <span class="coach-detail__label">Experience</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${coach.achievements ? `
              <div class="coach-detail">
                <span class="coach-detail__label">Achievements</span>
                <span class="coach-detail__value">${coach.achievements}</span>
              </div>
            ` : ''}
          </div>
          <div class="coach-profile__cta">
            <a href="/contact" class="btn btn--secondary">Contact Coach</a>
          </div>
        </div>
      </article>
    `).join('');

    this.container.innerHTML = `
      <section class="coaches-page" aria-labelledby="coaches-page-title">
        <div class="container">
          <header class="coaches-page__hero">
            <div class="coaches-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="coaches-page-title" class="coaches-page__title">Our <span class="coaches-page__title-accent">Coaches</span></h1>
            <p class="coaches-page__description">Led by NRAI-certified professionals dedicated to developing champions at every level through precision training and mental conditioning.</p>
          </header>

          <div class="coaches-page__grid" role="list">${coachesHtml}</div>

          <div class="coaches-page__cta-section">
            <div class="coaches-page__cta-actions" role="group" aria-label="Coaches page actions">
              <a href="/contact" class="btn btn--primary btn--large">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  updateCoaches(coaches) {
    this.options.coaches = coaches;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createCoachesPage(container, options) {
  return new CoachesPage(container, options);
}