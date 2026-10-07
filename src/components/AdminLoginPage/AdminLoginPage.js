import { adminLogin, adminLogout, getAdminSession } from '@/lib/admin-auth';

const LOGIN_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;

export class AdminLoginPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.isLoading = false;
    this.error = '';
    this.init();
  }

  init() {
    const existingSession = getAdminSession();
    if (existingSession) {
      window.location.href = '/admin/';
      return;
    }
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <section class="admin-login-page" aria-labelledby="admin-login-title">
        <div class="admin-login-page__container">
          <div class="admin-login-page__card">
            <div class="admin-login-page__header">
              <div class="admin-login-page__logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h1 id="admin-login-title" class="admin-login-page__title">Admin Login</h1>
              <p class="admin-login-page__subtitle">Matsya Shooting Sports Academy</p>
            </div>

            ${this.error ? `
              <div class="admin-login-page__error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>${this.error}</span>
              </div>
            ` : ''}

            <form class="admin-login-page__form" id="admin-login-form" novalidate>
              <div class="form-group">
                <label for="admin-email">Email</label>
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  autocomplete="email"
                  placeholder="admin@matsyaacademy.com"
                  required
                  ${this.isLoading ? 'disabled' : ''}
                />
              </div>

              <div class="form-group">
                <label for="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                  ${this.isLoading ? 'disabled' : ''}
                />
              </div>

              <button type="submit" class="btn btn--primary btn--large admin-login-page__submit" ${this.isLoading ? 'disabled' : ''}>
                ${this.isLoading ? `
                  <svg class="btn__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  <span>Signing in...</span>
                ` : `
                  ${LOGIN_ICON}
                  <span>Sign In</span>
                `}
              </button>
            </form>

            <div class="admin-login-page__footer">
              <p>Only authorized administrators can access this panel.</p>
              <a href="/" class="admin-login-page__back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Website
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    const form = this.container.querySelector('#admin-login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.error = '';

    const formData = new FormData(e.target);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      this.error = 'Please enter both email and password';
      this.render();
      this.bindEvents();
      return;
    }

    this.isLoading = true;
    this.render();
    this.bindEvents();

    try {
      await adminLogin(email, password);
      window.location.href = '/admin/';
    } catch (err) {
      this.isLoading = false;
      this.error = err.message || 'Login failed. Please check your credentials.';
      this.render();
      this.bindEvents();
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAdminLoginPage(container, options) {
  return new AdminLoginPage(container, options);
}