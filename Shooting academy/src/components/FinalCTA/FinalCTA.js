export class FinalCTA {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title: options.title || 'Ready to Take Your First Shot?',
      titleAccent: options.titleAccent || 'First Shot',
      description: options.description || 'Join Alwar\'s first RRA-certified academy. World-class ranges, expert coaches, and a community dedicated to your growth.',
      primaryAction: options.primaryAction || { label: 'Register Now', href: '#register' },
      secondaryAction: options.secondaryAction || { label: 'Pay & Play', href: '/pay-play' },
      ...options
    };
    this.init();
  }

  init() {
    this.render();
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

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createFinalCTA(container, options) {
  return new FinalCTA(container, options);
}