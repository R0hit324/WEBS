import { getSupabaseConfig, TABLES } from '@/lib/supabase';

const sessionsData = [
  {
    id: 's1',
    name: '10m Air Rifle',
    duration: '30 min',
    price: 800,
    includes: ['Range time', 'Air rifle', 'Targets', 'Instructor guidance'],
  },
  {
    id: 's2',
    name: '10m Air Pistol',
    duration: '30 min',
    price: 800,
    includes: ['Range time', 'Air pistol', 'Targets', 'Instructor guidance'],
  },
  {
    id: 's3',
    name: '50m Rifle',
    duration: '1 hour',
    price: 1200,
    includes: ['Range time', 'Rifle', 'Targets', 'Instructor guidance'],
  },
  {
    id: 's4',
    name: '50m Pistol',
    duration: '1 hour',
    price: 1200,
    includes: ['Range time', 'Pistol', 'Targets', 'Instructor guidance'],
  },
];

export class PayPlaySessionPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.sessionId = options.sessionId || 's1';
    this.session = sessionsData.find(s => s.id === this.sessionId) || sessionsData[0];
    this.formData = {
      full_name: '',
      phone: '',
      email: '',
      city: '',
      experience_level: 'beginner',
      preferred_date: '',
      preferred_time: '',
      message: '',
    };
    this.submitted = false;
    this.submitting = false;
    this.error = '';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  getSessionDetailsHtml() {
    return `
      <div class="pay-play-session-detail">
        <div class="pay-play-session-detail__header">
          <h2 class="pay-play-session-detail__name">${this.session.name}</h2>
          <div class="pay-play-session-detail__meta">
            <span class="pay-play-session-detail__duration">${this.session.duration}</span>
            <span class="pay-play-session-detail__price">₹${this.session.price} / person</span>
          </div>
        </div>
        <div class="pay-play-session-detail__includes">
          <h3>Includes</h3>
          <ul>
            ${this.session.includes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  getFormHtml() {
    if (this.submitted) {
      return `
        <div class="booking-success">
          <div class="booking-success__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>Booking Request Submitted</h3>
          <p>Your booking request for <strong>${this.session.name}</strong> has been sent to our admin team for verification.</p>
          <p class="booking-success__note">You will receive a confirmation call/email within 24 hours.</p>
          <a href="/pay-play" class="btn btn--primary" style="margin-top: var(--spacing-6);">Browse Other Sessions</a>
        </div>
      `;
    }

    return `
      <form class="booking-form" id="pay-play-booking-form" novalidate>
        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Your Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_full_name">Full Name <span class="required-indicator">*</span></label>
              <input type="text" id="pp_full_name" name="full_name" value="${this.formData.full_name}" required />
              <p class="form-group__error" id="pp_full_name-error">This field is required</p>
            </div>
            <div class="form-group">
              <label for="pp_phone">Phone <span class="required-indicator">*</span></label>
              <input type="tel" id="pp_phone" name="phone" value="${this.formData.phone}" required />
              <p class="form-group__error" id="pp_phone-error">This field is required</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_email">Email <span class="required-indicator">*</span></label>
              <input type="email" id="pp_email" name="email" value="${this.formData.email}" required />
              <p class="form-group__error" id="pp_email-error">This field is required</p>
            </div>
            <div class="form-group">
              <label for="pp_city">City <span class="required-indicator">*</span></label>
              <input type="text" id="pp_city" name="city" value="${this.formData.city}" required />
              <p class="form-group__error" id="pp_city-error">This field is required</p>
            </div>
          </div>
          <div class="form-group">
            <label for="pp_experience_level">Experience Level <span class="required-indicator">*</span></label>
            <select id="pp_experience_level" name="experience_level" required>
              <option value="beginner" ${this.formData.experience_level === 'beginner' ? 'selected' : ''}>Beginner</option>
              <option value="intermediate" ${this.formData.experience_level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
              <option value="advanced" ${this.formData.experience_level === 'advanced' ? 'selected' : ''}>Advanced</option>
            </select>
          </div>
        </div>

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Preferred Schedule</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_preferred_date">Preferred Date <span class="required-indicator">*</span></label>
              <input type="date" id="pp_preferred_date" name="preferred_date" value="${this.formData.preferred_date}" required min="${new Date().toISOString().split('T')[0]}" />
              <p class="form-group__error" id="pp_preferred_date-error">Please select a date</p>
            </div>
            <div class="form-group">
              <label for="pp_preferred_time">Preferred Time <span class="required-indicator">*</span></label>
              <select id="pp_preferred_time" name="preferred_time" required>
                <option value="">Select time</option>
                <option value="09:00" ${this.formData.preferred_time === '09:00' ? 'selected' : ''}>9:00 AM</option>
                <option value="10:00" ${this.formData.preferred_time === '10:00' ? 'selected' : ''}>10:00 AM</option>
                <option value="11:00" ${this.formData.preferred_time === '11:00' ? 'selected' : ''}>11:00 AM</option>
                <option value="14:00" ${this.formData.preferred_time === '14:00' ? 'selected' : ''}>2:00 PM</option>
                <option value="15:00" ${this.formData.preferred_time === '15:00' ? 'selected' : ''}>3:00 PM</option>
                <option value="16:00" ${this.formData.preferred_time === '16:00' ? 'selected' : ''}>4:00 PM</option>
              </select>
              <p class="form-group__error" id="pp_preferred_time-error">Please select a time</p>
            </div>
          </div>
        </div>

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Additional Information</h3>
          <div class="form-group">
            <label for="pp_message">Message (Optional)</label>
            <textarea id="pp_message" name="message" rows="3" placeholder="Any special requests, group booking details, or questions...">${this.formData.message}</textarea>
          </div>
        </div>

        ${this.error ? `<div class="booking-form__error">${this.error}</div>` : ''}

        <div class="booking-form__actions">
          <a href="/pay-play" class="btn btn--secondary">Back to Sessions</a>
          <button type="submit" class="btn btn--primary btn--large" ${this.submitting ? 'disabled' : ''}>
            ${this.submitting ? '<span class="btn__spinner"></span>Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="pay-play-session-page">
        <div class="pay-play-session-page__hero">
          <a href="/pay-play" class="pay-play-session-page__back" aria-label="Back to sessions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Back to Sessions</span>
          </a>
          <div class="pay-play-session-page__badge">PAY & PLAY</div>
          <h1 class="pay-play-session-page__title">${this.session.name}</h1>
        </div>

        <div class="pay-play-session-page__content">
          <div class="pay-play-session-page__sidebar">
            ${this.getSessionDetailsHtml()}
            <div class="pay-play-session-page__price-card">
              <div class="pay-play-session-page__price-amount">₹${this.session.price}</div>
              <div class="pay-play-session-page__price-label">per person / ${this.session.duration}</div>
            </div>
          </div>

          <div class="pay-play-session-page__main">
            ${this.getFormHtml()}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const form = this.container.querySelector('#pay-play-booking-form');
    if (!form) return;

    // Form inputs
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        this.formData[e.target.name] = e.target.value;
        // Clear error on input
        const errorEl = this.container.querySelector(`#pp_${e.target.name}-error`);
        if (errorEl) {
          errorEl.textContent = '';
          e.target.classList.remove('error');
        }
      });

      input.addEventListener('blur', (e) => {
        this.validateField(e.target);
      });
    });

    // Form submit
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    if (!field.name) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    } else if (field.name === 'phone' && value && !/^[\d\s\-\+\(\)]{10,}$/.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }

    const errorEl = this.container.querySelector(`#pp_${field.name}-error`);
    if (!isValid) {
      field.classList.add('error');
      if (errorEl) errorEl.textContent = errorMessage;
    } else {
      field.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }

    return isValid;
  }

  validateForm() {
    const requiredFields = ['full_name', 'phone', 'email', 'city', 'experience_level', 'preferred_date', 'preferred_time'];
    let isValid = true;

    requiredFields.forEach(fieldName => {
      const field = this.container.querySelector(`[name="${fieldName}"]`);
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      const firstError = this.container.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.render();
    this.bindEvents();

    try {
      const config = getSupabaseConfig();
      if (!config.url || !config.anonKey) throw new Error('Supabase not configured');

      const bookingData = {
        full_name: this.formData.full_name,
        phone: this.formData.phone,
        email: this.formData.email,
        city: this.formData.city,
        experience_level: this.formData.experience_level,
        session_id: this.session.id,
        preferred_date: this.formData.preferred_date,
        preferred_time: this.formData.preferred_time,
        message: this.formData.message,
        amount: this.session.price,
        payment_status: 'pending',
        booking_status: 'pending',
      };

      const response = await fetch(`${config.url}/rest/v1/${TABLES.PAY_PLAY_BOOKINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error:', response.status, errorText);
        throw new Error('Failed to submit booking. Please try again.');
      }

      this.submitted = true;
      this.submitting = false;
      this.render();
      this.bindEvents();
    } catch (err) {
      console.error('Booking error:', err);
      this.submitting = false;
      this.error = err.message || 'An error occurred. Please try again.';
      this.render();
      this.bindEvents();
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createPayPlaySessionPage(container, options) {
  return new PayPlaySessionPage(container, options);
}