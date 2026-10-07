const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/training', label: 'Training' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' }
];

const NAV_CTAS = [
  { label: 'Pay & Play', variant: 'secondary', href: '/pay-play' },
  { label: 'Register Now', variant: 'primary', href: '/register' }
];

export class Navbar {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      currentPath: options.currentPath || '/',
      ...options
    };
    this.isScrolled = false;
    this.isMobileOpen = false;
    this.init();
  }

  init() {
    this.render();
    this.bindElements();
    this.bindEvents();
    this.setActiveLink(this.options.currentPath);
  }

  render() {
    const brandHtml = `
      <a href="/" class="navbar__brand" aria-label="Matsya Shooting Sports Academy - Home">
        <img src="/assets/shooting-logo.jpeg" alt="" class="navbar__logo" loading="lazy">
        <div class="navbar__brand-text">
          <span class="navbar__brand-name">MATSYA</span>
          <span class="navbar__brand-tagline">SHOOTING SPORTS ACADEMY</span>
        </div>
      </a>
    `;

    const navLinksHtml = NAV_LINKS.map(link => `
      <li>
        <a href="${link.href}" class="navbar__link">${link.label}</a>
      </li>
    `).join('');

    const ctaHtml = NAV_CTAS.map(cta => `
      <a href="${cta.href}" class="btn btn--${cta.variant} navbar__btn">${cta.label}</a>
    `).join('');

    this.container.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="container navbar__container">
          ${brandHtml}
          <ul class="navbar__nav" id="navbar-nav">
            ${navLinksHtml}
            <li class="navbar__actions">${ctaHtml}</li>
          </ul>
          <button class="navbar__mobile-toggle" aria-expanded="false" aria-controls="navbar-nav" aria-label="Toggle navigation menu">
            <span class="navbar__mobile-toggle-icon" aria-hidden="true"></span>
          </button>
        </div>
      </nav>
    `;
  }

  bindElements() {
    this.navbarEl = this.container.querySelector('.navbar');
    this.navEl = this.container.querySelector('.navbar__nav');
    this.toggleBtn = this.container.querySelector('.navbar__mobile-toggle');
    this.navLinks = this.container.querySelectorAll('.navbar__link');
  }

  bindEvents() {
    this.handleScroll = this.handleScroll.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleNavLinkClick = this.handleNavLinkClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleResize = this.handleResize.bind(this);

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.toggleBtn.addEventListener('click', this.handleToggleClick);
    this.navLinks.forEach(link => link.addEventListener('click', this.handleNavLinkClick));
    document.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('resize', this.handleResize);
  }

  handleScroll() {
    const scrolled = window.scrollY > 20;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      this.navbarEl.classList.toggle('navbar--scrolled', scrolled);
    }
  }

  handleToggleClick() {
    this.isMobileOpen = !this.isMobileOpen;
    this.navEl.classList.toggle('navbar__nav--open', this.isMobileOpen);
    this.toggleBtn.setAttribute('aria-expanded', this.isMobileOpen);
    document.body.style.overflow = this.isMobileOpen ? 'hidden' : '';
  }

  handleNavLinkClick() {
    if (this.isMobileOpen) {
      this.closeMobileMenu();
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.isMobileOpen) {
      this.closeMobileMenu();
      this.toggleBtn.focus();
    }
  }

  handleResize() {
    if (window.innerWidth > 768 && this.isMobileOpen) {
      this.closeMobileMenu();
    }
  }

  closeMobileMenu() {
    this.isMobileOpen = false;
    this.navEl.classList.remove('navbar__nav--open');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  setActiveLink(href) {
    this.navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === href;
      link.classList.toggle('navbar__link--active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  updateCurrentPath(path) {
    this.options.currentPath = path;
    this.setActiveLink(path);
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.toggleBtn.removeEventListener('click', this.handleToggleClick);
    this.navLinks.forEach(link => link.removeEventListener('click', this.handleNavLinkClick));
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('resize', this.handleResize);
    this.container.innerHTML = '';
  }
}

export function createNavbar(container, options) {
  return new Navbar(container, options);
}