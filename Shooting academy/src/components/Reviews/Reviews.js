const STAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const AVATAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

const EMPTY_REVIEWS_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

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

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    if (this.options.reviews && this.options.reviews.length > 0) {
      return; // Data already provided
    }
    try {
      const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.REVIEWS)
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      this.options.reviews = (data || []).map(item => ({
        rating: item.rating || 5,
        text: item.review_text,
        author: item.author_name,
        role: item.author_role,
        avatar: item.photo_url
      }));
    } catch (error) {
      console.error('Failed to load reviews:', error);
      this.options.reviews = [];
    }
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

  updateReviews(reviews) {
    this.options.reviews = reviews;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createReviews(container, options) {
  return new Reviews(container, options);
}
