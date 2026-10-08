import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class FinalCTA {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title: options.title || 'Ready to Take Your First Shot?',
      titleAccent: options.titleAccent || 'First Shot',
      description: options.description || 'Join Alwar\'s first RRA-certified academy. World-class ranges, expert coaches, and a community dedicated to your growth.',
      primaryAction: options.primaryAction || { label: 'Contact Us', href: '/contact' },
      secondaryAction: options.secondaryAction || { label: 'Pay & Play', href: '/pay-play' },
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const { title, titleAccent, description, primaryAction, secondaryAction } = this.options;

    let titleHtml = title;
    if (titleAccent) {
      const accentIndex = title.toLowerCase().indexOf(titleAccent.toLowerCase());
      if (accentIndex >= 0) {
        const before = title.slice(0, accentIndex);
        const accent = title.slice(accentIndex, accentIndex + titleAccent.length);
        const after = title.slice(accentIndex + titleAccent.length);
        titleHtml = `${before}<span class="final-cta__title-accent">${accent}</span>${after}`;
      }
    }

    this.container.innerHTML = `
      <section class="final-cta section" aria-labelledby="final-cta-title">
        <div class="container">
          <div class="final-cta__card">
            <h2 id="final-cta-title" class="final-cta__title">${titleHtml}</h2>
            <p class="final-cta__description">${description}</p>
            <div class="final-cta__actions" role="group" aria-label="Final actions">
              <a href="${primaryAction.href}" class="btn btn--primary btn--large final-cta__btn">${primaryAction.label}</a>
              <a href="${secondaryAction.href}" class="btn btn--secondary btn--large final-cta__btn">${secondaryAction.label}</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.final-cta');
    const card = this.container.querySelector('.final-cta__card');
    const title = this.container.querySelector('.final-cta__title');
    const description = this.container.querySelector('.final-cta__description');
    const actions = this.container.querySelector('.final-cta__actions');

    if (!section) return;

    // Card entrance with scale
    gsap.fromTo(card, 
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 55%',
          scrub: false
        }
      }
    );

    // Title, description, actions staggered
    gsap.fromTo([title, description, actions], 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false
        }
      }
    );

    // Subtle floating animation on card
    gsap.to(card, {
      y: -12,
      ease: 'sine.inOut',
      duration: 3,
      repeat: -1,
      yoyo: true
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.final-cta')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createFinalCTA(container, options) {
  return new FinalCTA(container, options);
}