import './main.css';
import { createNavbar } from './components/Navbar/index.js';
import { createHero } from './components/Hero/index.js';
import { createHighlights } from './components/Highlights/index.js';
import { createAboutPreview } from './components/AboutPreview/index.js';
import { createTrainingPreview } from './components/TrainingPreview/index.js';
import { createCoachesPreview } from './components/CoachesPreview/index.js';
import { createAchievementsPreview } from './components/AchievementsPreview/index.js';
import { createFacilitiesPreview } from './components/FacilitiesPreview/index.js';
import { createGalleryPreview } from './components/GalleryPreview/index.js';
import { createReviews } from './components/Reviews/index.js';
import { createMotivational } from './components/Motivational/index.js';
import { createFinalCTA } from './components/FinalCTA/index.js';
import { createFooter } from './components/Footer/index.js';
import { createAboutPage } from './components/AboutPage/index.js';
import { createTrainingPage } from './components/TrainingPage/index.js';
import { createCoachesPage } from './components/CoachesPage/index.js';
import { createFacilitiesPage } from './components/FacilitiesPage/index.js';
import { createAchievementsPage } from './components/AchievementsPage/index.js';
import { createGalleryPage } from './components/GalleryPage/index.js';
import { createReviewsPage } from './components/ReviewsPage/index.js';
import { createContactPage } from './components/ContactPage/index.js';
import { createRegistrationPage } from './components/RegistrationPage/index.js';
import { createPayPlayPage, createPayPlaySessionPage } from './components/PayPlayPage/index.js';
import { createAdminLoginPage } from './components/AdminLoginPage/index.js';
import { createAdminLayout } from './components/AdminLayout/index.js';
import { createAdminDashboard } from './components/AdminDashboard/index.js';
import { router } from './router/index.js';

const app = document.getElementById('app');

let navbarInstance = null;
let currentPageInstance = null;
let adminLayoutInstance = null;

function init() {
  const path = window.location.pathname;
  const isAdminRoute = path.startsWith('/admin');

  if (isAdminRoute) {
    app.innerHTML = `
      <main id="main-content" role="main"></main>
    `;
  } else {
    app.innerHTML = `
      <header id="navbar-container"></header>
      <main id="main-content" role="main"></main>
      <footer id="footer-container"></footer>
    `;
  }

  const mainContent = document.getElementById('main-content');

  if (!isAdminRoute) {
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');

    navbarInstance = createNavbar(navbarContainer, { currentPath: window.location.pathname });
    createFooter(footerContainer);
  } else {
    navbarInstance = null;
  }

  setupRoutes(mainContent);
  router.handleRouteChange();
}

function setupRoutes(mainContent) {
  // Public routes
  router.on('/', () => renderHome(mainContent));
  router.on('/about', () => renderAbout(mainContent));
  router.on('/training', () => renderTraining(mainContent));
  router.on('/coaches', () => renderCoaches(mainContent));
  router.on('/facilities', () => renderFacilities(mainContent));
  router.on('/achievements', () => renderAchievements(mainContent));
  router.on('/gallery', () => renderGallery(mainContent));
  router.on('/reviews', () => renderReviews(mainContent));
  router.on('/contact', () => renderContact(mainContent));
  router.on('/register', () => renderRegistration(mainContent));
  router.on('/pay-play', () => renderPayPlay(mainContent));
  // Dynamic route for session detail pages
  router.on('/pay-play/', (path) => {
    const sessionId = path.split('/pay-play/')[1];
    if (sessionId) {
      renderPayPlaySession(mainContent, sessionId);
    } else {
      renderPayPlay(mainContent);
    }
  });

  // Admin routes
  router.on('/admin/login', () => renderAdminLogin(mainContent));
  router.on('/admin/', async () => await renderAdminDashboard(mainContent));
  router.on('/admin/dashboard', async () => await renderAdminDashboard(mainContent));

  router.on('*', () => renderNotFound(mainContent));
}

function clearMainContent(mainContent) {
  if (currentPageInstance && typeof currentPageInstance.destroy === 'function') {
    currentPageInstance.destroy();
  }
  if (adminLayoutInstance && typeof adminLayoutInstance.destroy === 'function') {
    adminLayoutInstance.destroy();
    adminLayoutInstance = null;
  }
  mainContent.innerHTML = '';
  currentPageInstance = null;
}

function renderHome(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/');

  const heroContainer = document.createElement('div');
  mainContent.appendChild(heroContainer);
  createHero(heroContainer);

  const highlightsContainer = document.createElement('div');
  mainContent.appendChild(highlightsContainer);
  createHighlights(highlightsContainer);

  const aboutContainer = document.createElement('div');
  aboutContainer.id = 'about';
  mainContent.appendChild(aboutContainer);
  createAboutPreview(aboutContainer);

  const trainingContainer = document.createElement('div');
  trainingContainer.id = 'training';
  mainContent.appendChild(trainingContainer);
  createTrainingPreview(trainingContainer);

  const coachesContainer = document.createElement('div');
  coachesContainer.id = 'coaches';
  mainContent.appendChild(coachesContainer);
  createCoachesPreview(coachesContainer);

  const achievementsContainer = document.createElement('div');
  achievementsContainer.id = 'achievements';
  mainContent.appendChild(achievementsContainer);
  createAchievementsPreview(achievementsContainer);

  const facilitiesContainer = document.createElement('div');
  facilitiesContainer.id = 'facilities';
  mainContent.appendChild(facilitiesContainer);
  createFacilitiesPreview(facilitiesContainer);

  const galleryContainer = document.createElement('div');
  galleryContainer.id = 'gallery';
  mainContent.appendChild(galleryContainer);
  createGalleryPreview(galleryContainer);

  const reviewsContainer = document.createElement('div');
  reviewsContainer.id = 'reviews';
  mainContent.appendChild(reviewsContainer);
  createReviews(reviewsContainer);

  const motivationalContainer = document.createElement('div');
  mainContent.appendChild(motivationalContainer);
  createMotivational(motivationalContainer);

  const finalCtaContainer = document.createElement('div');
  mainContent.appendChild(finalCtaContainer);
  createFinalCTA(finalCtaContainer);
}

function renderAbout(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/about');

  const aboutContainer = document.createElement('div');
  mainContent.appendChild(aboutContainer);
  currentPageInstance = createAboutPage(aboutContainer);
}

function renderTraining(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/training');

  const trainingContainer = document.createElement('div');
  mainContent.appendChild(trainingContainer);
  currentPageInstance = createTrainingPage(trainingContainer);
}

function renderCoaches(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/coaches');

  const coachesContainer = document.createElement('div');
  mainContent.appendChild(coachesContainer);
  currentPageInstance = createCoachesPage(coachesContainer);
}

function renderFacilities(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/facilities');

  const facilitiesContainer = document.createElement('div');
  mainContent.appendChild(facilitiesContainer);
  currentPageInstance = createFacilitiesPage(facilitiesContainer);
}

function renderAchievements(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/achievements');

  const achievementsContainer = document.createElement('div');
  mainContent.appendChild(achievementsContainer);
  currentPageInstance = createAchievementsPage(achievementsContainer);
}

function renderGallery(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/gallery');

  const galleryContainer = document.createElement('div');
  mainContent.appendChild(galleryContainer);
  currentPageInstance = createGalleryPage(galleryContainer);
}

function renderReviews(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/reviews');

  const reviewsContainer = document.createElement('div');
  mainContent.appendChild(reviewsContainer);
  currentPageInstance = createReviewsPage(reviewsContainer);
}

function renderContact(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/contact');

  const contactContainer = document.createElement('div');
  mainContent.appendChild(contactContainer);
  currentPageInstance = createContactPage(contactContainer);
}

function renderRegistration(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/register');

  const registrationContainer = document.createElement('div');
  mainContent.appendChild(registrationContainer);
  currentPageInstance = createRegistrationPage(registrationContainer);
}

function renderPayPlay(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath('/pay-play');

  const payPlayContainer = document.createElement('div');
  mainContent.appendChild(payPlayContainer);
  currentPageInstance = createPayPlayPage(payPlayContainer);
}

function renderPayPlaySession(mainContent, sessionId) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath(`/pay-play/${sessionId}`);

  const sessionContainer = document.createElement('div');
  mainContent.appendChild(sessionContainer);
  currentPageInstance = createPayPlaySessionPage(sessionContainer, { sessionId });
}

// Admin render functions
function renderAdminLogin(mainContent) {
  clearMainContent(mainContent);
  if (adminLayoutInstance) {
    adminLayoutInstance.destroy();
    adminLayoutInstance = null;
  }

  const loginContainer = document.createElement('div');
  mainContent.appendChild(loginContainer);
  currentPageInstance = createAdminLoginPage(loginContainer);
}

async function renderAdminDashboard(mainContent) {
  const { isAdminAuthenticated } = require('./lib/admin-auth');
  if (!(await isAdminAuthenticated())) {
    window.location.href = '/admin/login';
    return;
  }

  clearMainContent(mainContent);

  const adminContainer = document.createElement('div');
  mainContent.appendChild(adminContainer);

  adminLayoutInstance = createAdminLayout(adminContainer, {
    initialSection: 'dashboard',
    onSectionChange: (section) => {
      renderAdminSection(mainContent, section);
    },
  });

  const contentContainer = adminContainer.querySelector('#admin-content');
  if (contentContainer) {
    currentPageInstance = createAdminDashboard(contentContainer);
  }
}

async function renderAdminSection(mainContent, section) {
  const { isAdminAuthenticated } = require('./lib/admin-auth');
  if (!(await isAdminAuthenticated())) {
    window.location.href = '/admin/login';
    return;
  }

  if (!adminLayoutInstance) return;

  const contentContainer = adminLayoutInstance.container.querySelector('#admin-content');
  if (!contentContainer) return;

  if (currentPageInstance && typeof currentPageInstance.destroy === 'function') {
    currentPageInstance.destroy();
  }

  // Clear and let the layout handle section rendering
  contentContainer.innerHTML = '';

  // Dynamic import for admin modules
  import(`./components/Admin${section.charAt(0).toUpperCase() + section.slice(1)}/index.js`)
    .then(module => {
      const createFn = module[`createAdmin${section.charAt(0).toUpperCase() + section.slice(1)}`];
      if (createFn) {
        currentPageInstance = createFn(contentContainer);
      }
    })
    .catch(() => {
      contentContainer.innerHTML = `
        <div class="admin-coming-soon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h3>${section.charAt(0).toUpperCase() + section.slice(1)} Management</h3>
          <p>Coming soon...</p>
        </div>
      `;
    });
}

function renderNotFound(mainContent) {
  clearMainContent(mainContent);
  navbarInstance.updateCurrentPath(window.location.pathname);

  mainContent.innerHTML = `
    <section class="not-found" style="padding: var(--spacing-20) 0; text-align: center;">
      <div class="container">
        <h1 style="font-family: var(--font-family-display); font-size: var(--font-size-5xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin-bottom: var(--spacing-4);">404</h1>
        <p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); margin-bottom: var(--spacing-8);">Page Not Found</p>
        <a href="/" class="btn btn--primary btn--large">Return Home</a>
      </div>
    </section>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}