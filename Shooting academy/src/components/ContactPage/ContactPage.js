const DEFAULT_CONTACT = {
  address: null,
  phone: null,
  whatsapp: null,
  email: null,
  hours: null,
  mapUrl: null,
  mapEmbed: null
};

const CONTACT_ICONS = {
  address: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  email: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  hours: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

const SUCCESS_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

const ERROR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

const MAP_PLACEHOLDER_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

export class ContactPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      contact: options.contact || DEFAULT_CONTACT,
      ...options
    };
    this.formState = 'idle';
    this.init();
  }

  init() {
    this.render();
    this.bindFormEvents();
  }

  render() {
    const { contact } = this.options;

    const contactDetailsHtml = `
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${CONTACT_ICONS.address}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Address</span>
          <span class="contact-detail__value ${contact.address ? '' : 'contact-detail__value--empty'}">
            ${contact.address || '[Academy Address Placeholder]'}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${CONTACT_ICONS.phone}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Phone</span>
          <span class="contact-detail__value ${contact.phone ? '' : 'contact-detail__value--empty'}">
            ${contact.phone ? `<a href="tel:${contact.phone}" class="contact-detail__link">${contact.phone}</a>` : '[Phone Placeholder]'}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${CONTACT_ICONS.whatsapp}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">WhatsApp</span>
          <span class="contact-detail__value ${contact.whatsapp ? '' : 'contact-detail__value--empty'}">
            ${contact.whatsapp ? `<a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}" class="contact-detail__link" target="_blank" rel="noopener">${contact.whatsapp}</a>` : '[WhatsApp Placeholder]'}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${CONTACT_ICONS.email}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Email</span>
          <span class="contact-detail__value ${contact.email ? '' : 'contact-detail__value--empty'}">
            ${contact.email ? `<a href="mailto:${contact.email}" class="contact-detail__link">${contact.email}</a>` : '[Email Placeholder]'}
          </span>
        </div>
      </div>
      ${contact.hours ? `
        <div class="contact-detail">
          <span class="contact-detail__icon" aria-hidden="true">${CONTACT_ICONS.hours}</span>
          <div class="contact-detail__content">
            <span class="contact-detail__label">Opening Hours</span>
            <span class="contact-detail__value">${contact.hours}</span>
          </div>
        </div>
      ` : ''}
    `;

    const mapHtml = contact.mapEmbed
      ? `<iframe src="${contact.mapEmbed}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Academy Location"></iframe>`
      : `
        <div class="contact-page__map-placeholder" role="img" aria-label="Academy location map placeholder">
          <span class="contact-page__map-icon" aria-hidden="true">${MAP_PLACEHOLDER_ICON}</span>
          <p class="contact-page__map-text">Academy location map will be displayed here once the exact address is confirmed.</p>
        </div>
      `;

    this.container.innerHTML = `
      <section class="contact-page" aria-labelledby="contact-page-title">
        <div class="container">
          <header class="contact-page__hero">
            <div class="contact-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="contact-page-title" class="contact-page__title">Get in <span class="contact-page__title-accent">Touch</span></h1>
            <p class="contact-page__description">Have questions? We'd love to hear from you. Reach out for admissions, inquiries, or to schedule a visit.</p>
          </header>

          <div class="contact-page__grid">
            <div class="contact-page__info">
              <h2 class="contact-page__info-title">Contact Information</h2>
              <div class="contact-details">${contactDetailsHtml}</div>
            </div>

            <div class="contact-page__form-wrapper">
              <h2 class="contact-form__title">Send Us a Message</h2>
              <form class="contact-form" id="contact-form" novalidate>
                <div class="contact-form__row">
                  <div class="form-group">
                    <label for="name">Name <span aria-hidden="true">*</span></label>
                    <input type="text" id="name" name="name" required autocomplete="name" placeholder="Your name">
                    <span class="form-group__error" id="name-error"></span>
                  </div>
                  <div class="form-group">
                    <label for="phone">Phone <span aria-hidden="true">*</span></label>
                    <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+91 XXXXX XXXXX">
                    <span class="form-group__error" id="phone-error"></span>
                  </div>
                </div>
                <div class="contact-form__row">
                  <div class="form-group">
                    <label for="email">Email <span aria-hidden="true">*</span></label>
                    <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
                    <span class="form-group__error" id="email-error"></span>
                  </div>
                  <div class="form-group">
                    <label for="subject">Subject</label>
                    <select id="subject" name="subject" autocomplete="off">
                      <option value="">Select a topic</option>
                      <option value="admissions">Admissions & Registration</option>
                      <option value="training">Training Programs</option>
                      <option value="facilities">Facilities & Ranges</option>
                      <option value="coaching">Coaching Inquiries</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                    <span class="form-group__error" id="subject-error"></span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="message">Message <span aria-hidden="true">*</span></label>
                  <textarea id="message" name="message" rows="5" required placeholder="Tell us how we can help you..."></textarea>
                  <span class="form-group__error" id="message-error"></span>
                </div>
                <div class="form-group">
                  <button type="submit" class="btn btn--primary btn--large contact-form__submit-btn" id="submit-btn">Send Message</button>
                </div>
                <div class="contact-form__status contact-form__status--success" id="form-success" role="status" aria-live="polite">
                  <span class="contact-form__status-icon" aria-hidden="true">${SUCCESS_ICON}</span>
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
                <div class="contact-form__status contact-form__status--error" id="form-error" role="alert" aria-live="assertive">
                  <span class="contact-form__status-icon" aria-hidden="true">${ERROR_ICON}</span>
                  <span id="form-error-text">Something went wrong. Please try again.</span>
                </div>
              </form>
            </div>
          </div>

          <div class="contact-page__map">
            <h2 class="contact-page__map-title">Find Us</h2>
            <div class="contact-page__map-container">${mapHtml}</div>
          </div>

          <div class="contact-page__cta-section">
            <div class="contact-page__cta-actions" role="group" aria-label="Contact page actions">
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindFormEvents() {
    const form = this.container.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });
  }

  validateField(field) {
    const errorEl = this.container.querySelector(`#${field.id}-error`);
    let isValid = true;
    let errorMessage = '';

    field.classList.remove('error');

    if (field.required && !field.value.trim()) {
      isValid = false;
      errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required.`;
    } else if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    } else if (field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(field.value.trim())) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number.';
      }
    } else if (field.tagName === 'SELECT' && field.required && !field.value) {
      isValid = false;
      errorMessage = 'Please select a subject.';
    }

    if (!isValid) {
      field.classList.add('error');
      if (errorEl) errorEl.textContent = errorMessage;
    } else {
      if (errorEl) errorEl.textContent = '';
    }

    return isValid;
  }

  validateForm(form) {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('#submit-btn');
    const successEl = form.querySelector('#form-success');
    const errorEl = form.querySelector('#form-error');
    const errorTextEl = form.querySelector('#form-error-text');

    this.hideStatusMessages(form);

    if (!this.validateForm(form)) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    this.setLoadingState(submitBtn, true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await this.submitForm(data);
      this.showSuccess(form);
      form.reset();
    } catch (err) {
      this.showError(form, err.message || 'Something went wrong. Please try again.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async submitForm(data) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to submit form');
    }

    return response.json();
  }

  setLoadingState(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Sending...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || 'Send Message';
    }
  }

  showSuccess(form) {
    const successEl = form.querySelector('#form-success');
    if (successEl) {
      successEl.style.display = 'flex';
      successEl.focus();
    }
  }

  showError(form, message) {
    const errorEl = form.querySelector('#form-error');
    const errorTextEl = form.querySelector('#form-error-text');
    if (errorEl && errorTextEl) {
      errorTextEl.textContent = message;
      errorEl.style.display = 'flex';
      errorEl.focus();
    }
  }

  hideStatusMessages(form) {
    const successEl = form.querySelector('#form-success');
    const errorEl = form.querySelector('#form-error');
    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  updateContact(contact) {
    this.options.contact = { ...this.options.contact, ...contact };
    this.render();
    this.bindFormEvents();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createContactPage(container, options) {
  return new ContactPage(container, options);
}