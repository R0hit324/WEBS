import { isAdminAuthenticated, getAdminSession, requireAdminAuth } from '@/lib/admin-auth';
import { router } from '@/router';

export class AdminAuthGuard {
  constructor(options = {}) {
    this.options = {
      redirectTo: '/admin/login',
      ...options,
    };
  }

  async canActivate(): Promise<boolean> {
    return await isAdminAuthenticated();
  }

  async requireAuth(): Promise<ReturnType<typeof requireAdminAuth>> {
    return await requireAdminAuth();
  }

  redirectToLogin() {
    window.location.href = this.options.redirectTo;
  }

  initRouteProtection() {
    const checkAuth = async () => {
      if (!(await this.canActivate())) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin/login')) {
          this.redirectToLogin();
        }
      }
    };

    checkAuth();

    window.addEventListener('popstate', checkAuth);

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/admin"]');
      if (link && !link.hasAttribute('target')) {
        checkAuth().then(canActivate => {
          if (!canActivate) {
            e.preventDefault();
            this.redirectToLogin();
          }
        });
      }
    });

    return () => {
      window.removeEventListener('popstate', checkAuth);
    };
  }
}

export function createAdminAuthGuard(options) {
  return new AdminAuthGuard(options);
}

export function requireAdminAuthOrRedirect(redirectTo = '/admin/login') {
  if (!isAdminAuthenticated()) {
    window.location.href = redirectTo;
    return null;
  }
  return requireAdminAuth();
}