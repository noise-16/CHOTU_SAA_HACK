/**
 * GSAP Animation Controller for CareWell Hospital & ClearQueue OPD System
 * Cinematic, physics-based, hardware-accelerated animations for tabs, modals,
 * scores, cards, and queue row transitions.
 */

let heroTimeline = null;

export function cleanupGsapAnimations() {
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }
  if (typeof window.ScrollTrigger !== 'undefined') {
    window.ScrollTrigger.getAll().forEach(st => st.kill());
  }
  if (typeof window.gsap !== 'undefined') {
    window.gsap.killTweensOf('.quick-help-card, .healthcare-service-card, .doctor-profile-card, .stat-counter-number, .triage-spotlight-card, .panel-card, .next-patient-card');
  }
}

export function initGsapAnimations() {
  const animatableElements = document.querySelectorAll(
    '.landing-nav, .hero-badge-tag, .hero-title-main, .hero-desc-text, .hero-cta-btn, .hero-trust-row, .quick-help-card, .stat-counter-number, .healthcare-service-card, .triage-spotlight-card, .doctor-profile-card'
  );
  animatableElements.forEach(el => {
    el.style.opacity = '1';
  });

  if (typeof window.gsap === 'undefined') {
    return;
  }

  const gsap = window.gsap;
  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  cleanupGsapAnimations();

  // 1. Hero Section Entrance Timeline
  heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.6 } });

  heroTimeline
    .fromTo('.landing-nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' })
    .fromTo('.hero-badge-tag', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, clearProps: 'all' }, '-=0.3')
    .fromTo('.hero-title-main', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }, '-=0.25')
    .fromTo('.hero-desc-text', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }, '-=0.35')
    .fromTo('.hero-cta-btn', { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, clearProps: 'all' }, '-=0.3')
    .fromTo('.hero-trust-row', { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: 'all' }, '-=0.2')
    .fromTo('#three-hero-canvas', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=0.5');

  // 2. Hospital Statistic Counters Animation
  const statNumbers = document.querySelectorAll('.stat-counter-number');
  statNumbers.forEach((el) => {
    const targetVal = parseInt(el.getAttribute('data-target') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (!targetVal) return;

    if (typeof window.ScrollTrigger !== 'undefined') {
      const counterObj = { val: 0 };
      gsap.to(counterObj, {
        val: targetVal,
        duration: 1.6,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 95%',
          once: true
        },
        onUpdate: function() {
          el.innerText = Math.round(counterObj.val).toLocaleString() + suffix;
        }
      });
    } else {
      el.innerText = targetVal.toLocaleString() + suffix;
    }
  });

  // 3. Staggered Card Reveals with ScrollTrigger
  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.fromTo('.quick-help-card',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.quick-help-section',
          start: 'top 90%',
          once: true
        }
      }
    );

    gsap.fromTo('.healthcare-service-card',
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.services-section-grid',
          start: 'top 85%',
          once: true
        }
      }
    );

    gsap.fromTo('.doctor-profile-card',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.doctors-section-grid',
          start: 'top 85%',
          once: true
        }
      }
    );
  }

  // 4. Interactive Card Hover Micro-Interactions
  initCardHoverEffects();
}

/**
 * Lightweight micro-hover elevation
 */
function initCardHoverEffects() {
  if (typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;

  const cards = document.querySelectorAll('.quick-help-card, .healthcare-service-card, .doctor-profile-card, .room-card, .metric-card');
  cards.forEach(card => {
    card.onmouseenter = () => {
      gsap.to(card, {
        y: -4,
        scale: 1.01,
        duration: 0.2,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    };

    card.onmouseleave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    };
  });
}

/**
 * Smooth rotation and scale spring animation for the theme toggle button
 */
export function animateThemeToggle(buttonEl) {
  if (!buttonEl || typeof window.gsap === 'undefined') return;
  window.gsap.fromTo(buttonEl,
    { rotate: -90, scale: 0.85 },
    { rotate: 0, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }
  );
}

/**
 * Smooth staggered transition when switching dashboard tabs
 */
export function animateTabSwitch(containerSelector = '#role-content-area') {
  if (typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;

  const container = document.querySelector(containerSelector);
  if (!container) return;

  const cards = container.querySelectorAll('.next-patient-card, .panel-card, .room-allocation-header, .rooms-grid, .data-table-container, .patient-view-hero');
  if (cards.length > 0) {
    gsap.fromTo(cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' }
    );
  } else {
    gsap.fromTo(container,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' }
    );
  }
}

/**
 * Smooth numerical count-up for clinical scores and stats
 */
export function animateScoreCounter(element, targetScore, duration = 0.8) {
  if (!element || typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;
  const num = parseInt(targetScore, 10);
  if (isNaN(num)) {
    element.innerText = targetScore;
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: num,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.innerText = Math.round(obj.val);
    }
  });
}

/**
 * Spring entrance for modal dialogs
 */
export function animateModalOpen(modalEl) {
  if (!modalEl || typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;
  const card = modalEl.querySelector('.modal-card, .modal-content, [class*="modal"]');
  if (card) {
    gsap.fromTo(card,
      { scale: 0.9, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' }
    );
  }
}

/**
 * Highlight a table row or card when updated
 */
export function animateRowUpdate(rowEl) {
  if (!rowEl || typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;
  gsap.fromTo(rowEl,
    { backgroundColor: 'rgba(14, 165, 233, 0.25)' },
    { backgroundColor: 'transparent', duration: 1.2, ease: 'power2.out' }
  );
}

/**
 * Animate toast notification with bounce and countdown bar
 */
export function animateToast(toastEl) {
  if (!toastEl || typeof window.gsap === 'undefined') return;
  const gsap = window.gsap;

  gsap.fromTo(toastEl,
    { x: 40, opacity: 0, scale: 0.95 },
    { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.3)' }
  );

  const progressBar = toastEl.querySelector('.toast-progress-bar');
  if (progressBar) {
    gsap.fromTo(progressBar,
      { width: '100%' },
      { width: '0%', duration: 4.2, ease: 'linear' }
    );
  }
}
