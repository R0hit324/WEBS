const FOOTER_NAV = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Training', href: '/training' },
    { label: 'Achievements', href: '/achievements' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Reviews', href: '/reviews' }
  ],
  programs: [
    { label: '10m Range', href: '/training' },
    { label: '25m Range', href: '/training' },
    { label: '50m Range', href: '/training' },
    { label: 'Youth Programs', href: '/training' }
  ],
  facilities: [
    { label: 'Shooting Ranges', href: '/facilities' },
    { label: 'Equipment Rental', href: '/facilities' },
    { label: 'Pro Shop', href: '/facilities' },
    { label: 'Cafeteria', href: '/facilities' }
  ]
};

const FOOTER_CTAS = [
  { label: 'Register Now', variant: 'primary', href: '/register' },
  { label: 'Pay & Play', variant: 'secondary', href: '/pay-play' }
];

const CONTACT_ICONS = {
  location: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  whatsapp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  hours: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

const DEFAULT_FOOTER_CONTACT = {
  address: { label: 'Address', value: 'Building Number C 74, Near Gst Office, Near Central GST Commissionerate, Kherado, Surya Nagar, Alwar-301001, Rajasthan', icon: 'location' },
  phone: { label: 'Phone', value: '8282821519, 7734057123', icon: 'phone' },
  email: { label: 'Email', value: 'alwarshooting@gmail.com', icon: 'mail' },
  whatsapp: { label: 'WhatsApp', value: '8282821519', icon: 'whatsapp' },
  hours: { label: 'Hours', value: 'Mon-Sat: 6:00 AM - 8:00 PM | Sun: 7:00 AM - 6:00 PM', icon: 'hours' }
};

export class Footer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      contactData: options.contactData || DEFAULT_FOOTER_CONTACT,
      ...options
    };
    this.init();
  }

  async init() {
    await this.loadContactSettings();
    this.render();
  }

  async loadContactSettings() {
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.CONTACT_SETTINGS)
        .select('*')
        .eq('is_public', true);

      if (error) throw error;

      const contactMap = {};
      (data || []).forEach(item => {
        if (item.setting_value) {
          contactMap[item.setting_key] = item.setting_value;
        }
      });

      // Fall back to built-in defaults for any missing setting (same academy
      // details the Contact page uses)
      this.options.contactData = {
        address: { label: 'Address', value: contactMap.address || DEFAULT_FOOTER_CONTACT.address.value, icon: 'location' },
        phone: { label: 'Phone', value: contactMap.phone || DEFAULT_FOOTER_CONTACT.phone.value, icon: 'phone' },
        email: { label: 'Email', value: contactMap.email || DEFAULT_FOOTER_CONTACT.email.value, icon: 'mail' },
        whatsapp: { label: 'WhatsApp', value: contactMap.whatsapp || DEFAULT_FOOTER_CONTACT.whatsapp.value, icon: 'whatsapp' },
        hours: { label: 'Hours', value: contactMap.hours || DEFAULT_FOOTER_CONTACT.hours.value, icon: 'hours' }
      };
    } catch (error) {
      console.error('Failed to load contact settings:', error);
      // Use defaults (empty strings)
      this.options.contactData = DEFAULT_FOOTER_CONTACT;
    }
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

    const contactHtml = Object.entries(this.options.contactData)
      .filter(([, item]) => item.value)
      .map(([key, item]) => {
        let valueHtml;
        if (key === 'phone') {
          const telNumber = item.value.split(/[,&]/)[0].replace(/[^\d+]/g, '');
          valueHtml = item.value.split(',').map(part => {
            const digits = part.replace(/[^\d+]/g, '');
            return `<a href="tel:${digits}" class="footer__contact-link">${part.trim()}</a>`;
          }).join(', ');
        } else if (key === 'email') {
          valueHtml = `<a href="mailto:${item.value.trim()}" class="footer__contact-link">${item.value}</a>`;
        } else if (key === 'whatsapp') {
          valueHtml = `<a href="https://wa.me/${String(item.value).replace(/\D/g, '')}" class="footer__contact-link" target="_blank" rel="noopener">${item.value}</a>`;
        } else {
          valueHtml = item.value;
        }
        return `
          <div class="footer__contact-item">
            <span class="footer__contact-icon" aria-hidden="true">${CONTACT_ICONS[item.icon] || ''}</span>
            <span class="footer__contact-label">${item.label}</span>
            <span class="footer__contact-value">${valueHtml}</span>
          </div>
        `;
      }).join('');

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
