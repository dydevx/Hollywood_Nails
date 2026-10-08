/**
 * HOLLYWOOD NAILS - LANCASTER, UK
 * Main JavaScript File
 * Handles:
 * - Real-time Opening Hours & Open/Closed Badge status
 * - Current Day Highlight in Opening Hours Schedule
 * - Sticky Header state & Mobile Navigation Toggle
 * - Service Category Filtering in Nail Inspiration Gallery
 * - Interactive Lightbox with image zoom & captions
 * - Scroll Reveal Fade-up animations (IntersectionObserver)
 * - Smooth anchor scrolling
 * - Floating Back to Top Button
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHours();
  initMobileNav();
  initHeaderScroll();
  initGalleryFilter();
  initLightbox();
  initScrollAnimations();
  initScrollToTop();
  initSmoothScroll();
});

/* ==========================================================================
   1. LIVE OPENING HOURS STATUS & HIGHLIGHT
   ========================================================================== */
/**
 * Hours schedule:
 * Monday - Saturday: 09:00 - 18:00
 * Sunday: 10:00 - 16:00
 */
function initLiveHours() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTimeDec = hour + minute / 60;

  let isOpen = false;
  let todayHoursText = '';

  // Monday (1) to Saturday (6)
  if (day >= 1 && day <= 6) {
    isOpen = currentTimeDec >= 9.0 && currentTimeDec < 18.0;
    todayHoursText = '09:00 – 18:00';
  } else if (day === 0) {
    // Sunday
    isOpen = currentTimeDec >= 10.0 && currentTimeDec < 16.0;
    todayHoursText = '10:00 – 16:00';
  }

  // Update Top Bar status badge
  const topStatusBadge = document.getElementById('topLiveStatus');
  if (topStatusBadge) {
    if (isOpen) {
      topStatusBadge.className = 'status-badge open';
      topStatusBadge.innerHTML = '<span class="status-dot"></span> OPEN NOW (Closes at ' + (day === 0 ? '16:00' : '18:00') + ')';
    } else {
      topStatusBadge.className = 'status-badge closed';
      topStatusBadge.innerHTML = '<span class="status-dot"></span> CLOSED NOW (Opens ' + (day === 6 ? 'Sun 10:00' : '09:00') + ')';
    }
  }

  // Update Contact section status badge
  const contactLiveBadge = document.getElementById('contactLiveBadge');
  if (contactLiveBadge) {
    if (isOpen) {
      contactLiveBadge.className = 'hours-live-status open';
      contactLiveBadge.innerHTML = '<span class="status-dot"></span> OPEN NOW';
    } else {
      contactLiveBadge.className = 'hours-live-status closed';
      contactLiveBadge.innerHTML = '<span class="status-dot"></span> CLOSED NOW';
    }
  }

  // Highlight today's row in the hours table
  // Map JS day to data-day: 0 -> sun, 1 -> mon, 2 -> tue, 3 -> wed, 4 -> thu, 5 -> fri, 6 -> sat
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayMap[day];

  const todayRow = document.querySelector(`.hours-row[data-day="${todayKey}"]`);
  if (todayRow) {
    todayRow.classList.add('today');
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  });

  // Close menu when clicking on any nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   3. STICKY HEADER EFFECT & ACTIVE SECTION HIGHLIGHT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header background enhancement
    if (scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Active navigation item tracking
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   4. GALLERY FILTERING (NAIL INSPIRATION)
   ========================================================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle active button
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ==========================================================================
   5. LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const closeBtn = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!modal || !lightboxImg || !closeBtn) return;

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('h4')?.textContent || 'Hollywood Nails Lancaster';
      const category = item.querySelector('span')?.textContent || 'Nail Design';

      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || title;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxCategory) lightboxCategory.textContent = category;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);

  // Click outside image to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. SCROLL REVEAL (FADE-UP ANIMATIONS)
   ========================================================================== */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-up');

  if (!fadeElements.length) return;

  // Use IntersectionObserver for performant scroll animations
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback
    fadeElements.forEach((el) => el.classList.add('visible'));
  }
}

/* ==========================================================================
   7. SCROLL TO TOP BUTTON
   ========================================================================== */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

/* ==========================================================================
   8. SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}

