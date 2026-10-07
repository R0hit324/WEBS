export const routes = {
  home: '/',
  about: '/about',
  training: '/training',
  achievements: '/achievements',
  facilities: '/facilities',
  coaches: '/coaches',
  gallery: '/gallery',
  contact: '/contact',
  register: '/register',
  'pay-play': '/pay-play'
};

export class Router {
  constructor() {
    this.currentRoute = null;
    this.handlers = new Map();
    this.init();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRouteChange());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link && !link.hasAttribute('target')) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
    this.handleRouteChange();
  }

  navigate(path) {
    if (path === this.currentRoute) return;
    window.history.pushState({}, '', path);
    this.handleRouteChange();
  }

  handleRouteChange() {
    const path = window.location.pathname;
    this.currentRoute = path;
    const handler = this.handlers.get(path) || this.handlers.get('*');
    if (handler) {
      handler(path);
    }
  }

  on(path, handler) {
    this.handlers.set(path, handler);
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

export const router = new Router();