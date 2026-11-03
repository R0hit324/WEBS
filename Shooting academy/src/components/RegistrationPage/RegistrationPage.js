import { validateData, schemas, sanitizeForStorage } from '@/lib/validation';
import { Errors, tryCatch, isAppError } from '@/lib/errors';
import { getSupabaseConfig, TABLES } from '@/lib/supabase';
import { adminLogin, adminLogout, getAdminRole, rememberAdminRole } from '@/lib/admin-auth';
import { checkRateLimitAction, formatRetryAfter, resetRateLimitAction } from '@/lib/rate-limit';

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
const LOGIN_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
const EYE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const CLOSE_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const LOGIN_IDLE_HTML = `${LOGIN_ICON}<span>Sign In</span>`;
const LOGIN_LOADING_HTML = `${SPINNER_ICON}<span>Signing in...</span>`;

export class RegistrationPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      ...options
    };
    this.isSubmitting = false;
    this.isAuthenticating = false;
    this.isLoginOpen = false;
    this.loginPrevFocus = null;
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
              <button type="button" class="btn btn--ghost btn--large" id="admin-login-trigger" style="--ghost-color: var(--color-accent-bright);">${LOGIN_ICON}<span>Admin Login</span></button>
            </div>
          </div>

          <div class="admin-login-modal" id="admin-login-modal" role="dialog" aria-modal="true" aria-labelledby="admin-login-modal-title" aria-hidden="true">
            <div class="admin-login-modal__backdrop" id="admin-login-backdrop"></div>
            <div class="admin-login-modal__card">
              <button type="button" class="admin-login-modal__close" id="admin-login-close" aria-label="Close login form">${CLOSE_ICON}</button>
              <header class="admin-login-modal__header">
                <h2 id="admin-login-modal-title" class="admin-login-modal__title">Admin Login</h2>
                <p class="admin-login-modal__subtitle">Authorized staff access only</p>
              </header>
              <div class="admin-login-modal__error" id="admin-login-error" role="alert" hidden><span id="admin-login-error-text"></span></div>
              <form class="admin-login-modal__form" id="admin-login-form" novalidate>
                <div class="form-group">
                  <label for="admin-login-email">Email</label>
                  <input type="email" id="admin-login-email" name="email" autocomplete="email" placeholder="admin@matsyaacademy.com" required>
                </div>
                <div class="form-group">
                  <label for="admin-login-password">Password</label>
                  <div class="admin-login-modal__password">
                    <input type="password" id="admin-login-password" name="password" autocomplete="current-password" placeholder="Enter your password" required>
                    <button type="button" class="admin-login-modal__toggle" id="admin-login-toggle" aria-label="Show password">${EYE_ICON}</button>
                  </div>
                </div>
                <button type="submit" class="btn btn--primary btn--large admin-login-modal__submit" id="admin-login-submit">${LOGIN_IDLE_HTML}</button>
              </form>
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

    this.bindLoginEvents();
  }

  bindLoginEvents() {
    const modal = this.container.querySelector('#admin-login-modal');
    if (!modal) return;

    this.container.querySelector('#admin-login-trigger')?.addEventListener('click', () => this.openLoginModal());
    modal.querySelector('#admin-login-close').addEventListener('click', () => this.closeLoginModal());
    modal.querySelector('#admin-login-backdrop').addEventListener('click', () => this.closeLoginModal());
    const toggle = modal.querySelector('#admin-login-toggle');
    toggle.innerHTML = EYE_ICON;
    toggle.addEventListener('click', () => this.togglePasswordVisibility());
    modal.querySelector('#admin-login-form').addEventListener('submit', (e) => this.handleLoginSubmit(e));
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLoginModal();
    });
  }

  openLoginModal() {
    const modal = this.container.querySelector('#admin-login-modal');
    if (!modal) return;
    this.loginPrevFocus = document.activeElement;
    this.isLoginOpen = true;
    modal.classList.add('admin-login-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => modal.querySelector('#admin-login-email')?.focus(), 80);
  }

  closeLoginModal() {
    const modal = this.container.querySelector('#admin-login-modal');
    if (!modal || !this.isLoginOpen) return;
    this.isLoginOpen = false;
    modal.classList.remove('admin-login-modal--open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.loginPrevFocus && typeof this.loginPrevFocus.focus === 'function') {
      this.loginPrevFocus.focus();
    }
  }

  togglePasswordVisibility() {
    const input = this.container.querySelector('#admin-login-password');
    const toggle = this.container.querySelector('#admin-login-toggle');
    if (!input || !toggle) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    toggle.innerHTML = showing ? EYE_ICON : EYE_OFF_ICON;
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }

  showLoginError(message) {
    const errorEl = this.container.querySelector('#admin-login-error');
    const textEl = this.container.querySelector('#admin-login-error-text');
    if (!errorEl) return;
    if (textEl) textEl.textContent = message;
    errorEl.hidden = false;
  }

  hideLoginError() {
    const errorEl = this.container.querySelector('#admin-login-error');
    if (errorEl) errorEl.hidden = true;
  }

  setLoginLoading(loading) {
    this.isAuthenticating = loading;
    const submit = this.container.querySelector('#admin-login-submit');
    const email = this.container.querySelector('#admin-login-email');
    const password = this.container.querySelector('#admin-login-password');
    if (submit) {
      submit.disabled = loading;
      submit.innerHTML = loading ? LOGIN_LOADING_HTML : LOGIN_IDLE_HTML;
    }
    if (email) email.disabled = loading;
    if (password) password.disabled = loading;
  }

  resetLoginFormState() {
    this.hideLoginError();
    this.setLoginLoading(false);
    const form = this.container.querySelector('#admin-login-form');
    if (form) form.reset();
    const password = this.container.querySelector('#admin-login-password');
    const toggle = this.container.querySelector('#admin-login-toggle');
    if (password) password.type = 'password';
    if (toggle) {
      toggle.innerHTML = EYE_ICON;
      toggle.setAttribute('aria-label', 'Show password');
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    if (this.isAuthenticating) return;

    const form = e.target;
    const emailInput = form.querySelector('#admin-login-email');
    const passwordInput = form.querySelector('#admin-login-password');
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    this.hideLoginError();

    if (!email || !password) {
      this.showLoginError('Please enter both email and password.');
      (!email ? emailInput : passwordInput)?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showLoginError('Please enter a valid email address.');
      emailInput?.focus();
      return;
    }

    // Client-side rate limit for admin login (strict)
    const rl = checkRateLimitAction('adminLogin');
    if (!rl.allowed) {
      this.showLoginError(`Too many login attempts. Please wait ${formatRetryAfter(rl.retryAfterMs)} and try again.`);
      return;
    }

    this.setLoginLoading(true);

    try {
      await adminLogin(email, password);
      const check = await getAdminRole();
      if (check.status === 'unavailable') {
        // Could not verify the role right now: revoke the fresh (unverified)
        // session and ask for a retry — no unverified entry.
        await adminLogout();
        this.setLoginLoading(false);
        this.showLoginError('Authentication is temporarily unavailable. Please try again later.');
        passwordInput?.focus();
        return;
      }
      if (check.status !== 'allowed') {
        // Authenticated but not an authorized active admin/editor/viewer:
        // clear the session and deny access
        await adminLogout();
        this.setLoginLoading(false);
        this.showLoginError('Access denied: this account does not have administrator privileges.');
        passwordInput?.focus();
        return;
      }
      rememberAdminRole(check.role);
      // Successful login — reset rate limit for this session
      resetRateLimitAction('adminLogin');
      // Authorized admin: hand off to the existing admin flow/route protection
      window.location.href = '/admin/';
    } catch (err) {
      this.setLoginLoading(false);
      const raw = err?.message || '';
      let message = 'Login failed. Please check your credentials and try again.';
      if (/invalid/i.test(raw)) message = 'Invalid email or password. Please try again.';
      else if (/not confirmed|email.*confirm/i.test(raw)) message = 'Please confirm your email address before signing in.';
      else if (/network|failed to fetch/i.test(raw)) message = 'Network error. Please check your connection and try again.';
      else if (/not configured/i.test(raw)) message = 'Authentication is temporarily unavailable. Please try again later.';
      this.showLoginError(message);
      passwordInput?.focus();
    }
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

    // Client-side rate limit (first line of defense; real enforcement at Edge/DB)
    const rl = checkRateLimitAction('registration');
    if (!rl.allowed) {
      this.showStatus(form, 'error', `Too many registration attempts. Please wait ${formatRetryAfter(rl.retryAfterMs)} and try again.`);
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

    // Note: status and source are enforced by database trigger/policy.
    // They must NOT be sent by the client to prevent manipulation.

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
    if (this.isLoginOpen) {
      document.body.style.overflow = '';
    }
    this.container.innerHTML = '';
  }
}

export function createRegistrationPage(container, options) {
  return new RegistrationPage(container, options);
}
