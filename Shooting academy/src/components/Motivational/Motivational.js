const MOTIVATIONAL_WORDS = [
  { word: 'Focus', number: '01' },
  { word: 'Discipline', number: '02' },
  { word: 'Precision', number: '03' },
  { word: 'Consistency', number: '04' }
];

export class Motivational {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      words: options.words || MOTIVATIONAL_WORDS,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const itemsHtml = this.options.words.map((item, index) => `
      <div class="motivational__item">
        <span class="motivational__number">${item.number}</span>
        <span class="motivational__word">${item.word}</span>
        ${index < this.options.words.length - 1 ? '<span class="motivational__divider" aria-hidden="true"></span>' : ''}
      </div>
    `).join('');

    this.container.innerHTML = `
      <section class="motivational" aria-label="Core values">
        <div class="container">
          <div class="motivational__grid" role="list">${itemsHtml}</div>
        </div>
      </section>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export function createMotivational(container, options) {
  return new Motivational(container, options);
}