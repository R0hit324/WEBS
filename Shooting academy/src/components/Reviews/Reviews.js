import { sanitize } from '@/lib/validation';
import { NS } from '@/lib/escape-html';

const ESC = (v) => sanitize.escapeHtml(String(v == null ? '' : v));
const SAFEURL = (v) => NS.safeUrl(v);

const STAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const AVATAR_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

const EMPTY_REVIEWS_ICON = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const SLOW_SPEED = 28; // px per second — slow, even left-to-right drift

function bindReviewFormLoader() {
  import('./ReviewForm').then(m => m.bindReviewForm()).catch(err => console.error('Failed to load review form:', err));
}

export class Reviews {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      reviews: options.reviews || [],
      ctaLabel: options.ctaLabel || 'Read All Reviews',
      ctaHref: options.ctaHref || '/reviews',
      ...options
    };
    this.init();
  }

  async init() {
    bindReviewFormLoader();
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
        title: item.review_title || '',
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
    const reviews = this.options.reviews;

    if (reviews.length === 0) {
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
                <div class="reviews__cta-actions">
                  <button type="button" class="btn btn--primary" data-review-open>Write a Review</button>
                </div>
              </div>
            </div>
            <div class="reviews__cta reviews__cta-actions">
              <button type="button" class="btn btn--secondary btn--large" data-review-open>Write a Review</button>
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    this._cardsArr = reviews.map(review => this.renderCard(review));

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
          <div class="reviews__marquee" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Reviews carousel — hover, press or hold to pause">
            <div class="reviews__track">${this._cardsArr.join('')}</div>
          </div>
          <div class="reviews__cta reviews__cta-actions">
            <button type="button" class="btn btn--secondary btn--large" data-review-open>Write a Review</button>
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `;

    this._cardsArr = reviews.map(review => this.renderCard(review));
    this.setupMarquee();
  }

  renderCard(review) {
    const text = ESC(review.text);
    const title = review.title ? ESC(review.title) : '';
    const author = review.author ? ESC(review.author) : '';
    const role = review.role ? ESC(review.role) : '';
    const avatar = review.avatar ? SAFEURL(review.avatar) : '';
    return `
      <article class="review-card">
        <div class="review-card__rating" aria-label="${review.rating} out of 5 stars">
          ${STAR_ICON.repeat(Math.min(5, Math.max(1, Math.round(review.rating))))}
        </div>
        ${title ? `<h3 class="review-card__title">${title}</h3>` : ''}
        ${text ? `<p class="review-card__text">"${text}"</p>` : ''}
        <div class="review-card__author">
          <div class="review-card__avatar" aria-hidden="true">
            ${avatar
              ? `<img src="${avatar}" alt="" class="review-card__avatar-img" loading="lazy"
                    >
                 <div class="review-card__avatar-placeholder" style="display:none"><span class="review-card__avatar-icon">${AVATAR_ICON}</span></div>`
              : `<div class="review-card__avatar-placeholder"><span class="review-card__avatar-icon">${AVATAR_ICON}</span></div>`
            }
          </div>
          <div>
            ${author ? `<span class="review-card__name">${author}</span>` : ''}
            ${role ? `<span class="review-card__role">${role}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  setupMarquee() {
    const marquee = this.container.querySelector('.reviews__marquee');
    const track = marquee?.querySelector('.reviews__track');
    if (!marquee || !track || !this.options.reviews.length) return;

    this._mq = { marquee, track, offset: 0, raf: 0, last: 0, paused: false, hovered: false, focused: false, dragging: false, lastX: 0, resumeTimer: 0, halfWidth: 0, setsPerHalf: 0, settle: 0 };
    this._listeners = [];
    this._on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      this._listeners.push([target, type, fn, opts]);
    };

    this._mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._mqReducedHandler = () => this.syncMarqueeMotion();
    this._on(this._mqReduced, 'change', this._mqReducedHandler);

    this._mqResize = () => {
      if (this._mq.settle) clearTimeout(this._mq.settle);
      this._mq.settle = setTimeout(() => this.layoutMarquee(), 150);
    };
    this._on(window, 'resize', this._mqResize);
    this._on(document, 'visibilitychange', () => {
      if (document.hidden) this.pauseMarquee();
      else if (!this._mq.paused) this.playMarquee();
    });

    // Pause while hovered with a mouse or while keyboard focus is inside
    this._on(marquee, 'mouseenter', () => { this._mq.hovered = true; this.pauseMarquee(); });
    this._on(marquee, 'mouseleave', () => { this._mq.hovered = false; this.playMarquee(); });
    this._on(marquee, 'focusin', () => { this._mq.focused = true; this.pauseMarquee(); });
    this._on(marquee, 'focusout', (e) => {
      if (!marquee.contains(e.relatedTarget)) { this._mq.focused = false; this.playMarquee(); }
    });

    // Touch/pen: hold pauses, drag scrubs, release resumes
    this._on(marquee, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' || this._mqReduced.matches) return;
      if (this._mq.resumeTimer) { clearTimeout(this._mq.resumeTimer); this._mq.resumeTimer = 0; }
      this._mq.dragging = true;
      this._mq.lastX = e.clientX;
      this.pauseMarquee();
    });
    this._on(marquee, 'pointermove', (e) => {
      if (!this._mq.dragging) return;
      this._mq.offset += e.clientX - this._mq.lastX;
      this._mq.lastX = e.clientX;
      this.applyMarqueeTransform();
    });
    const endDrag = () => {
      if (!this._mq.dragging) return;
      this._mq.dragging = false;
      this.playMarqueeDelayed(700);
    };
    this._on(marquee, 'pointerup', endDrag);
    this._on(marquee, 'pointercancel', endDrag);
    this._on(marquee, 'lostpointercapture', endDrag);

    this.syncMarqueeMotion();
  }

  // Ensure both loop halves always cover the viewport so no blank gap appears
  layoutMarquee(rebuild) {
    const mq = this._mq;
    if (!mq || this._mqReduced?.matches) return;

    // Card slot width (card + row gap) measured from the live first card
    const card = mq.track.querySelector('.review-card');
    const gap = 24; // --spacing-6
    const slot = card ? card.getBoundingClientRect().width + gap : 0;
    const setsPerHalf = slot ? Math.max(2, Math.ceil((mq.marquee.clientWidth + gap) / slot)) : 2;

    if (setsPerHalf !== mq.setsPerHalf) {
      mq.setsPerHalf = setsPerHalf;
      let html = '';
      for (let set = 0; set < setsPerHalf * 2; set++) {
        html += this._cardsArr.map((cardHtml, i) => (set === 0 ? cardHtml : cardHtml.replace('<article ', '<article aria-hidden="true" tabindex="-1" '))).join('');
      }
      mq.track.innerHTML = html;
      mq.halfWidth = 0;
    }

    // Re-measure once images/fonts settle (scrollWidth needs applied layout)
    mq.halfWidth = mq.halfWidth || Math.round(mq.track.scrollWidth / 2);
    if (!mq.halfWidth) return;

    // Keep the loop seamless across offset wrapping
    this._mq.offset = ((this._mq.offset % mq.halfWidth) + mq.halfWidth) % mq.halfWidth;
    if (!mq.paused) this.playMarquee();
    this.applyMarqueeTransform();
  }

  syncMarqueeMotion() {
    const mq = this._mq;
    if (!mq) return;
    mq.track.classList.toggle('reviews__track--static', !!this._mqReduced?.matches);
    if (this._mqReduced?.matches) {
      // Static, manually navigable fallback
      this.pauseMarquee();
      mq.marquee.classList.add('reviews__marquee--static');
      mq.track.innerHTML = this._cardsArr.join('');
      mq.offset = 0;
      mq.marquee.scrollLeft = 0;
      mq.track.style.transform = '';
      mq.setsPerHalf = 0;
    } else {
      mq.marquee.classList.remove('reviews__marquee--static');
      this.layoutMarquee(true);
    }
  }

  pauseMarquee() {
    const mq = this._mq;
    if (!mq) return;
    mq.paused = true;
    if (mq.raf) { cancelAnimationFrame(mq.raf); mq.raf = 0; }
    if (mq.resumeTimer) { clearTimeout(mq.resumeTimer); mq.resumeTimer = 0; }
  }

  playMarquee() {
    if (this._mqReduced?.matches) return;
    if (this._mq.hovered || this._mq.focused) return;
    const mq = this._mq;
    if (!mq || mq.raf || !mq.halfWidth) return;
    mq.paused = false;
    mq.last = performance.now();
    mq.raf = requestAnimationFrame((t) => this.marqueeTick(t));
  }

  playMarqueeDelayed(ms) {
    const mq = this._mq;
    if (!mq || this._mqReduced?.matches) return;
    if (mq.resumeTimer) clearTimeout(mq.resumeTimer);
    mq.resumeTimer = setTimeout(() => { mq.resumeTimer = 0; this.playMarquee(); }, ms);
  }

  marqueeTick(t) {
    const mq = this._mq;
    if (!mq) return;
    mq.raf = 0;
    if (mq.paused || this._mqReduced?.matches) return;
    const dt = Math.min(100, t - mq.last) / 1000;
    mq.last = t;
    this._mq.offset += SLOW_SPEED * dt;
    this.applyMarqueeTransform();
    mq.raf = requestAnimationFrame((n) => this.marqueeTick(n));
  }

  // Continuous left-to-right drift: translateX grows toward 0, wraps seamlessly
  applyMarqueeTransform() {
    const mq = this._mq;
    if (!mq || !mq.halfWidth) return;
    const x = (this._mq.offset % mq.halfWidth) - mq.halfWidth;
    mq.track.style.transform = `translate3d(${Math.round(x * 10) / 10}px, 0, 0)`;
  }

  destroy() {
    if (this._mq) {
      const mq = this._mq;
      if (mq.raf) cancelAnimationFrame(mq.raf);
      if (mq.resumeTimer) clearTimeout(mq.resumeTimer);
      if (mq.settle) clearTimeout(mq.settle);
      mq.track?.classList.remove('reviews__track--static');
      mq.track?.style.setProperty('transform', '');
    }
    this._listeners?.forEach(([target, type, fn, opts]) => target?.removeEventListener?.(type, fn, opts));
    this._listeners = null;
    this._mq = null;
    this.container.innerHTML = '';
  }
}

export function createReviews(container, options) {
  return new Reviews(container, options);
}
