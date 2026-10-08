import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ShootingTarget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      intervalMin: options.intervalMin ?? 2500,
      intervalMax: options.intervalMax ?? 4000,
      displayDuration: options.displayDuration ?? 1200,
      ...options
    };

    this.currentScore = null;
    this.timerId = null;
    this.isAnimating = false;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ringConfig = {
      10: { ring: 10, radius: 0, cx: 0.5, cy: 0.5, maxOffset: 0.03 },
      9: { ring: 9, radius: 0.075, cx: 0.5, cy: 0.5, maxOffset: 0.02 },
      8: { ring: 8, radius: 0.125, cx: 0.5, cy: 0.5, maxOffset: 0.02 }
    };

    this.init();
  }

  init() {
    this.render();
    this.bindElements();
    this.startAnimation();
    if (!this.prefersReducedMotion) {
      this.initScrollRotation();
    }
    this.setupReducedMotionListener();
  }

  render() {
    this.container.innerHTML = `
      <div class="shooting-target" role="img" aria-label="Shooting target with animated scoring">
        <svg class="shooting-target__svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--color-emerald)" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="var(--color-deep-charcoal)" stop-opacity="1"/>
            </radialGradient>
          </defs>
          
          <circle class="shooting-target__ring shooting-target__ring--1" cx="250" cy="250" r="250"/>
          <circle class="shooting-target__ring shooting-target__ring--2" cx="250" cy="250" r="225"/>
          <circle class="shooting-target__ring shooting-target__ring--3" cx="250" cy="250" r="200"/>
          <circle class="shooting-target__ring shooting-target__ring--4" cx="250" cy="250" r="175"/>
          <circle class="shooting-target__ring shooting-target__ring--5" cx="250" cy="250" r="150"/>
          <circle class="shooting-target__ring shooting-target__ring--6" cx="250" cy="250" r="125"/>
          <circle class="shooting-target__ring shooting-target__ring--7" cx="250" cy="250" r="100"/>
          <circle class="shooting-target__ring shooting-target__ring--8" cx="250" cy="250" r="75"/>
          <circle class="shooting-target__ring shooting-target__ring--9" cx="250" cy="250" r="50"/>
          <circle class="shooting-target__ring shooting-target__ring--10" cx="250" cy="250" r="25"/>
          
          <g class="shooting-target__impacts" aria-hidden="true">
            <circle class="shooting-target__impact" cx="250" cy="250" r="3"/>
            <circle class="shooting-target__impact" cx="265" cy="242" r="2"/>
            <circle class="shooting-target__impact" cx="240" cy="258" r="1.5"/>
            <circle class="shooting-target__impact" cx="258" cy="268" r="2.5"/>
            <circle class="shooting-target__impact" cx="232" cy="238" r="1.5"/>
          </g>
          
          <text class="shooting-target__score shooting-target__score--10" x="250" y="250" aria-hidden="true">10</text>
          <text class="shooting-target__score shooting-target__score--9" x="250" y="250" aria-hidden="true">9</text>
          <text class="shooting-target__score shooting-target__score--8" x="250" y="250" aria-hidden="true">8</text>
        </svg>
      </div>
    `;
  }

  bindElements() {
    this.targetEl = this.container.querySelector('.shooting-target');
    this.svgEl = this.container.querySelector('.shooting-target__svg');
    this.scoreElements = {
      10: this.container.querySelector('.shooting-target__score--10'),
      9: this.container.querySelector('.shooting-target__score--9'),
      8: this.container.querySelector('.shooting-target__score--8')
    };
    this.impactElements = this.container.querySelectorAll('.shooting-target__impact');
  }

  initScrollRotation() {
    const heroSection = this.container.closest('.hero');
    if (!heroSection) return;

    const rings = this.container.querySelectorAll('.shooting-target__ring');
    
    rings.forEach((ring, index) => {
      const rotationAmount = 180 + (index * 8);
      gsap.to(ring, {
        rotation: rotationAmount,
        transformOrigin: '250px 250px',
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    gsap.to(this.svgEl, {
      scale: 1.1,
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
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stopAnimation();
        ScrollTrigger.getAll().forEach(st => st.kill());
      } else {
        this.startAnimation();
        this.initScrollRotation();
      }
    });
  }

  getRandomScore() {
    const scores = [8, 9, 10];
    const weights = [0.4, 0.35, 0.25];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) return scores[i];
    }
    return 10;
  }

  getRandomAngle() {
    return Math.random() * Math.PI * 2;
  }

  getPositionInRing(score) {
    const config = this.ringConfig[score];
    const angle = this.getRandomAngle();
    const offset = Math.random() * config.maxOffset;
    
    return {
      x: config.cx + Math.cos(angle) * (config.radius + offset),
      y: config.cy + Math.sin(angle) * (config.radius + offset)
    };
  }

  showScore(score) {
    if (this.currentScore !== null) {
      this.hideScore(this.currentScore);
    }

    this.currentScore = score;
    const scoreEl = this.scoreElements[score];
    const pos = this.getPositionInRing(score);

    scoreEl.setAttribute('x', pos.x * 500);
    scoreEl.setAttribute('y', pos.y * 500);
    scoreEl.classList.add('shooting-target__score--visible');

    const impactIndex = Math.floor(Math.random() * this.impactElements.length);
    const impact = this.impactElements[impactIndex];
    impact.setAttribute('cx', pos.x * 500);
    impact.setAttribute('cy', pos.y * 500);
    impact.classList.add('shooting-target__impact--visible');

    setTimeout(() => {
      impact.classList.remove('shooting-target__impact--visible');
    }, 300);
  }

  hideScore(score) {
    const scoreEl = this.scoreElements[score];
    scoreEl.classList.remove('shooting-target__score--visible');
  }

  animate() {
    if (this.prefersReducedMotion) return;

    const score = this.getRandomScore();
    this.showScore(score);

    setTimeout(() => {
      if (this.currentScore === score) {
        this.hideScore(score);
        this.currentScore = null;
      }
      this.scheduleNext();
    }, this.options.displayDuration);
  }

  scheduleNext() {
    if (this.prefersReducedMotion) return;

    const interval = this.options.intervalMin + 
      Math.random() * (this.options.intervalMax - this.options.intervalMin);
    
    this.timerId = setTimeout(() => {
      this.animate();
    }, interval);
  }

  startAnimation() {
    if (this.isAnimating || this.prefersReducedMotion) return;
    this.isAnimating = true;
    this.animate();
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.currentScore !== null) {
      this.hideScore(this.currentScore);
      this.currentScore = null;
    }
  }

  destroy() {
    this.stopAnimation();
    ScrollTrigger.getAll().forEach(st => st.kill());
    this.container.innerHTML = '';
  }
}

export function createShootingTarget(container, options) {
  return new ShootingTarget(container, options);
}