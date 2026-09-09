/**
 * GSAP Animation Controller for CareWell Hospital Landing Page
 * Powers cinematic hero entrances, animated statistic counters, and scroll-triggered cards.
 */

export function initGsapAnimations() {
  if (typeof window.gsap === 'undefined') {
    console.warn('GSAP not loaded, falling back to standard CSS transitions');
    return;
  }

  const gsap = window.gsap;
  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  // 1. Hero Section Entrance Timeline
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.85 } });

  heroTl
    .fromTo('.landing-nav', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
    .fromTo('.hero-badge-tag', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, '-=0.4')
    .fromTo('.hero-title-main', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.3')
    .fromTo('.hero-desc-text', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
    .fromTo('.hero-cta-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.6 }, '-=0.4')
    .fromTo('.hero-trust-row', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3')
    .fromTo('#three-hero-canvas', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.2)' }, '-=0.8');

  // 2. Quick Help Cards Entrance
  gsap.fromTo('.quick-help-card',
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.quick-help-section',
        start: 'top 85%'
      }
    }
  );

  // 3. Hospital Statistic Counters Animation
  const statNumbers = document.querySelectorAll('.stat-counter-number');
  statNumbers.forEach((el) => {
    const targetVal = parseInt(el.getAttribute('data-target') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const counterObj = { val: 0 };

    gsap.to(counterObj, {
      val: targetVal,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%'
      },
      onUpdate: function() {
        el.innerText = Math.round(counterObj.val).toLocaleString() + suffix;
      }
    });
  });

  // 4. Healthcare Services Cards Stagger Reveal
  gsap.fromTo('.healthcare-service-card',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.services-section-grid',
        start: 'top 80%'
      }
    }
  );

  // 5. ClearQueue Triage Feature Spotlight Card Entrance
  gsap.fromTo('.triage-spotlight-card',
    { y: 45, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.triage-spotlight-card',
        start: 'top 85%'
      }
    }
  );

  // 6. Specialist Doctor Profile Cards
  gsap.fromTo('.doctor-profile-card',
    { y: 35, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.doctors-section-grid',
        start: 'top 85%'
      }
    }
  );
}
