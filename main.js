function runInit() {
  initNavbarScrollMorph();
  initHeroGlobe();
  initTabs();
  initFAQAccordion();
  initSmoothScroll();
  initScrollReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}

// Dynamic Navbar Morph on Scroll
function initNavbarScrollMorph() {
  const header = document.getElementById('header-wrapper');
  if (!header) return;

  function updateNavbar() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 50) {
      if (!header.classList.contains('is-scrolled')) {
        header.classList.add('is-scrolled');
        header.classList.remove('at-top');
      }
    } else {
      if (!header.classList.contains('at-top')) {
        header.classList.add('at-top');
        header.classList.remove('is-scrolled');
      }
    }
  }

  // Initial check
  header.classList.add('at-top');
  updateNavbar();

  window.addEventListener('scroll', updateNavbar, { passive: true });
}

// 3D Dotted Rotating Globe simulation for the Hero section
function initHeroGlobe() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let globePoints = [];
  const numPoints = 850;
  const globeRadius = 380;
  let rotationAngle = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Create points distributed evenly on a hemisphere / sphere using Fibonacci spiral
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    globePoints.push({ x, y, z });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Globe center is slightly below the center of the hero section
    const centerX = width / 2;
    const centerY = height * 0.72;
    const currentRadius = Math.min(globeRadius, width * 0.42);

    rotationAngle += 0.003;

    const cosRot = Math.cos(rotationAngle);
    const sinRot = Math.sin(rotationAngle);

    // Tilt globe slightly (tilt around X axis by ~18 degrees)
    const tiltAngle = 0.28;
    const cosTilt = Math.cos(tiltAngle);
    const sinTilt = Math.sin(tiltAngle);

    // Draw background subtle ring / horizon glow
    const grad = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.4, centerX, centerY, currentRadius * 1.15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.035)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.015)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Render rotated points
    for (let i = 0; i < globePoints.length; i++) {
      const p = globePoints[i];

      // Rotate around Y axis
      const rx = p.x * cosRot - p.z * sinRot;
      const rz = p.x * sinRot + p.z * cosRot;

      // Tilt around X axis
      const ry = p.y * cosTilt - rz * sinTilt;
      const finalZ = p.y * sinTilt + rz * cosTilt;

      // Only render visible points on the front and slightly translucent on back
      const perspective = 700 / (700 + finalZ * currentRadius);
      const screenX = centerX + rx * currentRadius * perspective;
      const screenY = centerY + ry * currentRadius * perspective;

      // Alpha based on depth
      let alpha = (finalZ + 1.2) / 2.2;
      if (alpha < 0.05) continue;
      if (finalZ < -0.1) {
        alpha *= 0.2; // Dim backside dots
      }

      const dotSize = Math.max(0.6, (finalZ + 1.2) * 1.3);

      ctx.beginPath();
      ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 220, 235, ${Math.min(0.85, alpha)})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// Interactive Feature Tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-pill-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// FAQ Accordion Toggle
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-accordion-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-acc-btn');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all items
      faqItems.forEach(i => i.classList.remove('open'));

      // If clicked item was not open, open it
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

// Smooth scrolling for in-page anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// Scroll Reveal Animations for elements entering viewport
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.feature-card, .service-card, .stat-card, .tab-content-grid, .faq-accordion-item, .blog-card, .pricing-card, .banner-badge, .section-header, .testimonial-card, .hero-content > *'
  );

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    const delay = (index % 4) * 0.08;
    if (delay > 0) {
      el.style.transitionDelay = `${delay}s`;
    }
    observer.observe(el);
  });
}
