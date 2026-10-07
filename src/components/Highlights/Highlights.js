const HIGHLIGHTS_DATA = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    text: "Alwar's first RRA-certified academy",
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "10m",
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "25m",
    muted: false
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    text: "50m",
    muted: false
  }
];

export class Highlights {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || HIGHLIGHTS_DATA,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const itemsHtml = this.options.items.map(item => `
      <li class="highlights__item">
        <span class="highlights__icon" aria-hidden="true">${item.icon}</span>
        <span class="highlights__text ${item.muted ? 'highlights__text--muted' : ''}">${item.text}</span>
      </li>
    `).join('');

    this.container.innerHTML = `
      <section class="highlights" aria-label="Academy highlights">
        <div class="container">
          <ul class="highlights__list" role="list">${itemsHtml}</ul>
        </div>
      </section>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createHighlights(container, options) {
  return new Highlights(container, options);
}