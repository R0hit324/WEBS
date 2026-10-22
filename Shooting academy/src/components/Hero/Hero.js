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
      <section class="hero hero--chamber" aria-labelledby="hero-headline">
        <div class="pc-roomstage" aria-hidden="true">
          <div class="pc-stage">
            <svg class="pc-roomart" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <defs>
                <linearGradient id="pcWallG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#0e1219"/>
                  <stop offset="1" stop-color="#0a0d13"/>
                </linearGradient>
                <linearGradient id="pcCeilG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#0a0d12"/>
                  <stop offset="1" stop-color="#070910"/>
                </linearGradient>
                <linearGradient id="pcSideG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#0b0f15"/>
                  <stop offset="1" stop-color="#06080c"/>
                </linearGradient>
                <linearGradient id="pcFloorG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#0c0f15"/>
                  <stop offset="1" stop-color="#06080b"/>
                </linearGradient>
                <radialGradient id="pcLampG">
                  <stop offset="0" stop-color="rgba(244,197,66,0.5)"/>
                  <stop offset="1" stop-color="rgba(244,197,66,0)"/>
                </radialGradient>
                <radialGradient id="pcBoardHaloG">
                  <stop offset="0" stop-color="rgba(12,15,20,0.55)"/>
                  <stop offset="1" stop-color="rgba(12,15,20,0)"/>
                </radialGradient>
              </defs>

              <rect width="1000" height="700" fill="#07090c"/>

              <polygon points="0,0 1000,0 760,150 240,150" fill="url(#pcCeilG)"/>
              <g fill="rgba(244,197,66,0.13)">
                <circle cx="90" cy="88" r="4"/>
                <circle cx="300" cy="80" r="4"/>
                <circle cx="700" cy="80" r="4"/>
                <circle cx="910" cy="88" r="4"/>
              </g>
              <circle cx="560" cy="150" r="30" fill="url(#pcLampG)"/>
              <rect x="546" y="138" width="28" height="12" rx="3" fill="#171b21"/>

              <polygon points="0,0 240,150 240,640 0,700" fill="url(#pcSideG)"/>
              <polygon points="1000,0 760,150 760,640 1000,700" fill="url(#pcSideG)"/>
              <rect x="240" y="150" width="520" height="490" fill="url(#pcWallG)"/>
              <g stroke="rgba(226,232,240,0.045)" stroke-width="2">
                <line x1="330" y1="150" x2="330" y2="640"/>
                <line x1="420" y1="150" x2="420" y2="640"/>
                <line x1="560" y1="150" x2="560" y2="640"/>
                <line x1="660" y1="150" x2="660" y2="640"/>
              </g>

              <ellipse cx="560" cy="355" rx="150" ry="140" fill="url(#pcBoardHaloG)"/>
              <rect x="505" y="300" width="110" height="110" rx="6" fill="#151a21" stroke="rgba(244,197,66,0.14)" stroke-width="2"/>

              <polygon points="0,700 240,640 760,640 1000,700" fill="url(#pcFloorG)"/>
              <g stroke="rgba(244,197,66,0.07)" stroke-width="2.5">
                <line x1="240" y1="640" x2="60" y2="700"/>
                <line x1="760" y1="640" x2="940" y2="700"/>
                <line x1="500" y1="640" x2="500" y2="700"/>
              </g>
              <line x1="230" y1="668" x2="770" y2="668" stroke="rgba(226,232,240,0.05)" stroke-width="2"/>
            </svg>

            <img class="pc-roomphoto" src="/assets/precision-chamber-room.png" alt="" loading="eager" decoding="async" onerror="this.remove()"/>

            <div class="pc-ambient"></div>
            <div class="pc-targetlight"></div>
            <div class="pc-pool"></div>
            <div class="pc-beam"></div>
          </div>
        </div>
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