const DEFAULT_REVIEWS = [];

const STAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const AVATAR_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

const EMPTY_REVIEWS_ICON = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

function sortReviews(reviews) {
  return [...reviews]
    .filter(r => r.visible !== false)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });
}

function formatReviewDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export class ReviewsPage {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      reviews: options.reviews || DEFAULT_REVIEWS,
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
        avatar: item.photo_url,
        avatarAlt: item.photo_alt || item.author_name,
        date: item.review_date,
        featured: Boolean(item.is_featured),
        visible: item.is_visible !== false,
        displayOrder: item.display_order ?? 0
      }));
    } catch (error) {
      console.error('Failed to load reviews:', error);
      this.options.reviews = [];
    }
  }

  render() {
    const reviews = sortReviews(this.options.reviews);

    if (reviews.length === 0) {
      this.renderEmptyState();
      return;
    }

    const reviewsHtml = reviews.map(review => this.renderReviewCard(review)).join('');

    this.container.innerHTML = `
      <section class="reviews-page" aria-labelledby="reviews-page-title">
        <div class="container">
          <header class="reviews-page__hero">
            <div class="reviews-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="reviews-page-title" class="reviews-page__title">Reviews & <span class="reviews-page__title-accent">Testimonials</span></h1>
            <p class="reviews-page__description">Authentic feedback from athletes who have trained at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="reviews-page__grid" role="list">${reviewsHtml}</div>
        </div>
      </section>
    `;
  }

  renderReviewCard(review) {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating || 5)));
    const dateText = formatReviewDate(review.date);

    return `
      <article class="review-card" role="listitem">
        <div class="review-card__rating" aria-label="${rating} out of 5 stars">
          ${STAR_ICON.repeat(rating)}
        </div>
        ${review.text ? `<p class="review-card__text">"${review.text}"</p>` : ''}
        <footer class="review-card__author">
          <div class="review-card__avatar" aria-hidden="true">
            ${review.avatar
              ? `<img src="${review.avatar}" alt="" class="review-card__avatar-img" loading="lazy"
                   onerror="this.onerror=null;this.style.display='none';const f=this.nextElementSibling;if(f)f.style.display='flex';">
                 <div class="review-card__avatar-placeholder" style="display:none"><span class="review-card__avatar-icon">${AVATAR_ICON}</span></div>`
              : `<div class="review-card__avatar-placeholder"><span class="review-card__avatar-icon">${AVATAR_ICON}</span></div>`
            }
          </div>
          <div>
            ${review.author ? `<span class="review-card__name">${review.author}</span>` : ''}
            ${review.role ? `<span class="review-card__role">${review.role}</span>` : ''}
            ${dateText ? `<span class="review-card__date">${dateText}</span>` : ''}
          </div>
        </footer>
      </article>
    `;
  }

  renderEmptyState() {
    this.container.innerHTML = `
      <section class="reviews-page" aria-labelledby="reviews-page-title">
        <div class="container">
          <header class="reviews-page__hero">
            <div class="reviews-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="reviews-page-title" class="reviews-page__title">Reviews & <span class="reviews-page__title-accent">Testimonials</span></h1>
            <p class="reviews-page__description">Authentic feedback from athletes who have trained at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="reviews-page__grid">
            <div class="reviews-page__empty" role="status">
              <span class="reviews-page__empty-icon" aria-hidden="true">${EMPTY_REVIEWS_ICON}</span>
              <h2 class="reviews-page__empty-title">No Reviews Yet</h2>
              <p class="reviews-page__empty-desc">Authentic reviews from our athletes will appear here once submitted.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  updateReviews(reviews) {
    this.options.reviews = reviews;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createReviewsPage(container, options) {
  return new ReviewsPage(container, options);
}
