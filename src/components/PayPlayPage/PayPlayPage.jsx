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

export class PayPlayPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.init();
  }

  init() {
    this.render();
  }

  getSessionsHtml() {
    return sessionsData.map(s => `
      <a href="/pay-play/${s.id}" class="pay-play-session" data-session-id="${s.id}">
        <div class="pay-play-session__header">
          <span class="pay-play-session__name">${s.name}</span>
          <span class="pay-play-session__duration">${s.duration}</span>
        </div>
        <div class="pay-play-session__price">
          ₹${s.price}
          <span class="pay-play-session__price-currency">per person</span>
        </div>
        <p class="pay-play-session__description">
          ${s.includes.join(', ')}
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