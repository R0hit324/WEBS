export class CTA {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      variant: options.variant ?? 'centered',
      title: options.title ?? '',
      titleAccent: options.titleAccent ?? '',
      description: options.description ?? '',
      primaryAction: options.primaryAction ?? null,
      secondaryAction: options.secondaryAction ?? null,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const { variant, title, titleAccent, description, primaryAction, secondaryAction } = this.options;

    let titleHtml = title;
    if (titleAccent) {
      const accentIndex = title.toLowerCase().indexOf(titleAccent.toLowerCase());
      if (accentIndex >= 0) {
        const before = title.slice(0, accentIndex);
        const accent = title.slice(accentIndex, accentIndex + titleAccent.length);
        const after = title.slice(accentIndex + titleAccent.length);
        titleHtml = `${before}<span class="cta__title-accent">${accent}</span>${after}`;
      }
    }

    const actionsHtml = `
      <div class="cta__actions" role="group" aria-label="Actions">
        ${primaryAction ? `<button class="btn btn--primary btn--large" data-action="primary">${primaryAction.label}</button>` : ''}
        ${secondaryAction ? `<button class="btn btn--secondary btn--large" data-action="secondary">${secondaryAction.label}</button>` : ''}
      </div>
    `;

    this.container.innerHTML = `
      <div class="cta cta--${variant}" role="region" aria-labelledby="cta-title">
        <div class="cta__content">
          <h2 id="cta-title" class="cta__title">${titleHtml}</h2>
          ${description ? `<p class="cta__description">${description}</p>` : ''}
        </div>
        ${actionsHtml}
      </div>
    `;
  }

  bindEvents() {
    const primaryBtn = this.container.querySelector('[data-action="primary"]');
    const secondaryBtn = this.container.querySelector('[data-action="secondary"]');

    if (primaryBtn && this.options.primaryAction?.onClick) {
      primaryBtn.addEventListener('click', this.options.primaryAction.onClick);
    }
    if (secondaryBtn && this.options.secondaryAction?.onClick) {
      secondaryBtn.addEventListener('click', this.options.secondaryAction.onClick);
    }
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
    this.bindEvents();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createCTA(container, options) {
  return new CTA(container, options);
}