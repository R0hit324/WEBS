import { validateData, schemas, sanitizeForStorage } from '@/lib/validation';
import { Errors, tryCatch, isAppError } from '@/lib/errors';
import { getSupabaseConfig, TABLES } from '@/lib/supabase';

const RANGE_OPTIONS = [
  { value: '10m', label: '10m — Air Pistol / Air Rifle' },
  { value: '25m', label: '25m — Sport Pistol / Standard Pistol' },
  { value: '50m', label: '50m — Free Pistol / Rifle 3 Positions' }
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' }
];

const SUCCESS_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
const ERROR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
const SPINNER_ICON = `<svg class="btn__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`;

export class RegistrationPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      ...options
    };
    this.isSubmitting = false;
    this.supabaseUrl = null;
    this.supabaseAnonKey = null;
    this.init();
  }

  async init() {
    this.loadSupabaseConfig();
    this.render();
    this.bindFormEvents();
  }

  loadSupabaseConfig() {
    const config = getSupabaseConfig();
    this.supabaseUrl = config.url;
    this.supabaseAnonKey = config.anonKey;
  }

  render() {
    this.container.innerHTML = `
      <section class="registration-page" aria-labelledby="registration-page-title">
        <div class="container">
          <header class="registration-page__hero">
            <div class="registration-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="registration-page-title" class="registration-page__title">Register <span class="registration-page__title-accent">Now</span></h1>
            <p class="registration-page__description">Join Alwar's first RRA-certified academy. Fill out the form below and our team will contact you within 24-48 hours to discuss your training goals.</p>
          </header>

          <div class="registration-page__form-wrapper">
            <h2 class="registration-form__title">Registration Form</h2>
            <p class="registration-form__subtitle">All fields marked with <span class="required-indicator" aria-hidden="true">*</span> are required.</p>

            <form class="registration-form" id="registration-form" novalidate>
              <div class="form-row">
                <div class="form-group">
                  <label for="full_name">Full Name <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="text" id="full_name" name="full_name" required autocomplete="name" placeholder="Your full name" maxlength="100">
                  <span class="form-group__error" id="full_name-error"></span>
                </div>
                <div class="form-group">
                  <label for="age">Age</label>
                  <input type="number" id="age" name="age" min="5" max="100" autocomplete="off" placeholder="Your age (optional)">
                  <span class="form-group__error" id="age-error"></span>
                  <span class="form-group__hint">Optional. Minimum age 5 years.</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+91 XXXXX XXXXX" maxlength="20">
                  <span class="form-group__error" id="phone-error"></span>
                </div>
                <div class="form-group">
                  <label for="email">Email <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com" maxlength="254">
                  <span class="form-group__error" id="email-error"></span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">City</label>
                  <input type="text" id="city" name="city" autocomplete="address-level2" placeholder="Your city (optional)" maxlength="100">
                  <span class="form-group__error" id="city-error"></span>
                </div>
                <div class="form-group">
                  <label for="interested_range">Interested Range</label>
                  <select id="interested_range" name="interested_range" autocomplete="off">
                    <option value="">Select a range (optional)</option>
                    ${RANGE_OPTIONS.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                  </select>
                  <span class="form-group__error" id="interested_range-error"></span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="experience">Experience Level</label>
                  <select id="experience" name="experience" autocomplete="off">
                    <option value="">Select experience (optional)</option>
                    ${EXPERIENCE_OPTIONS.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                  </select>
                  <span class="form-group__error" id="experience-error"></span>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4" placeholder="Tell us about your goals, previous experience, or any questions... (optional)" maxlength="5000"></textarea>
                <span class="form-group__error" id="message-error"></span>
                <span class="form-group__hint">Optional. Maximum 5000 characters.</span>
              </div>

              <div class="form-group registration-form__submit">
                <button type="submit" class="btn btn--primary btn--large registration-form__submit-btn" id="submit-btn" disabled>
                  ${SPINNER_ICON}
                  <span class="btn__text">Submit Registration</span>
                </button>
              </div>

              <div class="registration-form__status registration-form__status--success" id="form-success" role="status" aria-live="polite">
                <span class="registration-form__status-icon" aria-hidden="true">${SUCCESS_ICON}</span>
                <div class="registration-form__status-text">
                  <strong>Registration Submitted Successfully</strong>
                  Your registration request has been submitted successfully. Our team will contact you within 24-48 hours to discuss your training goals.
                </div>
              </div>

              <div class="registration-form__status registration-form__status--error" id="form-error" role="alert" aria-live="assertive">
                <span class="registration-form__status-icon" aria-hidden="true">${ERROR_ICON}</span>
                <div class="registration-form__status-text">
                  <strong>Something Went Wrong</strong>
                  <span id="form-error-text">Please try again or contact us directly if the problem persists.</span>
                </div>
              </div>
            </form>
          </div>

          <div class="registration-page__cta-section">
            <div class="registration-page__cta-actions" role="group" aria-label="Registration page actions">
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindFormEvents() {
    const form = this.container.querySelector('#registration-form');
    if (!form) return;

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
      // Enable submit button when all required fields have values
      input.addEventListener('input', () => this.updateSubmitButtonState());
    });

    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const fieldName = field.name;
    if (!fieldName) return true;

    // Get validation schema for this field
    const schema = schemas.registrationForm;
    const validation = schema[fieldName];
    if (!validation) return true;

    const value = field.value;
    let isValid = true;
    let errorMessage = '';

    // Check required
    if (validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
      isValid = false;
      errorMessage = `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
    }
    // Skip other validations if empty and not required
    else if (!validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
      isValid = true;
    } else {
      // Run validation rules
      for (const rule of validation.rules || []) {
        if (!rule.validate(value)) {
          isValid = false;
          errorMessage = rule.message;
          break;
        }
      }
    }

    const errorEl = this.container.querySelector(`#${fieldName}-error`);
    if (!isValid) {
      field.classList.add('error');
      if (errorEl) errorEl.textContent = errorMessage;
    } else {
      field.classList.remove('error');
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

  updateSubmitButtonState() {
    const form = this.container.querySelector('#registration-form');
    if (!form) return;

    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let allFilled = true;
    requiredFields.forEach(field => {
      if (!field.value || (typeof field.value === 'string' && !field.value.trim())) {
        allFilled = false;
      }
    });

    const submitBtn = form.querySelector('#submit-btn');
    if (submitBtn) {
      submitBtn.disabled = !allFilled || this.isSubmitting;
    }
  }

  showStatus(form, type, message) {
    this.hideStatus(form);
    const statusEl = form.querySelector(type === 'success' ? '#form-success' : '#form-error');
    const textEl = form.querySelector(type === 'success' ? '#form-success .registration-form__status-text' : '#form-error-text');
    if (textEl && message) {
      // Preserve the strong element
      const strong = textEl.querySelector('strong');
      textEl.innerHTML = '';
      if (strong) textEl.appendChild(strong);
      textEl.appendChild(document.createTextNode(message));
    }
    if (statusEl) {
      statusEl.style.display = 'flex';
      statusEl.focus();
    }
  }

  hideStatus(form) {
    const successEl = form.querySelector('#form-success');
    const errorEl = form.querySelector('#form-error');
    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  setLoadingState(loading) {
    this.isSubmitting = loading;
    const submitBtn = this.container.querySelector('#submit-btn');
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.classList.toggle('loading', loading);
    }
    this.updateSubmitButtonState();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    this.hideStatus(form);

    if (!this.validateForm(form)) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    this.setLoadingState(true);

    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());

    // Sanitize data
    const allowedFields = ['full_name', 'age', 'phone', 'email', 'city', 'interested_range', 'experience', 'message'];
    const sanitizedData = sanitizeForStorage(rawData, allowedFields);

    // Convert age to number if present
    if (sanitizedData.age !== undefined && sanitizedData.age !== '') {
      sanitizedData.age = parseInt(sanitizedData.age, 10);
    } else {
      delete sanitizedData.age;
    }

    // Add default status
    sanitizedData.status = 'new';
    sanitizedData.source = 'website';

    try {
      const result = await this.submitToSupabase(sanitizedData);
      this.setLoadingState(false);

      if (result.success) {
        this.showStatus(form, 'success', 'Your registration request has been submitted successfully. Our team will contact you within 24-48 hours to discuss your training goals.');
        form.reset();
        this.updateSubmitButtonState();
      } else {
        this.showStatus(form, 'error', result.error || 'Failed to submit registration. Please try again.');
      }
    } catch (err) {
      this.setLoadingState(false);
      console.error('Registration error:', err);
      this.showStatus(form, 'error', 'An unexpected error occurred. Please try again later.');
    }
  }

  async submitToSupabase(data) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { success: false, error: 'Supabase not configured. Please contact the academy directly.' };
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${TABLES.REGISTRATIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error:', response.status, errorText);
        
        if (response.status === 429) {
          return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
        }
        
        return { success: false, error: 'Failed to save registration. Please try again.' };
      }

      return { success: true };
    } catch (err) {
      console.error('Network error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createRegistrationPage(container, options) {
  return new RegistrationPage(container, options);
}