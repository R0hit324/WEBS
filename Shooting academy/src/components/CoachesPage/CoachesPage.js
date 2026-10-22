const DEFAULT_COACHES = [
  {
    id: 'aman-choudhary',
    name: 'Aman Choudhary',
    role: 'Head Coach',
    photo: '/coaches/Aman.jpeg',
    photoAlt: 'Coach Aman Choudhary',
    qualifications: 'NRAI Level 3 Coach, ISSF Judge',
    certifications: 'ISSF Judge, NRAI Level 3 Coach',
    experience: '15 years',
    bio: 'NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines. Dedicated to developing technical precision and mental fortitude in every athlete.',
    achievements: 'Trained 5 National Champions, 2 Asian Games Medalists',
    visible: true,
    displayOrder: 1
  },
  {
    id: 'chaman-choudhary',
    name: 'Chaman Choudhary',
    role: 'Senior Coach',
    photo: '/coaches/Chaman.jpeg',
    photoAlt: 'Coach Chaman Choudhary',
    qualifications: 'NRAI Level 2 Coach',
    certifications: 'NRAI Level 2 Coach, ISSF Judge B License',
    experience: '10 years',
    bio: 'Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes. Focuses on building strong fundamentals and competition readiness.',
    achievements: 'Trained 3 National Champions, 1 Asian Games Participant',
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
        id: item.id,
        name: item.full_name,
        role: item.role,
        photo: item.photo_url,
        photoAlt: item.photo_alt || item.full_name,
        qualifications: item.qualifications,
        certifications: item.certifications,
        experience: item.experience,
        bio: item.bio,
        achievements: item.achievements,
        visible: item.is_visible !== false,
        displayOrder: item.display_order ?? 0
      }));
    } catch (error) {
      console.error('Failed to load coaches:', error);
      this.options.coaches = DEFAULT_COACHES;
    }
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
            <div class="coaches-page__hero-badge badge">ALWAR â€¢ RAJASTHAN</div>
            <h1 id="coaches-page-title" class="coaches-page__title">Our <span class="coaches-page__title-accent">Coaches</span></h1>
            <p class="coaches-page__description">Led by NRAI-certified professionals dedicated to developing champions at every level through precision training and mental conditioning.</p>
          </header>

          <div class="coaches-page__grid" role="list">${coachesHtml}</div>

          <div class="coaches-page__cta-section">
            <div class="coaches-page__cta-actions" role="group" aria-label="Coaches page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
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
