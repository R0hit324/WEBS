const FOOTER_NAV = {
  quickLinks: [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Training', href: '#training' },
    { label: 'Achievements', href: '#achievements' }
  ],
  programs: [
    { label: '10m Range', href: '#training-10m' },
    { label: '25m Range', href: '#training-25m' },
    { label: '50m Range', href: '#training-50m' },
    { label: 'Youth Programs', href: '#youth' }
  ],
  facilities: [
    { label: 'Shooting Ranges', href: '#facilities' },
    { label: 'Equipment Rental', href: '#rental' },
    { label: 'Pro Shop', href: '#shop' },
    { label: 'Cafeteria', href: '#cafe' }
  ]
};

const FOOTER_CTAS = [
  { label: 'Register Now', variant: 'primary', href: '#register' },
  { label: 'Pay & Play', variant: 'secondary', href: '/pay-play' }
];

const FOOTER_CONTACT = {
  address: { label: 'Address', value: '[Academy Address Placeholder]', icon: 'location' },
  phone: { label: 'Phone', value: '[Phone Placeholder]', icon: 'phone' },
  email: { label: 'Email', value: '[Email Placeholder]', icon: 'mail' }
};

const CONTACT_ICONS = {
  location: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
};

export class Footer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      contactData: options.contactData || FOOTER_CONTACT,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const brandHtml = `
      <div class="footer__brand">
        <img src="/assets/shooting-logo.jpeg" alt="" class="footer__logo" loading="lazy">
        <span class="footer__brand-name">MATSYA</span>
        <span class="footer__brand-tagline">SHOOTING SPORTS ACADEMY</span>
        <p class="footer__description">Alwar's first RRA-certified academy offering professional training across 10m, 25m, and 50m ranges.</p>
      </div>
    `;

    const quickLinksHtml = FOOTER_NAV.quickLinks.map(link => `
      <li><a href="${link.href}" class="footer__link">${link.label}</a></li>
    `).join('');

    const programsHtml = FOOTER_NAV.programs.map(link => `
      <li><a href="${link.href}" class="footer__link">${link.label}</a></li>
    `).join('');

    const facilitiesHtml = FOOTER_NAV.facilities.map(link => `
      <li><a href="${link.href}" class="footer__link">${link.label}</a></li>
    `).join('');

    const ctaHtml = FOOTER_CTAS.map(cta => `
      <a href="${cta.href}" class="btn btn--${cta.variant} footer__btn">${cta.label}</a>
    `).join('');

    const contactHtml = Object.entries(this.options.contactData).map(([key, item]) => `
      <div class="footer__contact-item">
        <span class="footer__contact-icon" aria-hidden="true">${CONTACT_ICONS[item.icon] || ''}</span>
        <span class="footer__contact-label">${item.label}</span>
        <span class="footer__contact-value">${item.value}</span>
      </div>
    `).join('');

    this.container.innerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer__grid">
            ${brandHtml}

            <nav class="footer__nav" aria-label="Quick links">
              <h3 class="footer__section-title">Quick Links</h3>
              <ul class="footer__links">${quickLinksHtml}</ul>
            </nav>

            <nav class="footer__nav" aria-label="Training Programs">
              <h3 class="footer__section-title">Training</h3>
              <ul class="footer__links">${programsHtml}</ul>
            </nav>

            <nav class="footer__nav" aria-label="Facilities">
              <h3 class="footer__section-title">Facilities</h3>
              <ul class="footer__links">${facilitiesHtml}</ul>
            </nav>

            <div class="footer__ctas">
              <h3 class="footer__section-title">Get Started</h3>
              <div class="footer__cta-group">${ctaHtml}</div>
              <div class="footer__contact">${contactHtml}</div>
            </div>
          </div>

          <hr class="footer__divider">

          <div class="footer__bottom">
            <p class="footer__copyright">&copy; 2025 Matsya Shooting Sports Academy. All rights reserved.</p>
            <nav class="footer__legal" aria-label="Legal links">
              <a href="#privacy" class="footer__legal-link">Privacy Policy</a>
              <a href="#terms" class="footer__legal-link">Terms of Service</a>
              <a href="#cookies" class="footer__legal-link">Cookie Policy</a>
            </nav>
          </div>
        </div>
      </footer>
    `;
  }

  updateContactData(contactData) {
    this.options.contactData = { ...this.options.contactData, ...contactData };
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createFooter(container, options) {
  return new Footer(container, options);
}