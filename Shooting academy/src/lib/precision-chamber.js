import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Precision Chamber — fixed shooting room with a scroll-driven spotlight.
 *
 * The room environment (photo layer, lighting layers and dark ambient) is
 * rendered statically by Hero.js inside the pinned hero section and NEVER
 * moves, scales, rotates or crops during the sequence. This module drives
 * ONLY light/opacity:
 *
 *   Stage 1 ·  0-20%  deep shadows; beam barely a hint
 *   Stage 2 · 20-45%  warm overhead beam fades in from the ceiling lamp
 *   Stage 3 · 45-75%  bullseye illumination: local glow + floor pool,
 *                     ambient darkness recedes
 *   Stage 4 · 75-100% light settles to a steady hold; next section arrives
 *
 * The hero is pinned for the duration (desktop '+=170%', mobile '+=120%'),
 * scrubbed so scrolling up reverses the lighting naturally. Reduced-motion
 * users get a static, fully-lit and readable hero with no pin and no trigger.
 */

let active = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function activatePrecisionChamber() {
  destroyPrecisionChamber();

  const hero = document.querySelector('.hero--chamber');
  if (!hero) return;

  const navbar = document.querySelector('#navbar-container .navbar');
  const ambient = hero.querySelector('.pc-ambient');
  const beam = hero.querySelector('.pc-beam');
  const pool = hero.querySelector('.pc-pool');
  const targetlight = hero.querySelector('.pc-targetlight');
  const copy = hero.querySelector('.hero__content');

  if (prefersReducedMotion()) {
    hero.classList.add('pc-static');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mobile = window.innerWidth <= 768;
  const lights = mobile
    ? { beamHint: 0.12, beamPeak: 0.62, beamHold: 0.52, pool: 0.85, poolHold: 0.9, target: 0.5, ambientEarly: 0.58, ambientMid: 0.5, ambientLate: 0.46, ambientHold: 0.42 }
    : { beamHint: 0.12, beamPeak: 1, beamHold: 0.92, pool: 0.85, poolHold: 1, target: 0.55, ambientEarly: 0.88, ambientMid: 0.62, ambientLate: 0.34, ambientHold: 0.3, copy: 0.7 };

  gsap.set(ambient, { opacity: mobile ? 0.85 : 0.95 });
  gsap.set(beam, { opacity: 0, scaleY: 0.94 });
  gsap.set(pool, { opacity: 0 });
  gsap.set(targetlight, { opacity: 0 });
  // Mobile: hero copy stays hidden for the whole lighting sequence and is
  // revealed only after it completes (stage 3), rising gently into place
  // over the room. Desktop keeps copy visible.
  gsap.set(copy, mobile ? { autoAlpha: 0, y: 12 } : { autoAlpha: 1 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: window.innerWidth <= 768 ? '+=120%' : '+=170%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        if (navbar) navbar.classList.toggle('navbar--chamber-fixed', self.isActive);
      }
    },
    defaults: { ease: 'none' }
  });

  timeline
    .to(beam, { opacity: lights.beamHint, duration: 0.18, ease: 'power1.out' }, 0)
    .to(ambient, { opacity: lights.ambientEarly, duration: 0.18 }, 0)

    .to(ambient, { opacity: lights.ambientMid, duration: 0.25, ease: 'power1.out' }, 0.2)
    .to(beam, { opacity: lights.beamPeak, duration: 0.25, ease: 'power1.out' }, 0.2)
    .to(beam, { scaleY: 1, duration: 0.18, ease: 'power1.out' }, 0.28)

    .to(targetlight, { opacity: lights.target, duration: 0.3, ease: 'power1.out' }, 0.45)
    .to(pool, { opacity: lights.pool, duration: 0.3, ease: 'power1.out' }, 0.48)
    .to(ambient, { opacity: lights.ambientLate, duration: 0.3, ease: 'power1.out' }, 0.45)

    .to(beam, { opacity: lights.beamHold, duration: 0.25, ease: 'power1.inOut' }, 0.75)
    .to(pool, { opacity: lights.poolHold, duration: 0.25, ease: 'power1.inOut' }, 0.75)
    .to(ambient, { opacity: lights.ambientHold, duration: 0.25 }, 0.75);

  if (mobile) {
    // Stage 3 on mobile: reveal hero copy, overlaying the room's floor band,
    // only after the lighting completes; hold steady until the pin releases.
    timeline.to(copy, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.8);
  } else {
    timeline.to(copy, { autoAlpha: lights.copy, duration: 0.3 }, 0.45);
  }

  active = { hero, timeline, ambient, beam, pool, targetlight, copy, navbar };
}

export function destroyPrecisionChamber() {
  if (!active) return;
  const { hero, timeline, ambient, beam, pool, targetlight, copy, navbar } = active;
  active = null;
  if (hero) {
    hero.classList.remove('pc-static');
  }
  if (navbar) {
    navbar.classList.remove('navbar--chamber-fixed');
  }
  if (timeline) {
    if (timeline.scrollTrigger) {
      timeline.scrollTrigger.kill(false);
    }
    timeline.kill();
  }
  gsap.set([ambient, beam, pool, targetlight, copy].filter(Boolean), { clearProps: 'all' });
}

