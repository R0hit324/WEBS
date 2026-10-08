const STAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const AVATAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

const EMPTY_REVIEWS_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const DEFAULT_REVIEWS = [
  {
    rating: 5,
    text: 'Exceptional coaching and world-class facilities. The 10m range is the best I\'ve trained at in North India.',
    author: 'Rajesh K.',
    role: 'State-level Shooter',
    avatar: null
  },
  {
    rating: 5,
    text: 'Aman sir\'s attention to technique transformed my shooting. Went from district to state level in one season.',
    author: 'Priya S.',
    role: 'Junior Nationalist',
    avatar: null
  },
  {
    rating: 5,
    text: 'Professional environment with genuine focus on athlete development. The 50m range is competition-ready.',
    author: 'Vikram M.',
    role: 'Senior Rifle Coach',
    avatar: null
  }
];

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class Reviews {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      reviews: options.reviews || [],
      ctaLabel: options.ctaLabel || 'Read All Reviews',
      ctaHref: options.ctaHref || '#reviews',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.initAnimations();
  }

  render() {
    const reviews = this.options.reviews.length > 0
      ? this.options.reviews
      : DEFAULT_REVIEWS;

    const isEmpty = this.options.reviews.length === 0;

    if (isEmpty) {
      this.container.innerHTML = `
        <section class="reviews section" aria-labelledby="reviews-title">
          <div class="container">
            <div class="reviews__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Reviews</p>
                <h2 id="reviews-title" class="section-heading__title">Trusted by <span class="section-heading__title-accent">Champions</span></h2>
                <p class="section-heading__subtitle">Hear from athletes who trained at Alwar's premier shooting academy.</p>
              </div>
            </div>
            <div class="reviews__grid" role="list">
              <div class="reviews__empty" role="status">
                <span class="reviews__empty-icon" aria-hidden="true">${EMPTY_REVIEWS_ICON}</span>
                <h3 class="reviews__empty-title">No Reviews Yet</h3>
                <p class="reviews__empty-desc">Authentic reviews from our athletes will appear here once submitted.</p>
              </div>
            </div>
            <div class="reviews__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;
    } else {
      const reviewsHtml = reviews.map(review => `
        <article class="review-card" role="listitem">
          <div class="review-card__rating" aria-label="${review.rating} out of 5 stars">
            ${STAR_ICON.repeat(review.rating)}
          </div>
          <p class="review-card__text">"${review.text}"</p>
          <div class="review-card__author">
            <div class="review-card__avatar" aria-hidden="true">
              ${review.avatar
                ? `<img src="${review.avatar}" alt="" class="review-card__avatar-img">`
                : `<div class="review-card__avatar-placeholder"><span class="review-card__avatar-icon">${AVATAR_ICON}</span></div>`
              }
            </div>
            <div>
              <span class="review-card__name">${review.author}</span>
              <span class="review-card__role">${review.role}</span>
            </div>
          </div>
        </article>
      `).join('');

      this.container.innerHTML = `
        <section class="reviews section" aria-labelledby="reviews-title">
          <div class="container">
            <div class="reviews__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Reviews</p>
                <h2 id="reviews-title" class="section-heading__title">Trusted by <span class="section-heading__title-accent">Champions</span></h2>
                <p class="section-heading__subtitle">Hear from athletes who trained at Alwar's premier shooting academy.</p>
              </div>
            </div>
            <div class="reviews__grid" role="list">${reviewsHtml}</div>
            <div class="reviews__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;
    }
  }

  initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = this.container.querySelector('.reviews');
    const header = this.container.querySelector('.reviews__header');
    const cards = this.container.querySelectorAll('.review-card');
    const cta = this.container.querySelector('.reviews__cta');

    if (!section) return;

    // Header entrance
    gsap.fromTo(header, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
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

    // Cards staggered entrance
    gsap.fromTo(cards, 
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false
        }
      }
    );

    // CTA entrance
    if (cta) {
      gsap.fromTo(cta, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 45%',
            scrub: false
          }
        }
      );
    }

    // Subtle floating animation on cards
    cards.forEach((card, index) => {
      gsap.to(card, {
        y: -10,
        ease: 'sine.inOut',
        duration: 2.5 + index * 0.3,
        repeat: -1,
        yoyo: true,
        delay: index * 0.3
      });
    });
  }

  updateReviews(reviews) {
    this.options.reviews = reviews;
    this.render();
    this.initAnimations();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === this.container.querySelector('.reviews')) {
        st.kill();
      }
    });
    this.container.innerHTML = '';
  }
}

export function createReviews(container, options) {
  return new Reviews(container, options);
}