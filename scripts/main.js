/* ========================================
   APEX LAB — Main JavaScript
   Scroll-driven crossfade, about panel, reveal
   ======================================== */

let targetMaskX = 50;
let targetMaskY = 50;
let currentMaskX = 50;
let currentMaskY = 50;

document.addEventListener('DOMContentLoaded', () => {
  initCrossfade();
  initAboutPanel();
  initScrollReveal();
  initMouseMotionScroll();
});


/* ========================================
   CROSSFADE — Scroll-driven image dissolve
   Images blend into each other as user scrolls.
   All images occupy same viewport; scroll controls opacity.
   ======================================== */

function initCrossfade() {
  const container = document.querySelector('.crossfade');
  const images = document.querySelectorAll('.crossfade__img');
  const progressBar = document.getElementById('crossfade-progress');

  if (!container || !images.length) return;

  const imageCount = images.length;

  function update() {
    const rect = container.getBoundingClientRect();
    const scrollHeight = container.offsetHeight - window.innerHeight;

    // How far we've scrolled through the crossfade section (0 → 1)
    const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

    // Map progress to image index (float)
    // e.g. with 6 images: 0→0, 0.2→1, 0.4→2, etc.
    const imageProgress = rawProgress * (imageCount - 1);
    const currentIndex = Math.floor(imageProgress);
    const blend = imageProgress - currentIndex; // 0→1 between current and next

    // Smoothly interpolate mask center
    currentMaskX += (targetMaskX - currentMaskX) * 0.1;
    currentMaskY += (targetMaskY - currentMaskY) * 0.1;

    // Crossfade Brand Logo vs Statement Text (on last two images)
    const brand = document.querySelector('.crossfade__brand');
    const statement = document.querySelector('.statement__text');
    
    if (brand) {
      const brandOpacity = Math.max(0, Math.min(1, 4 - imageProgress));
      brand.style.opacity = brandOpacity;
    }
    
    if (statement) {
      const statementOpacity = Math.max(0, Math.min(1, imageProgress - 3));
      statement.style.opacity = statementOpacity;
      statement.style.transform = `translateY(${(1 - statementOpacity) * 24}px)`;
    }

    // Set visibility and mask for each image
    for (let i = 0; i < imageCount; i++) {
      let opacity = 0;
      let invert = 0;
      let mask = 'none';
      let zIndex = 0;

      if (i === currentIndex) {
        // Current image: stays fully visible as base layer
        opacity = 1;
        invert = 0;
        zIndex = 1;
        mask = 'none';
      } else if (i === currentIndex + 1) {
        // Next image: soft expanding circle mask
        opacity = 1; 
        invert = Math.sin(blend * Math.PI);
        zIndex = 2;
        // Calculate radius for mask: starts negative to be fully hidden at blend=0
        const innerRadius = (blend * 180) - 30;
        const outerRadius = innerRadius + 30; // 30% soft edge
        mask = `radial-gradient(circle at ${currentMaskX}% ${currentMaskY}%, black ${innerRadius}%, transparent ${outerRadius}%)`;
      }

      // Last image stays at full opacity when we reach the end
      if (i === imageCount - 1 && currentIndex >= imageCount - 1) {
        opacity = 1;
        invert = 0;
        zIndex = 1;
        mask = 'none';
      }

      images[i].style.opacity = opacity;
      images[i].style.filter = `invert(${invert})`;
      images[i].style.webkitMaskImage = mask;
      images[i].style.maskImage = mask;
      images[i].style.zIndex = zIndex;
    }

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = (rawProgress * 100) + '%';
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}


/* ========================================
   ABOUT PANEL
   ======================================== */

function initAboutPanel() {
  const openBtn = document.getElementById('about-open');
  const closeBtn = document.getElementById('about-close');
  const overlay = document.getElementById('about-overlay');
  const backdrop = document.getElementById('about-backdrop');

  if (!openBtn || !overlay) return;

  function openAbout(e) {
    e.preventDefault();
    overlay.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeAbout() {
    overlay.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openAbout);
  if (closeBtn) closeBtn.addEventListener('click', closeAbout);
  if (backdrop) backdrop.addEventListener('click', closeAbout);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeAbout();
    }
  });
}


/* ========================================
   SCROLL REVEAL (IntersectionObserver)
   ======================================== */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .editorial-grid__item');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Stagger grid items
        if (el.classList.contains('editorial-grid__item')) {
          const siblings = Array.from(el.parentElement.children);
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = `${idx * 60}ms`;
        }

        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ========================================
   MOUSE MOTION SCROLL
   Moving the mouse over the crossfade advances the scroll
   ======================================== */

function initMouseMotionScroll() {
  const viewport = document.querySelector('.crossfade__viewport');
  if (!viewport) return;

  viewport.addEventListener('mousemove', (e) => {
    // Update mask target position based on mouse
    const rect = viewport.getBoundingClientRect();
    targetMaskX = ((e.clientX - rect.left) / rect.width) * 100;
    targetMaskY = ((e.clientY - rect.top) / rect.height) * 100;

    // Only trigger if it's a significant movement to avoid micro-jitters
    const distance = Math.sqrt(e.movementX ** 2 + e.movementY ** 2);
    
    if (distance > 1) {
      window.scrollBy({
        top: distance * 3.5, // Sensitivity multiplier increased
        behavior: 'auto'
      });
    }
  });
}
