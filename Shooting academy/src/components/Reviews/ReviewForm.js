const CLOSE_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const STAR_FILLED = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const STAR_OUTLINE = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const SUCCESS_ICON = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

const MAX_NAME = 80;
const MAX_TITLE = 120;
const MAX_TEXT = 1000;

let bound = false;

function sanitizeText(value) {
  return String(value || '')
    .replace(/[<>`\\]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
}

function getModal() {
  return document.querySelector('.review-modal');
}

function closeModal() {
  const modal = getModal();
  if (!modal) return;
  const opener = modal.__opener;
  document.body.style.overflow = '';
  modal.remove();
  if (opener && typeof opener.focus === 'function') {
    opener.focus();
  }
}

function showError(message) {
  const box = getModal()?.querySelector('.review-modal__error');
  if (!box) return;
  box.textContent = message;
  box.hidden = false;
  box.scrollIntoView({ block: 'nearest' });
}

function clearError() {
  const box = getModal()?.querySelector('.review-modal__error');
  if (box) {
    box.hidden = true;
    box.textContent = '';
  }
}

function humanizeDbError(error) {
  const raw = String(error?.message || error || '').toLowerCase();
  if (raw.includes('failed to fetch') || raw.includes('network')) {
    return 'Network problem — please check your connection and try again.';
  }
  if (raw.includes('reviews_review_text_len') || raw.includes('too long')) {
    return `Your review is too long. Please keep it under ${MAX_TEXT} characters.`;
  }
  if (raw.includes('reviews_review_title_len')) {
    return `The review title is too long. Please keep it under ${MAX_TITLE} characters.`;
  }
  if (raw.includes('reviews_author_name_len')) {
    return `The name is too long. Please keep it under ${MAX_NAME} characters.`;
  }
  // Schema/config mismatch (e.g. a column or migrateable piece missing server side).
  if (raw.includes('pgrst204') || raw.includes("could not find the '")) {
    return 'Submissions are temporarily unavailable. Please try again later or contact us directly.';
  }
  if (raw.includes('row-level security') || raw.includes('permission') || raw.includes('policy') || raw.includes('401') || raw.includes('403') || raw.includes('42501')) {
    return 'Submissions are temporarily unavailable. Please try again later or contact us directly.';
  }
  return 'Your review could not be submitted. Please review the fields and try again.';
}

async function submitReview({ rating, name, title, text }) {
  const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
  const supabase = getSupabaseClient();

  const payload = {
    author_name: name,
    rating,
    review_text: text,
    // Non-admin visitors must never be able to publish straight away;
    // a database trigger also enforces this on the server.
    is_visible: false,
    is_featured: false,
  };

  if (title) {
    payload.review_title = title;
  }

  const insertReview = (body) => supabase.from(TABLES.REVIEWS).insert(body);

  let { data, error } = await insertReview(payload);
  if (error) {
    // Older deployments may not have review_title yet; the title is
    // optional, so degrade gracefully instead of losing the review.
    if (String(error.code || '') === 'PGRST204' && String(error.message || '').includes('review_title') && payload.review_title !== undefined) {
      console.warn('[ReviewForm] reviews.review_title column missing on this deployment — resubmitting without the title. Apply supabase/migrations/20261023120000_public_review_submissions.sql to enable titled reviews.');
      delete payload.review_title;
      ({ data, error } = await insertReview(payload));
    }
  }
  if (error) {
    throw error;
  }
  return data;
}

async function handleSubmit(event) {
  const modal = getModal();
  if (!modal) return;

  event.preventDefault();
  clearError();

  const form = modal.querySelector('.review-modal__form');
  const name = sanitizeText(form.elements.author_name?.value);
  const title = sanitizeText(form.elements.review_title?.value);
  const text = sanitizeText(form.elements.review_text?.value);
  const rating = parseInt(form.elements.review_rating?.value, 10);
  const honeypot = String(form.elements.company?.value || '').trim();

  // Spambots fill hidden fields; show the normal happy path but never persist.
  const isHoneypotTrip = honeypot.length > 0;

  const problems = [];
  if (!name) problems.push('Please enter your name.');
  else if (name.length > MAX_NAME) problems.push(`Name must be under ${MAX_NAME} characters.`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) problems.push('Please choose a star rating.');
  if (!text) problems.push('Please write your review.');
  else if (text.length < 4) problems.push('Your review is too short.');
  else if (text.length > MAX_TEXT) problems.push(`Review must be under ${MAX_TEXT} characters.`);
  if (title && title.length > MAX_TITLE) problems.push(`Title must be under ${MAX_TITLE} characters.`);

  if (problems.length > 0) {
    showError(problems[0]);
    return;
  }

  const submitButton = form.querySelector('.review-modal__submit');
  const cancelButton = form.querySelector('[data-review-close]');
  if (submitButton?.dataset.busy === 'true') {
    return;
  }

  if (submitButton) {
    submitButton.dataset.busy = 'true';
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
  }

  if (cancelButton) cancelButton.disabled = true;

  try {
    if (isHoneypotTrip) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      await submitReview({ rating, name, title, text });
    }
    form.hidden = true;
    const success = modal.querySelector('.review-modal__success');
    if (success) {
      success.hidden = false;
      success.querySelector('button')?.focus();
    }
  } catch (error) {
    // Safe developer diagnostics: PostgREST error fields only — never
    // credentials, personal data, or request headers.
    console.error('[ReviewForm] Review submission failed:', {
      code: error?.code ?? null,
      message: error?.message ?? String(error ?? ''),
      details: error?.details ?? null,
      hint: error?.hint ?? null,
    });
    showError(humanizeDbError(error));
  } finally {
    if (submitButton) {
      submitButton.dataset.busy = 'false';
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
    }
    if (cancelButton) cancelButton.disabled = false;
  }
}

function renderStars(form) {
  const wrap = form.querySelector('.review-modal__stars');
  if (!wrap) return;
  const current = parseInt(form.elements.review_rating?.value, 10) || 0;
  wrap.innerHTML = [1, 2, 3, 4, 5].map((value) => {
    const checked = current >= value ? 'checked' : '';
    const star = current >= value ? STAR_FILLED : STAR_OUTLINE;
    return `<label title="${value} star${value > 1 ? 's' : ''}"><input type="radio" name="review_rating" value="${value}" ${checked} aria-label="${value} star${value > 1 ? 's' : ''}"><span class="review-modal__star" aria-hidden="true">${star}</span></label>`;
  }).join('');
}

function handleStarChange(event) {
  if (event.target.name !== 'review_rating') return;
  const modal = getModal();
  if (!modal) return;
  const form = modal.querySelector('.review-modal__form');
  if (form) {
    renderStars(form);
  }
  const ratingGroup = modal.querySelector('.review-modal__stars');
  const label = modal.querySelector('.review-modal__rating-label');
  if (ratingGroup) {
    ratingGroup.dataset.value = event.target.value;
  }
  if (label) {
    label.textContent = `${event.target.value} / 5`;
    label.classList.add('review-modal__rating-label--set');
  }
  clearError();
}

function openReviewModal(options = {}) {
  if (getModal()) return;

  const modal = document.createElement('div');
  modal.className = 'review-modal';
  modal.__opener = options.opener instanceof HTMLElement ? options.opener : document.activeElement;

  modal.innerHTML = `
    <div class="review-modal__backdrop" data-review-close></div>
    <div class="review-modal__panel" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <button type="button" class="review-modal__close" data-review-close aria-label="Close review form">${CLOSE_ICON}</button>
      <form class="review-modal__form" novalidate>
        <header class="review-modal__header">
          <p class="badge review-modal__badge">Matsya Shooting Sports Academy</p>
          <h2 id="review-modal-title" class="review-modal__title">Write a <span>Review</span></h2>
          <p class="review-modal__subtitle">Share your experience at the academy — your review appears on our website after a quick check by our team.</p>
        </header>
        <div class="review-modal__field">
          <label for="review-form-name">Name <span class="review-modal__required" aria-hidden="true">*</span></label>
          <input id="review-form-name" name="author_name" type="text" maxlength="${MAX_NAME}" required placeholder="Your name" autocomplete="name" />
        </div>
        <div class="review-modal__field">
          <span class="review-modal__label-row"><span class="review-modal__label">Rating</span><span class="review-modal__rating-label" id="review-rating-value" role="status"></span></span>
          <div class="review-modal__stars" role="radiogroup" aria-labelledby="review-rating-value"></div>
        </div>
        <div class="review-modal__field">
          <label for="review-form-title">Review Title <span class="review-modal__optional">(optional)</span></label>
          <input id="review-form-title" name="review_title" type="text" maxlength="${MAX_TITLE}" placeholder="A short headline, e.g. “World-class facilities”" />
        </div>
        <div class="review-modal__field">
          <label for="review-form-text">Your Review <span class="review-modal__required" aria-hidden="true">*</span></label>
          <textarea id="review-form-text" name="review_text" rows="4" maxlength="${MAX_TEXT}" required placeholder="What did you enjoy? How was the coaching and the range?"></textarea>
        </div>
        <div class="review-modal__hp" aria-hidden="true">
          <label>Company<input name="company" type="text" tabindex="-1" autocomplete="off" /></label>
        </div>
        <div class="review-modal__error" role="alert" hidden></div>
        <div class="review-modal__actions">
          <button type="button" class="btn btn--secondary" data-review-close>Cancel</button>
          <button type="submit" class="btn btn--primary review-modal__submit">Submit Review</button>
        </div>
      </form>
      <div class="review-modal__success" hidden>
        <span class="review-modal__success-icon" aria-hidden="true">${SUCCESS_ICON}</span>
        <h3 class="review-modal__success-title">Thank You!</h3>
        <p class="review-modal__success-desc">Your review has been submitted and will appear on the website once our team has approved it.</p>
        <button type="button" class="btn btn--primary" data-review-close>Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const form = modal.querySelector('.review-modal__form');
  renderStars(form);

  form.addEventListener('submit', handleSubmit);
  form.addEventListener('input', (event) => {
    if (event.target.name !== 'review_rating') clearError();
  });
  form.addEventListener('change', handleStarChange);

  requestAnimationFrame(() => modal.classList.add('review-modal--open'));
  requestAnimationFrame(() => modal.classList.add('review-modal--ready'));

  setTimeout(() => {
    modal.querySelector('input[name="author_name"]')?.focus();
  }, 60);
}

export function bindReviewForm() {
  if (bound) return;
  bound = true;

  document.addEventListener('click', (event) => {
    const openTrigger = event.target.closest('[data-review-open]');
    if (openTrigger) {
      event.preventDefault();
      openReviewModal({ opener: openTrigger });
      return;
    }
    if (event.target.closest('[data-review-close]')) {
      event.preventDefault();
      closeModal();
      return;
    }
    if (getModal() && event.key === 'Escape') {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && getModal()) {
      event.preventDefault();
      closeModal();
    }
  });
}

export function createReviewModalOpener() { return openReviewModal; }
