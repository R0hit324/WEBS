import { getSupabaseConfig, TABLES } from '@/lib/supabase';
import { getAdminAuthHeaders } from '@/lib/admin-auth';

const STAT_CARDS = [
  { key: 'registrations_total', label: 'Total Registrations', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`, color: 'var(--color-accent-bright)' },
  { key: 'registrations_new', label: 'New Registrations', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`, color: 'var(--color-gold-score)' },
  { key: 'coaches', label: 'Coaches', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, color: '#ec4899' },
  { key: 'pay_play_pending', label: 'Pending Bookings', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, color: '#f59e0b' },
  { key: 'gallery_images', label: 'Gallery Images', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, color: '#8b5cf6' },
  { key: 'achievements', label: 'Achievements', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`, color: '#f97316' },
  { key: 'reviews', label: 'Reviews', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, color: '#06b6d4' },
  { key: 'training_ranges', label: 'Training Ranges', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`, color: '#84cc16' },
];

export class AdminDashboard {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.stats = {};
    this.recentActivity = [];
    this.init();
  }

  async init() {
    this.renderLoading();
    await this.fetchStats();
    await this.fetchRecentActivity();
    this.render();
  }

  async fetchStats() {
    const headers = await getAdminAuthHeaders();
    if (!headers) return;

    const config = getSupabaseConfig();
    if (!config.url) return;

    try {
      const [
        registrationsRes,
        registrationsNewRes,
        payPlayRes,
        galleryRes,
        coachesRes,
        achievementsRes,
        reviewsRes,
        trainingRes,
      ] = await Promise.all([
        fetch(`${config.url}/rest/v1/${TABLES.REGISTRATIONS}?select=id&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.REGISTRATIONS}?select=id&status=eq.new&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.PAY_PLAY_BOOKINGS}?select=id&booking_status=eq.pending&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.GALLERY_IMAGES}?select=id&is_visible=eq.true&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.COACHES}?select=id&is_visible=eq.true&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.ACHIEVEMENTS}?select=id&is_visible=eq.true&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.REVIEWS}?select=id&is_visible=eq.true&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
        fetch(`${config.url}/rest/v1/${TABLES.TRAINING_RANGES}?select=id&is_visible=eq.true&limit=1`, { headers: { ...headers, Prefer: 'count=exact' } }),
      ]);

      this.stats = {
        registrations_total: parseInt(registrationsRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        registrations_new: parseInt(registrationsNewRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        pay_play_pending: parseInt(payPlayRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        gallery_images: parseInt(galleryRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        coaches: parseInt(coachesRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        achievements: parseInt(achievementsRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        reviews: parseInt(reviewsRes.headers.get('content-range')?.split('/')[1] || '0', 10),
        training_ranges: parseInt(trainingRes.headers.get('content-range')?.split('/')[1] || '0', 10),
      };
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async fetchRecentActivity() {
    const headers = await getAdminAuthHeaders();
    if (!headers) return;

    const config = getSupabaseConfig();
    if (!config.url) return;

    try {
      const [regRes, payPlayRes] = await Promise.all([
        fetch(`${config.url}/rest/v1/${TABLES.REGISTRATIONS}?select=full_name,email,created_at&order=created_at.desc&limit=5`, { headers }),
        fetch(`${config.url}/rest/v1/${TABLES.PAY_PLAY_BOOKINGS}?select=full_name,email,session_id,created_at&order=created_at.desc&limit=5`, { headers }),
      ]);

      const registrationsRaw = await regRes.json().catch(() => []);
      const payPlayRaw = await payPlayRes.json().catch(() => []);

      const registrations = Array.isArray(registrationsRaw) ? registrationsRaw : [];
      const payPlay = Array.isArray(payPlayRaw) ? payPlayRaw : [];

      this.recentActivity = [
        ...registrations.map(r => ({ type: 'registration', label: 'New Registration', name: r.full_name, email: r.email, time: r.created_at })),
        ...payPlay.map(p => ({ type: 'pay_play', label: 'Booking Request', name: p.full_name, email: p.email, time: p.created_at })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="admin-dashboard">
        <div class="admin-dashboard__header">
          <h2 class="admin-dashboard__title">Dashboard</h2>
          <p class="admin-dashboard__subtitle">Overview of academy metrics</p>
        </div>
        <div class="admin-dashboard__stats">
          ${STAT_CARDS.map(() => `
            <div class="admin-stat-card admin-stat-card--loading">
              <div class="admin-stat-card__skeleton"></div>
              <div class="admin-stat-card__skeleton"></div>
              <div class="admin-stat-card__skeleton"></div>
            </div>
          `).join('')}
        </div>
        <div class="admin-dashboard__activity admin-activity--loading">
          <div class="admin-activity__skeleton"></div>
          <div class="admin-activity__skeleton"></div>
          <div class="admin-activity__skeleton"></div>
        </div>
      </div>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="admin-dashboard">
        <div class="admin-dashboard__header">
          <h2 class="admin-dashboard__title">Dashboard</h2>
          <p class="admin-dashboard__subtitle">Overview of academy metrics</p>
        </div>

        <div class="admin-dashboard__stats">
          ${STAT_CARDS.map(card => {
            const value = this.stats[card.key] || 0;
            return `
              <div class="admin-stat-card" style="--stat-color: ${card.color};">
                <div class="admin-stat-card__icon" aria-hidden="true">
                  ${card.icon}
                </div>
                <div class="admin-stat-card__content">
                  <div class="admin-stat-card__value">${this.formatNumber(value)}</div>
                  <div class="admin-stat-card__label">${card.label}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="admin-dashboard__activity">
          <h3 class="admin-dashboard__section-title">Recent Activity</h3>
          ${this.recentActivity.length > 0 ? `
            <div class="admin-activity__list">
              ${this.recentActivity.map(item => `
                <div class="admin-activity__item">
                  <div class="admin-activity__icon admin-activity__icon--${item.type}">
                    ${item.type === 'registration' ?
                      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` :
                      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
                    }
                  </div>
                  <div class="admin-activity__content">
                    <div class="admin-activity__label">${item.label}</div>
                    <div class="admin-activity__details">${item.name} &middot; ${item.email}</div>
                  </div>
                  <time class="admin-activity__time" datetime="${item.time}">${this.formatRelativeTime(item.time)}</time>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="admin-activity__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p>No recent activity</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createAdminDashboard(container, options) {
  return new AdminDashboard(container, options);
}