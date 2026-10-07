export class SectionHeading {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      pretitle: options.pretitle ?? '',
      title: options.title ?? '',
      titleAccent: options.titleAccent ?? '',
      subtitle: options.subtitle ?? '',
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const { pretitle, title, titleAccent, subtitle } = this.options;
    
    let titleHtml = title;
    if (titleAccent) {
      const accentIndex = title.toLowerCase().indexOf(titleAccent.toLowerCase());
      if (accentIndex >= 0) {
        const before = title.slice(0, accentIndex);
        const accent = title.slice(accentIndex, accentIndex + titleAccent.length);
        const after = title.slice(accentIndex + titleAccent.length);
        titleHtml = `${before}<span class="section-heading__title-accent">${accent}</span>${after}`;
      }
    }

    this.container.innerHTML = `
      <div class="section-heading" role="heading" aria-level="2">
        ${pretitle ? `<p class="section-heading__pretitle">${pretitle}</p>` : ''}
        <h2 class="section-heading__title">${titleHtml}</h2>
        ${subtitle ? `<p class="section-heading__subtitle">${subtitle}</p>` : ''}
      </div>
    `;
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createSectionHeading(container, options) {
  return new SectionHeading(container, options);
}