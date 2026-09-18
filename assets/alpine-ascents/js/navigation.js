/* ============================================
   NAVIGATION — navbar scroll state, active links,
   scroll progress, back-to-top
   ============================================ */

(function () {
  const navbar = document.getElementById('mainNavbar');
  const progressBar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-nav]');

  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar background state
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';

    // Back to top visibility
    if (backToTop) {
      if (scrollY > 700) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }

    // Active nav link based on section in view
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (scrollY >= top) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-nav') === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Collapse mobile menu after a link is clicked
  const collapseEl = document.getElementById('navbarContent');
  if (collapseEl && window.bootstrap) {
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (bsCollapse && collapseEl.classList.contains('show')) {
          bsCollapse.hide();
        }
      });
    });
  }

  // Reveal-on-scroll for elements marked .fade-in-up
  const revealTargets = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in-view'));
  }
})();
