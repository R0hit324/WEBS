import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class RotatingTarget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      rotationSpeed: options.rotationSpeed ?? 0.4,
      ringCount: options.ringCount ?? 14,
      maxWidth: options.maxWidth ?? 480,
      ...options
    };

    this.targetEl = null;
    this.svgEl = null;
    this.rings = [];
    this.rotationAnims = [];
    this.scrollTriggers = [];
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.render();
    this.bindElements();
    if (!this.prefersReducedMotion) {
      this.initRotation();
      this.initScrollAnimations();
    }
    this.setupReducedMotionListener();
  }

render() {
    const size = this.options.maxWidth || 460;
    const center = size / 2;
    const outerRadius = center * 0.95;
    const ringSpacing = outerRadius / 7;
    const bullseyeRadius = ringSpacing * 1.2;

    this.container.innerHTML = `
      <div class="rotating-target" role="img" aria-label="Rotating shooting target" aria-hidden="true">
        <svg class="rotating-target__svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--color-emerald)" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="var(--color-deep-charcoal)" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <circle class="rotating-target__ring rotating-target__ring--1" cx="${center}" cy="${center}" r="${outerRadius}" fill="none" stroke="var(--color-emerald)" stroke-width="3" stroke-opacity="0.7" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--2" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing}" fill="none" stroke="var(--color-emerald)" stroke-width="2.5" stroke-opacity="0.6" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--3" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing * 2}" fill="none" stroke="var(--color-emerald)" stroke-width="2.5" stroke-opacity="0.55" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--4" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing * 3}" fill="none" stroke="var(--color-emerald)" stroke-width="2" stroke-opacity="0.5" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--5" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing * 4}" fill="none" stroke="var(--color-emerald)" stroke-width="2.5" stroke-opacity="0.6" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--6" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing * 5}" fill="none" stroke="var(--color-emerald)" stroke-width="2" stroke-opacity="0.35" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__ring rotating-target__ring--7" cx="${center}" cy="${center}" r="${outerRadius - ringSpacing * 6}" fill="none" stroke="var(--color-emerald)" stroke-width="2" stroke-opacity="0.3" style="transform-origin: ${center}px ${center}px;" />

          <circle class="rotating-target__bullseye" cx="${center}" cy="${center}" r="${bullseyeRadius}" fill="var(--color-emerald)" filter="drop-shadow(0 0 16px var(--color-emerald)) drop-shadow(0 0 32px var(--color-emerald))" style="transform-origin: ${center}px ${center}px;" />
          <circle class="rotating-target__bullseye-inner" cx="${center}" cy="${center}" r="${bullseyeRadius * 0.35}" fill="var(--color-ivory)" style="transform-origin: ${center}px ${center}px;" />
        </svg>
      </div>
    `;
  }

  bindElements() {
    this.targetEl = this.container.querySelector('.rotating-target');
    this.svgEl = this.container.querySelector('.rotating-target__svg');
    this.rings = Array.from(this.container.querySelectorAll('.rotating-target__ring'));
    this.bullseye = this.container.querySelector('.rotating-target__bullseye');
    this.bullseyeInner = this.container.querySelector('.bullseye-inner') || this.container.querySelector('.rotating-target__bullseye-inner');
  }

  initRotation() {
    const center = (this.options.maxWidth || 460) / 2;
    const transformOrigin = `${center}px ${center}px`;

    // All rings rotate clockwise with different speeds
    gsap.to('.rotating-target__ring--1', {
      rotation: 360,
      duration: 35,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--2', {
      rotation: 360,
      duration: 45,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--3', {
      rotation: 360,
      duration: 55,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--4', {
      rotation: 360,
      duration: 65,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--5', {
      rotation: 360,
      duration: 75,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--6', {
      rotation: 360,
      duration: 85,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    gsap.to('.rotating-target__ring--7', {
      rotation: 360,
      duration: 95,
      repeat: -1,
      ease: 'none',
      transformOrigin
    });

    // Bullseye subtle pulse
    gsap.to('.rotating-target__bullseye', {
      scale: 1.08,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: 'center center'
    });
  }

  initScrollAnimations() {
    const heroSection = this.container.closest('.hero');
    if (!heroSection) return;

    // Scale up and rotate slightly on scroll for cinematic effect
    gsap.to('.rotating-target', {
      scale: 1.3,
      rotation: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Subtle vertical parallax
    gsap.to('.rotating-target', {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  setupReducedMotionListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stopAnimations();
      } else {
        this.initRotation();
        this.initScrollAnimations();
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    this._reducedMotionHandler = handler;
  }

  stopAnimations() {
    gsap.killTweensOf('.rotating-target__ring');
    gsap.killTweensOf('.rotating-target__bullseye');
    this.scrollTriggers.forEach(st => st.kill());
    this.scrollTriggers = [];
  }

  destroy() {
    this.stopAnimations();
    if (this._reducedMotionHandler) {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', this._reducedMotionHandler);
    }
    this.container.innerHTML = '';
  }
}

export function createRotatingTarget(container, options) {
  return new RotatingTarget(container, options);
}