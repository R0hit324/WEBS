import { createShootingTarget } from '../ShootingTarget/index.js';

export class Hero {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.shootingTarget = null;
    this.init();
  }

  init() {
    this.render();
    this.bindElements();
    this.initShootingTarget();
  }

  render() {
    this.container.innerHTML = `
      <section class="hero" aria-labelledby="hero-headline">
        <div class="container hero__container">
          <div class="hero__content">
            <div class="hero__badge badge" aria-label="Location">
              <span>ALWAR</span>
              <span class="hero__badge-divider" aria-hidden="true"></span>
              <span>RAJASTHAN</span>
            </div>
            <h1 id="hero-headline" class="hero__headline">
              Precision.<br>
              Discipline.<br>
              <span class="hero__headline-accent">Excellence.</span>
            </h1>
            <p class="hero__description">
              A professional shooting sports academy focused on developing precision, discipline, confidence and performance.
            </p>
            <div class="hero__actions" role="group" aria-label="Primary actions">
              <button class="btn btn--primary btn--large" data-action="register">
                Register Now
              </button>
              <button class="btn btn--secondary btn--large" data-action="explore">
                Explore Academy
              </button>
            </div>
          </div>
          <div class="hero__visual" aria-hidden="true">
            <div class="hero__target-wrapper">
              <div class="hero__target-float" id="shooting-target"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindElements() {
    this.targetContainer = this.container.querySelector('#shooting-target');
    this.registerBtn = this.container.querySelector('[data-action="register"]');
    this.exploreBtn = this.container.querySelector('[data-action="explore"]');

    this.registerBtn.addEventListener('click', () => this.handleAction('register'));
    this.exploreBtn.addEventListener('click', () => this.handleAction('explore'));
  }

  initShootingTarget() {
    if (this.targetContainer) {
      this.shootingTarget = createShootingTarget(this.targetContainer, {
        intervalMin: 2500,
        intervalMax: 4000,
        displayDuration: 1200
      });
    }
  }

  handleAction(action) {
    const event = new CustomEvent('hero:action', {
      detail: { action },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  destroy() {
    if (this.shootingTarget) {
      this.shootingTarget.destroy();
      this.shootingTarget = null;
    }
    this.container.innerHTML = '';
  }
}

export function createHero(container, options) {
  return new Hero(container, options);
}