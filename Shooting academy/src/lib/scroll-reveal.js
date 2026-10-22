import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'power3.out';
const SCROLL_START = 'top 88%';

const HEAD_SELECTOR = '[class$="__header"], [class*="__head"]';
const PAGE_TITLE_SELECTOR = '[class*="-page__title"]';
const SUBTITLE_SELECTOR = '[class$="__subtitle"], [class$="__meta"], [class$="__breadcrumb"], [class$="__description"]';
const GRID_SCOPE_SELECTOR = '[role="list"], [class$="__grid"], [class$="-grid"], [class$="__cards"], [class$="__list"], [class$="-cards"], [class$="__sessions"], [class$="__filters"], [class$="-details"], [class$="__details"]';
const IMAGE_SELECTOR = 'img[class$="__image"], [class$="__image"] img, [class$="__media"] img, [class$="__visual"] img, [class$="__banner"] img';
const BLOCK_SELECTOR = '[class$="__cta"], [class$="__cta-actions"], [class$="__cta-section"], [class$="__form"], [class$="__form-wrapper"], [class$="__info"], [class$="__empty"], [class$="__note"], [class$="__actions"]';
const HERO_SELECTOR = '.hero';
const FOOTER_SELECTOR = 'footer.footer';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let loadRefreshBound = false;
let activeGroup = null;
function bindLoadRefresh() {
  if (loadRefreshBound) return;
  loadRefreshBound = true;
  ScrollTrigger.config({ ignoreMobileResize: true });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

class ScrollRevealGroup {
  constructor(root) {
    this.root = root;
    this.triggers = [];
    this.observer = null;
    this.processed = new WeakSet();
    this.revealed = [];
    this.heroTimeline = null;
    this.heroParallax = null;
    this.wideQuery = window.matchMedia('(min-width: 1024px)');
    this._onWideChange = () => {
      if (!prefersReducedMotion()) this.setupParallax();
    };
  }

  init() {
    if (prefersReducedMotion()) return false;

    try {
      this.scan();
      this.observeMutations();
      this.setupParallax();
      this.wideQuery.addEventListener('change', this._onWideChange);
    } catch (err) {
      this.recover();
      console.warn('[scroll-reveal] init failed, animations disabled:', err);
    }
    return true;
  }

  scan() {
    const main = this.root.querySelector('main') || this.root;
    const footer = this.root.querySelector(FOOTER_SELECTOR);

    const hero = main.querySelector(HERO_SELECTOR);
    if (hero && !this.processed.has(hero)) {
      this.processed.add(hero);
      this.revealHero(hero);
    }

    const sections = main.querySelectorAll('section');
    sections.forEach(section => {
      if (this.processed.has(section) || section.closest(HERO_SELECTOR) === section) return;
      this.processed.add(section);
      this.revealSection(section);
    });

    if (sections.length === 0) this.revealPageBlocks(main);
    this.revealPageContainer(main);

    if (footer && !this.processed.has(footer)) {
      this.processed.add(footer);
      this.revealFooter(footer);
    }
  }

  revealHero(hero) {
    const entrance = hero.querySelector('.hero__content');
    const visual = hero.querySelector('.hero__visual');

    if (entrance) {
      const sequence = [];
      const badge = entrance.querySelector('.hero__badge');
      const headline = entrance.querySelector('.hero__headline');
      const headlineLines = headline ? headline.children : [];
      const description = entrance.querySelector('.hero__description');
      const actions = entrance.querySelector('.hero__actions');

      if (badge) sequence.push({ el: badge, y: 16, delay: 0 });
      for (let i = 0; i < headlineLines.length; i++) {
        sequence.push({ el: headlineLines[i], y: 34, delay: 0.08 + i * 0.09 });
      }
      if (description) sequence.push({ el: description, y: 22, delay: 0.08 + headlineLines.length * 0.09 + 0.05 });
      if (actions) sequence.push({ el: actions, y: 18, delay: 0.08 + headlineLines.length * 0.09 + 0.16 });

      const tl = gsap.timeline({ defaults: { duration: 0.9, ease: EASE } });
      sequence.forEach(item => {
        this.revealed.push(item.el);
        tl.from(item.el, { autoAlpha: 0, y: item.y }, item.delay);
      });
      this.heroTimeline = tl;
    }

    if (visual) {
      this.revealed.push(visual);
      gsap.from(visual, { autoAlpha: 0, scale: 0.86, duration: 1.1, delay: 0.35, ease: EASE });
    }
  }

  revealPageContainer(main) {
    main.querySelectorAll(PAGE_TITLE_SELECTOR).forEach(title => {
      if (this.processed.has(title)) return;
      this.processed.add(title);
      const subtitles = [...title.parentElement.children].filter(el => el !== title && el.matches(SUBTITLE_SELECTOR));
      const items = [{ el: title, delay: 0 }, ...subtitles.map((el, i) => ({ el, delay: 0.08 + i * 0.08 }))];
      subtitles.forEach(el => this.processed.add(el));
      this.revealGroup(items, { y: 26, stagger: 0 });
    });

    main.querySelectorAll(GRID_SCOPE_SELECTOR).forEach(grid => {
      if (this.processed.has(grid)) return;
      this.revealGrid(grid);
    });

    main.querySelectorAll(IMAGE_SELECTOR).forEach(img => {
      if (this.processed.has(img)) return;
      if (img.closest(GRID_SCOPE_SELECTOR)) return;
      this.processed.add(img);
      this.revealed.push(img);
      gsap.fromTo(img,
        { autoAlpha: 0, scale: 1.08 },
        {
          autoAlpha: 1, scale: 1, duration: 1.05, ease: EASE,
          immediateRender: true,
          scrollTrigger: { trigger: img, start: SCROLL_START, once: true }
        });
    });

    this.revealPageBlocks(main);
  }

  revealPageBlocks(main) {
    const blocks = [];
    main.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
      if (this.processed.has(el)) return;
      if (el.closest(HEAD_SELECTOR)) return;
      if (el.querySelector('.hero')) return;
      const wrappedIn = el.closest(GRID_SCOPE_SELECTOR);
      if (wrappedIn && this.processed.has(wrappedIn)) return;
      blocks.push({ el, delay: 0 });
      this.processed.add(el);
    });
    if (blocks.length > 0) this.revealGroup(blocks, { y: 20, stagger: 0.06 });
  }

  revealSection(section) {
    const container = section.querySelector(':scope > .container') || section;

    let introBlocks = [];
    const heads = section.querySelectorAll(HEAD_SELECTOR);
    heads.forEach(head => {
      const children = [...head.children];
      children.forEach((child, i) => introBlocks.push({ el: child, delay: i * 0.09 }));
      this.processed.add(head);
    });
    if (heads.length === 0) {
      section.querySelectorAll(PAGE_TITLE_SELECTOR).forEach(title => {
        introBlocks.push({ el: title, delay: 0 });
        this.processed.add(title);
        const next = title.parentElement.querySelector(SUBTITLE_SELECTOR)
          || title.closest('.container')?.querySelector(`:scope > ${SUBTITLE_SELECTOR}`);
        if (next) {
          introBlocks.push({ el: next, delay: 0.08 });
          this.processed.add(next);
        }
      });
    }
    if (introBlocks.length > 0) this.revealGroup(introBlocks, { y: 26, stagger: 0, label: 'intro' });

    container.querySelectorAll(GRID_SCOPE_SELECTOR).forEach(grid => {
      if (this.processed.has(grid)) return;
      const parentSection = grid.closest('section');
      if (parentSection && parentSection !== section) return;
      this.revealGrid(grid);
    });

    container.querySelectorAll(IMAGE_SELECTOR).forEach(img => {
      if (this.processed.has(img)) return;
      if (img.closest(GRID_SCOPE_SELECTOR)) return;
      this.processed.add(img);
      this.revealed.push(img);
      gsap.fromTo(img,
        { autoAlpha: 0, scale: 1.08, y: 0 },
        {
          autoAlpha: 1, scale: 1, duration: 1.05, ease: EASE,
          immediateRender: true,
          scrollTrigger: { trigger: img, start: SCROLL_START, once: true }
        });
    });

    const blocks = [];
    container.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
      if (this.processed.has(el)) return;
      if (el.closest(HEAD_SELECTOR)) return;
      const wrappedIn = el.closest(GRID_SCOPE_SELECTOR);
      if (wrappedIn && this.processed.has(wrappedIn)) return;
      blocks.push({ el, delay: 0 });
      this.processed.add(el);
    });
    if (blocks.length > 0) this.revealGroup(blocks, { y: 20, stagger: 0.06, label: 'blocks' });
  }

  revealGrid(grid) {
    this.processed.add(grid);
    const children = [...grid.children];
    if (children.length === 0) return;

    children.forEach(child => {
      if (!this.processed.has(child)) this.processed.add(child);
    });

    if (children.every(child => this.isGrandchildGrid(child))) return;

    const staggerDelay = Math.min(0.09, 0.6 / children.length);
    const images = children
      .map(child => child.querySelector(IMAGE_SELECTOR))
      .filter(Boolean);

    this.revealed.push(...children, ...images);

    gsap.fromTo(children,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1, y: 0, duration: 0.85, ease: EASE,
        stagger: staggerDelay,
        immediateRender: true,
        scrollTrigger: { trigger: grid, start: SCROLL_START, once: true }
      });

    if (images.length > 0) {
      gsap.fromTo(images,
        { scale: 1.12 },
        {
          scale: 1, duration: 1.0, ease: EASE,
          stagger: staggerDelay,
          immediateRender: true,
          scrollTrigger: { trigger: grid, start: SCROLL_START, once: true }
        });
    }
  }

  isGrandchildGrid(el) {
    return el.children.length > 0
      && el.querySelector(`:scope > ${GRID_SCOPE_SELECTOR}`) !== null;
  }

  revealGroup(items, { y = 24, stagger = 0.06, delay = 0 } = {}) {
    if (items.length === 0) return;
    const triggerEl = items[0].el;
    this.revealed.push(...items.map(item => item.el));
    gsap.fromTo(items.map(item => item.el),
      { autoAlpha: 0, y },
      {
        autoAlpha: 1, y: 0,
        duration: 0.8,
        ease: EASE,
        stagger: stagger,
        delay,
        immediateRender: true,
        scrollTrigger: { trigger: triggerEl, start: SCROLL_START, once: true }
      });
  }

  revealFooter(footer) {
    const blocks = footer.querySelectorAll('.footer__grid > *, .footer__divider, .footer__bottom');
    if (blocks.length === 0) return;
    this.revealed.push(...blocks);
    gsap.fromTo(blocks,
      { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1, y: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.07,
        immediateRender: true,
        scrollTrigger: { trigger: footer, start: 'top 95%', once: true }
      });
  }

  setupParallax() {
    if (this.heroParallax) {
      this.heroParallax.forEach(trigger => trigger.kill());
      this.heroParallax = null;
    }
    if (!this.wideQuery.matches || prefersReducedMotion()) return;

    const hero = this.root.querySelector('.hero');
    const visual = hero ? hero.querySelector('.hero__target-float, .hero__visual') : null;
    if (!hero || !visual) return;

    const trigger = gsap.to(visual, {
      y: -34,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
    this.heroParallax = [trigger, trigger.scrollTrigger];
  }

  observeMutations() {
    const debouncedScan = this.debounce(() => {
      if (!prefersReducedMotion()) this.scan();
    }, 120);
    this.observer = new MutationObserver(debouncedScan);
    this.observer.observe(this.root, { childList: true, subtree: true });
  }

  debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  recover() {
    try {
      this.triggers.forEach(trigger => trigger.kill());
      this.triggers = [];
      this.heroTimeline && this.heroTimeline.kill();
      this.heroTimeline = null;
      this.revealed.forEach(el => gsap.set(el, { clearProps: 'all' }));
    } catch (err) {
      console.warn('[scroll-reveal] recover failed:', err);
    }
  }

  destroy() {
    this.wideQuery.removeEventListener('change', this._onWideChange);
    this.recover();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export function activateScrollReveal(root) {
  if (!root || prefersReducedMotion()) return null;
  if (activeGroup) activeGroup.destroy();
  bindLoadRefresh();
  activeGroup = new ScrollRevealGroup(root);
  activeGroup.init();
  return activeGroup;
}

export function destroyScrollReveal() {
  if (activeGroup) {
    activeGroup.destroy();
    activeGroup = null;
  }
}

export function handleReducedMotionChange() {
  if (!activeGroup) return;
  if (prefersReducedMotion()) {
    activeGroup.destroy();
    activeGroup = null;
  }
}

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
reducedQuery.addEventListener('change', handleReducedMotionChange);
