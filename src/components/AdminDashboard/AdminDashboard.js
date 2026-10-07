import { getSupabaseConfig, TABLES } from '@/lib/supabase';
import { getAdminAuthHeaders } from '@/lib/admin-auth';

const STAT_CARDS = [
  { key: 'registrations_total', label: 'Total Registrations', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, color: 'var(--color-accent-bright)' },
  { key: 'registrations_new', label: 'New Registrations', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, color: 'var(--color-gold-score)' },
  { key: 'pay_play_pending', label: 'Pending Bookings', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, color: '#f59e0b' },
  { key: 'gallery_images', label: 'Gallery Images', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, color: '#8b5cf6' },
  { key: 'coaches', label: 'Coaches', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>`, color: '#ec4899' },
  { key: 'achievements', label: 'Achievements', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>`, color: '#f97316' },
  { key: 'reviews', label: 'Reviews', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>`, color: '#06b6d4' },
  { key: 'training_ranges', label: 'Training Ranges', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>`, color: '#84cc16' },
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

      const registrations = await regRes.json().catch(() => []);
      const payPlay = await payPlayRes.json().catch(() => []);

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