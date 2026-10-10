import { getSupabaseConfig, TABLES } from '@/lib/supabase';

export class PayPlayPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.sessions = [];
    this.init();
  }

  async init() {
    await this.fetchSessions();
    this.render();
  }

  async fetchSessions() {
    const config = getSupabaseConfig();
    if (!config.url) {
      console.warn('Supabase not configured, using fallback data');
      this.sessions = [];
      return;
    }

    try {
      const response = await fetch(`${config.url}/rest/v1/${TABLES.PAY_PLAY_OPTIONS}?select=*&is_visible=eq.true&availability_status=eq.available&order=display_order`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
        },
      });

      if (response.ok) {
        this.sessions = await response.json();
      } else {
        console.error('Failed to fetch sessions:', response.status);
        this.sessions = [];
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      this.sessions = [];
    }
  }

  getSessionsHtml() {
    if (this.sessions.length === 0) {
      return `
        <div class="pay-play-page__no-sessions">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3>No Sessions Available</h3>
          <p>Pay & Play sessions will appear here once added by the admin.</p>
        </div>
      `;
    }

    return this.sessions.map(s => `
      <a href="/pay-play/${s.id}" class="pay-play-session" data-session-id="${s.id}">
        <div class="pay-play-session__header">
          <span class="pay-play-session__name">${s.name}</span>
          <span class="pay-play-session__duration">${s.duration_minutes ? `${s.duration_minutes} min` : '-'}</span>
        </div>
        <div class="pay-play-session__price">
          ₹${s.price_amount}
          <span class="pay-play-session__price-currency">per person</span>
        </div>
        <p class="pay-play-session__description">
          ${s.description || ''}
          ${s.includes && s.includes.length > 0 ? `<br>Includes: ${s.includes.join(', ')}` : ''}
          ${s.start_time && s.end_time ? `<br>Time: ${s.start_time} - ${s.end_time}` : ''}
        </p>
      </a>
    `).join('');
  }

  render() {
    this.container.innerHTML = `
      <div class="pay-play-page">
        <div class="pay-play-page__hero">
          <div class="pay-play-page__hero-badge">
            <span>PAY & PLAY</span>
            <span>Book Your Session</span>
          </div>
          <h1 class="pay-play-page__title">
            <span class="pay-play-page__title-accent">Pay & Play</span>
            Shooting Experience
          </h1>
          <p class="pay-play-page__description">
            Choose a session below to view details and book your range time.
            All bookings are subject to admin verification.
          </p>
        </div>
        <div class="pay-play-page__sessions">
          ${this.getSessionsHtml()}
        </div>
      </div>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createPayPlayPage(container, options) {
  return new PayPlayPage(container, options);
}