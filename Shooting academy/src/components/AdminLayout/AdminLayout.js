import { getAdminSession, adminLogout } from '@/lib/admin-auth';

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>` },
  { key: 'facilities', label: 'Facilities', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { key: 'registrations', label: 'Registrations', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>` },
  { key: 'gallery', label: 'Gallery', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
  { key: 'reviews', label: 'Reviews', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { key: 'achievements', label: 'Achievements', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { key: 'training', label: 'Training', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { key: 'pay_play', label: 'Pay & Play', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/><circle cx="12" cy="12" r="3"/></svg>` },
];

export class AdminLayout {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...options };
    this.currentSection = options.initialSection || 'dashboard';
    this.isSidebarOpen = false;
    this.adminUser = null;
    this.render();
    this.bindEvents();
    this.loadSession();
  }

  async loadSession() {
    const session = await getAdminSession();
    if (session) {
      this.adminUser = session.user;
      this.updateUserDisplay();
    }
  }

  updateUserDisplay() {
    const avatarEl = this.container.querySelector('.admin-header__user-avatar');
    const nameEl = this.container.querySelector('.admin-header__user-name');
    const roleEl = this.container.querySelector('.admin-header__user-role');

    if (avatarEl) {
      avatarEl.textContent = this.adminUser?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || this.adminUser?.email?.charAt(0)?.toUpperCase() || 'A';
    }
    if (nameEl) {
      nameEl.textContent = this.adminUser?.user_metadata?.full_name || this.adminUser?.email || 'Administrator';
    }
    if (roleEl) {
      roleEl.textContent = this.adminUser?.user_metadata?.role || 'Admin';
    }
  }

  setSection(sectionKey) {
    this.currentSection = sectionKey;
    this.closeSidebar();
    this.updateActiveNav();
    if (this.options.onSectionChange) {
      this.options.onSectionChange(sectionKey);
    }
  }

  getMenuHtml() {
    return MENU_ITEMS.map(item => `
      <button
        class="admin-sidebar__item ${this.currentSection === item.key ? 'admin-sidebar__item--active' : ''}"
        data-section="${item.key}"
        aria-current="${this.currentSection === item.key ? 'page' : 'false'}"
      >
        <span class="admin-sidebar__icon">${item.icon}</span>
        <span class="admin-sidebar__label">${item.label}</span>
      </button>
    `).join('');
  }

  render() {
    this.container.innerHTML = `
      <div class="admin-layout">
        <aside class="admin-sidebar" role="navigation" aria-label="Admin navigation">
          <div class="admin-sidebar__header">
            <div class="admin-sidebar__logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span class="admin-sidebar__brand">Matsya Admin</span>
            </div>
            <button class="admin-sidebar__toggle" aria-label="Toggle sidebar" aria-expanded="false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

          <nav class="admin-sidebar__nav">
            ${this.getMenuHtml()}
          </nav>

          <div class="admin-sidebar__footer">
            <div class="admin-sidebar__divider"></div>
            <button class="admin-sidebar__logout" data-action="logout">
              <span class="admin-sidebar__logout-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              <span class="admin-sidebar__logout-label">Logout</span>
            </button>
          </div>
        </aside>

        <div class="admin-sidebar__overlay" aria-hidden="true"></div>

        <div class="admin-main">
          <header class="admin-header">
            <div class="admin-header__left">
              <h1 class="admin-header__title" id="admin-section-title">Dashboard</h1>
            </div>
            <div class="admin-header__right">
              <div class="admin-header__user">
                <div class="admin-header__user-avatar" aria-hidden="true">
                  ${this.adminUser?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || this.adminUser?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div class="admin-header__user-info">
                  <span class="admin-header__user-name">${this.adminUser?.user_metadata?.full_name || this.adminUser?.email || 'Administrator'}</span>
                  <span class="admin-header__user-role">${this.adminUser?.user_metadata?.role || 'Admin'}</span>
                </div>
              </div>
              <button class="admin-header__menu-toggle" aria-label="Open menu" aria-expanded="false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </header>

          <main class="admin-content" id="admin-content" role="main">
          </main>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.admin-sidebar__item').forEach(item => {
      item.addEventListener('click', () => {
        this.setSection(item.dataset.section);
      });
    });

    this.container.querySelector('.admin-sidebar__logout')?.addEventListener('click', async () => {
      await adminLogout();
      window.location.href = '/admin/login';
    });

    this.container.querySelector('.admin-sidebar__toggle')?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    this.container.querySelector('.admin-sidebar__overlay')?.addEventListener('click', () => {
      this.closeSidebar();
    });

    this.container.querySelector('.admin-header__menu-toggle')?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    this.handleKeydown = (e) => {
      if (e.key === 'Escape' && this.isSidebarOpen) {
        this.closeSidebar();
        this.container.querySelector('.admin-header__menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', this.handleKeydown);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.container.querySelector('.admin-sidebar')?.classList.toggle('admin-sidebar--open', this.isSidebarOpen);
    this.container.querySelector('.admin-sidebar__overlay')?.classList.toggle('admin-sidebar__overlay--visible', this.isSidebarOpen);
    document.body.classList.toggle('admin-drawer-open', this.isSidebarOpen);
    const toggleBtn = this.container.querySelector('.admin-sidebar__toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', this.isSidebarOpen.toString());
    const headerToggle = this.container.querySelector('.admin-header__menu-toggle');
    if (headerToggle) headerToggle.setAttribute('aria-expanded', this.isSidebarOpen.toString());
  }

  closeSidebar() {
    if (!this.isSidebarOpen) return;
    this.isSidebarOpen = false;
    this.container.querySelector('.admin-sidebar')?.classList.remove('admin-sidebar--open');
    this.container.querySelector('.admin-sidebar__overlay')?.classList.remove('admin-sidebar__overlay--visible');
    document.body.classList.remove('admin-drawer-open');
    const toggleBtn = this.container.querySelector('.admin-sidebar__toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    const headerToggle = this.container.querySelector('.admin-header__menu-toggle');
    if (headerToggle) headerToggle.setAttribute('aria-expanded', 'false');
  }

  updateActiveNav() {
    this.container.querySelectorAll('.admin-sidebar__item').forEach(item => {
      const isActive = item.dataset.section === this.currentSection;
      item.classList.toggle('admin-sidebar__item--active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    const titles = {
      dashboard: 'Dashboard',
      training: 'Training Management',
      pay_play: 'Pay & Play Management',
      facilities: 'Facility Management',
      achievements: 'Achievements Management',
      gallery: 'Gallery Management',
      reviews: 'Review Management',
      registrations: 'Registrations',
    };

    const titleEl = this.container.querySelector('#admin-section-title');
    if (titleEl) {
      titleEl.textContent = titles[this.currentSection] || 'Dashboard';
    }
  }

  destroy() {
    if (this.handleKeydown) {
      document.removeEventListener('keydown', this.handleKeydown);
      this.handleKeydown = null;
    }
    document.body.classList.remove('admin-drawer-open');
    this.container.innerHTML = '';
  }
}

export function createAdminLayout(container, options) {
  return new AdminLayout(container, options);
}
