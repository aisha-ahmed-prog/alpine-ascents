/* ============================================
   APP — main orchestration: preloader, theme,
   visitor counter, ticker, and section rendering
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      if (preloader) preloader.classList.add('hidden');
    }, 500);
  });
  // Failsafe in case 'load' fires very late
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 3500);

  /* ---------- THEME TOGGLE ---------- */
  (function themeInit() {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('alpine-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggle) toggle.classList.replace('bi-moon-stars', 'bi-sun');
    }
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('alpine-theme', 'light');
          toggle.classList.replace('bi-sun', 'bi-moon-stars');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('alpine-theme', 'dark');
          toggle.classList.replace('bi-moon-stars', 'bi-sun');
        }
      });
    }
  })();

  /* ---------- VISITOR COUNTER ---------- */
  (function visitorCounter() {
    const el = document.getElementById('visitorCount');
    if (!el) return;
    let count = parseInt(localStorage.getItem('alpine-visitor-count') || '1248', 10);
    if (!sessionStorage.getItem('alpine-visited-session')) {
      count += 1;
      localStorage.setItem('alpine-visitor-count', String(count));
      sessionStorage.setItem('alpine-visited-session', 'true');
    }
    el.textContent = AlpineUtils.padVisitorCount(count);
  })();

  /* ---------- DATE / TIME / GEOLOCATION TICKER ---------- */
  (function ticker() {
    const dateEl = document.getElementById('tickerDate');
    const timeEl = document.getElementById('tickerTime');
    const locEl = document.getElementById('tickerLocation');

    function updateClock() {
      const now = new Date();
      if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);

    if (locEl) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
              const data = await res.json();
              const addr = data.address || {};
              const place = addr.city || addr.town || addr.village || addr.state || 'Nearby area';
              const country = addr.country || '';
              locEl.textContent = `${place}${country ? ', ' + country : ''}`;
            } catch (e) {
              locEl.textContent = 'Location unavailable';
            }
          },
          () => { locEl.textContent = 'Location unavailable'; },
          { timeout: 8000 }
        );
      } else {
        locEl.textContent = 'Location unavailable';
      }
    }
  })();

  /* ---------- STATS COUNTER ---------- */
  (async function statsInit() {
    const strip = document.getElementById('statsStrip');
    if (!strip) return;
    try {
      const stats = await DataLoader.load('stats');
      strip.innerHTML = stats.map((s, i) => `
        <div class="col-6 col-md-3 stat-item">
          <div class="stat-value"><span data-count="${s.value}" id="statVal${i}">0</span>${s.suffix}</div>
          <div class="stat-label">${AlpineUtils.escapeHtml(s.label)}</div>
        </div>
      `).join('');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((s, i) => AlpineUtils.countUp(document.getElementById('statVal' + i), s.value));
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      observer.observe(strip);
    } catch (e) {
      strip.innerHTML = '<div class="empty-state text-light"><i class="bi bi-exclamation-triangle"></i>Statistics unavailable right now.</div>';
    }
  })();

  /* ---------- HISTORY TIMELINE ---------- */
  (async function historyInit() {
    const container = document.getElementById('historyTimeline');
    if (!container) return;
    AlpineUtils.renderSkeletons(container, 3, 90);
    try {
      const history = await DataLoader.load('history');
      container.innerHTML = history.map((h) => `
        <div class="timeline-item fade-in-up">
          <div class="timeline-year">${AlpineUtils.escapeHtml(h.year)}</div>
          <h3>${AlpineUtils.escapeHtml(h.title)}</h3>
          <p>${AlpineUtils.escapeHtml(h.text)}</p>
        </div>
      `).join('');
      observeReveal(container);
    } catch (e) {
      AlpineUtils.renderEmptyState(container, 'History timeline could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- CLIMBING STYLES ---------- */
  (async function stylesInit() {
    const grid = document.getElementById('stylesGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 4, 300);
    try {
      const styles = await DataLoader.load('styles');
      grid.innerHTML = styles.map((s) => `
        <div class="col-sm-6 col-lg-3">
          <div class="style-card fade-in-up">
            <div class="img-wrap"><img src="${s.image}" alt="${AlpineUtils.escapeHtml(s.name)}" loading="lazy"></div>
            <div class="body">
              <h3 class="h6 mb-2">${AlpineUtils.escapeHtml(s.name)}</h3>
              <p style="font-size:0.85rem; color:var(--muted);">${AlpineUtils.escapeHtml(s.description)}</p>
              <div class="mb-2"><span class="tag-pill">${AlpineUtils.escapeHtml(s.difficulty)}</span></div>
              <button class="btn-line btn-style-detail" data-id="${s.id}">Learn More <i class="bi bi-arrow-up-right"></i></button>
            </div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);

      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-style-detail');
        if (!btn) return;
        const item = styles.find((s) => s.id === btn.getAttribute('data-id'));
        if (item) showDetailModal(item.name, `
          <img src="${item.image}" class="w-100 mb-3" style="border-radius:8px; max-height:280px; object-fit:cover;" alt="${AlpineUtils.escapeHtml(item.name)}">
          <p><strong>Difficulty:</strong> ${AlpineUtils.escapeHtml(item.difficulty)} &nbsp;|&nbsp; <strong>Environment:</strong> ${AlpineUtils.escapeHtml(item.environment)}</p>
          <p>${AlpineUtils.escapeHtml(item.description)}</p>
        `);
      });
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Climbing styles could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- TECHNIQUES TABS ---------- */
  (async function techniquesInit() {
    const tabWrap = document.getElementById('techTabs');
    const panel = document.getElementById('techDetailPanel');
    if (!tabWrap || !panel) return;
    try {
      const techniques = await DataLoader.load('techniques');
      tabWrap.innerHTML = techniques.map((t, i) => `
        <button class="tech-tab-btn ${i === 0 ? 'active' : ''}" data-id="${t.id}">${AlpineUtils.escapeHtml(t.name)}</button>
      `).join('');

      function renderPanel(t) {
        panel.innerHTML = `
          <i class="bi ${t.icon} mb-3 d-block"></i>
          <h3 class="h4 mb-2">${AlpineUtils.escapeHtml(t.name)}</h3>
          <p style="color:var(--muted);">${AlpineUtils.escapeHtml(t.detail)}</p>
        `;
      }
      renderPanel(techniques[0]);

      tabWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.tech-tab-btn');
        if (!btn) return;
        tabWrap.querySelectorAll('.tech-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const item = techniques.find((t) => t.id === btn.getAttribute('data-id'));
        if (item) renderPanel(item);
      });
    } catch (e) {
      AlpineUtils.renderEmptyState(panel, 'Techniques could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- SHELTERING ---------- */
  (async function shelteringInit() {
    const grid = document.getElementById('shelterGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 3, 260);
    try {
      const shelters = await DataLoader.load('sheltering');
      grid.innerHTML = shelters.map((s) => `
        <div class="col-sm-6 col-lg-4">
          <div class="shelter-card fade-in-up">
            <img src="${s.image}" alt="${AlpineUtils.escapeHtml(s.name)}" loading="lazy">
            <div class="shelter-overlay">
              <div>
                <h3 class="h6 mb-1">${AlpineUtils.escapeHtml(s.name)}</h3>
                <p class="mb-0" style="font-size:0.82rem; opacity:0.85;">${AlpineUtils.escapeHtml(s.description)}</p>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Shelter information could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- HAZARDS ---------- */
  (async function hazardsInit() {
    const grid = document.getElementById('hazardsGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 4, 220);
    try {
      const hazards = await DataLoader.load('hazards');
      const riskClass = { Severe: 'risk-severe', High: 'risk-high', Moderate: 'risk-moderate' };
      grid.innerHTML = hazards.map((h) => `
        <div class="col-sm-6 col-lg-3">
          <div class="hazard-card fade-in-up">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <i class="bi ${h.icon}"></i>
              <span class="risk-badge ${riskClass[h.risk] || 'risk-moderate'}">${h.risk.toUpperCase()}</span>
            </div>
            <h3 class="h6 mb-1">${AlpineUtils.escapeHtml(h.name)}</h3>
            <p>${AlpineUtils.escapeHtml(h.description)}</p>
            <div class="prevention"><i class="bi bi-shield-check me-1"></i>${AlpineUtils.escapeHtml(h.prevention)}</div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Hazard information could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- EXPEDITION SUCCESS STORIES ---------- */
  (async function storiesInit() {
    const grid = document.getElementById('storiesGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 3, 320);
    try {
      const stories = await DataLoader.load('stories');
      grid.innerHTML = stories.map((s) => `
        <div class="col-lg-4">
          <div class="story-card fade-in-up">
            <div class="img-wrap"><img src="${s.image}" alt="${AlpineUtils.escapeHtml(s.title)}" loading="lazy"></div>
            <div class="body">
              <p class="section-tag-count mb-1"><i class="bi bi-geo-alt me-1"></i>${AlpineUtils.escapeHtml(s.location)} &middot; ${AlpineUtils.escapeHtml(s.date)}</p>
              <h3 class="h6 mb-2">${AlpineUtils.escapeHtml(s.title)}</h3>
              <p style="font-size:0.88rem; color:var(--muted);">${AlpineUtils.escapeHtml(s.excerpt)}</p>
              <button class="btn-line btn-story-detail" data-id="${s.id}">Read Story <i class="bi bi-arrow-up-right"></i></button>
            </div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);

      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-story-detail');
        if (!btn) return;
        const item = stories.find((s) => s.id === btn.getAttribute('data-id'));
        if (item) showDetailModal(item.title, `
          <img src="${item.image}" class="w-100 mb-3" style="border-radius:8px; max-height:300px; object-fit:cover;" alt="${AlpineUtils.escapeHtml(item.title)}">
          <p class="section-tag-count mb-2">${AlpineUtils.escapeHtml(item.location)} &middot; ${AlpineUtils.escapeHtml(item.date)} &middot; ${AlpineUtils.escapeHtml(item.team)} &middot; ${AlpineUtils.escapeHtml(item.difficulty)}</p>
          <p>${AlpineUtils.escapeHtml(item.full)}</p>
        `);
      });
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Expedition stories could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- VIDEOS ---------- */
  (async function videosInit() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 3, 260);
    try {
      const videos = await DataLoader.load('videos');
      grid.innerHTML = videos.map((v) => `
        <div class="col-md-6 col-lg-4">
          <div class="video-card fade-in-up">
            <div class="video-thumb" data-yt="${v.youtubeId}">
              <img src="https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg" alt="${AlpineUtils.escapeHtml(v.title)}" loading="lazy">
              <div class="play-btn"><i class="bi bi-play-circle-fill"></i></div>
            </div>
            <div class="body p-3">
              <h3 class="h6 mb-1">${AlpineUtils.escapeHtml(v.title)}</h3>
              <p style="font-size:0.85rem; color:var(--muted); margin:0;">${AlpineUtils.escapeHtml(v.description)}</p>
            </div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);

      grid.addEventListener('click', (e) => {
        const thumb = e.target.closest('.video-thumb');
        if (!thumb) return;
        const ytId = thumb.getAttribute('data-yt');
        showDetailModal('', `
          <div class="ratio ratio-16x9">
            <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" title="Video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        `, true);
      });
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Videos could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- LATEST DEVELOPMENTS ---------- */
  (async function developmentsInit() {
    const grid = document.getElementById('developmentsGrid');
    const searchInput = document.getElementById('devSearchInput');
    const catSelect = document.getElementById('devCategoryFilter');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 4, 260);
    let developments = [];

    function render(list) {
      if (!list.length) {
        AlpineUtils.renderEmptyState(grid, 'No developments match your search.', 'bi-newspaper');
        return;
      }
      grid.innerHTML = list.map((d) => `
        <div class="col-sm-6 col-lg-3">
          <div class="dev-card fade-in-up in-view">
            <img src="${d.image}" alt="${AlpineUtils.escapeHtml(d.title)}" loading="lazy">
            <div class="body">
              <div class="dev-meta"><span>${AlpineUtils.escapeHtml(d.category)}</span><span>${AlpineUtils.formatDate(d.date)}</span></div>
              <h3 class="h6 mb-2">${AlpineUtils.escapeHtml(d.title)}</h3>
              <p style="font-size:0.85rem; color:var(--muted);">${AlpineUtils.escapeHtml(d.summary)}</p>
              <button class="btn-line btn-dev-detail" data-id="${d.id}">Read More <i class="bi bi-arrow-up-right"></i></button>
            </div>
          </div>
        </div>
      `).join('');
    }

    function applyFilters() {
      const q = (searchInput && searchInput.value || '').toLowerCase();
      const cat = catSelect ? catSelect.value : 'all';
      const filtered = developments.filter((d) => {
        const matchesQ = d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q);
        const matchesCat = cat === 'all' || d.category === cat;
        return matchesQ && matchesCat;
      });
      render(filtered);
    }

    try {
      developments = await DataLoader.load('developments');
      if (catSelect) {
        const cats = [...new Set(developments.map((d) => d.category))];
        catSelect.innerHTML = '<option value="all">All Categories</option>' + cats.map((c) => `<option value="${c}">${c}</option>`).join('');
      }
      render(developments);

      if (searchInput) searchInput.addEventListener('input', AlpineUtils.debounce(applyFilters, 200));
      if (catSelect) catSelect.addEventListener('change', applyFilters);

      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-dev-detail');
        if (!btn) return;
        const item = developments.find((d) => d.id === btn.getAttribute('data-id'));
        if (item) showDetailModal(item.title, `
          <img src="${item.image}" class="w-100 mb-3" style="border-radius:8px; max-height:280px; object-fit:cover;" alt="${AlpineUtils.escapeHtml(item.title)}">
          <p class="dev-meta mb-3"><span>${AlpineUtils.escapeHtml(item.category)}</span><span>${AlpineUtils.formatDate(item.date)}</span></p>
          <p>${AlpineUtils.escapeHtml(item.summary)}</p>
        `);
      });
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Latest developments could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- GUIDELINES CHECKLIST ---------- */
  (async function guidelinesInit() {
    const list = document.getElementById('guidelinesChecklist');
    if (!list) return;
    try {
      const guidelines = await DataLoader.load('guidelines');
      const saved = JSON.parse(localStorage.getItem('alpine-checklist') || '{}');
      list.innerHTML = guidelines.map((g) => `
        <li>
          <input type="checkbox" id="chk-${g.id}" data-id="${g.id}" ${saved[g.id] ? 'checked' : ''}>
          <label for="chk-${g.id}">
            <span class="gl-cat">${AlpineUtils.escapeHtml(g.category)}</span>
            <span class="gl-text">${AlpineUtils.escapeHtml(g.text)}</span>
          </label>
        </li>
      `).join('');

      list.addEventListener('change', (e) => {
        const cb = e.target.closest('input[type="checkbox"]');
        if (!cb) return;
        const state = JSON.parse(localStorage.getItem('alpine-checklist') || '{}');
        state[cb.getAttribute('data-id')] = cb.checked;
        localStorage.setItem('alpine-checklist', JSON.stringify(state));
      });

      const printBtn = document.getElementById('printChecklistBtn');
      if (printBtn) printBtn.addEventListener('click', () => window.print());
    } catch (e) {
      AlpineUtils.renderEmptyState(list, 'Guidelines could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- EQUIPMENT / ESSENTIAL GEAR ---------- */
  (async function equipmentInit() {
    const grid = document.getElementById('equipmentGrid');
    if (!grid) return;
    AlpineUtils.renderSkeletons(grid, 4, 140);
    try {
      const equipment = await DataLoader.load('equipment');
      grid.innerHTML = equipment.map((e) => `
        <div class="col-sm-6 col-lg-3">
          <div class="gear-card fade-in-up">
            <div class="body">
              <span class="tag-pill mb-2 d-inline-block">${AlpineUtils.escapeHtml(e.category)}</span>
              <h3 class="h6 mb-1">${AlpineUtils.escapeHtml(e.name)}</h3>
              <p style="font-size:0.85rem; color:var(--muted); margin-bottom:0.4rem;">${AlpineUtils.escapeHtml(e.purpose)}</p>
              <span style="font-size:0.75rem; font-weight:600; color:var(--forest);">${AlpineUtils.escapeHtml(e.importance)}</span>
            </div>
          </div>
        </div>
      `).join('');
      observeReveal(grid);
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Equipment list could not be loaded.', 'bi-exclamation-triangle');
    }
  })();

  /* ---------- EXPEDITION CONDITIONS ---------- */
  (async function conditionsInit() {
    const card = document.getElementById('conditionsCard');
    if (!card) return;
    try {
      const c = await DataLoader.load('conditions');
      card.innerHTML = `
        <p class="eyebrow mb-1">${AlpineUtils.escapeHtml(c.note)}</p>
        <h3 class="h5 mb-0" style="color:var(--snow);">${AlpineUtils.escapeHtml(c.location)}</h3>
        <div class="conditions-grid">
          <div><div class="val">${AlpineUtils.escapeHtml(c.temperature)}</div><div class="lbl">Temperature</div></div>
          <div><div class="val">${AlpineUtils.escapeHtml(c.wind)}</div><div class="lbl">Wind</div></div>
          <div><div class="val">${AlpineUtils.escapeHtml(c.visibility)}</div><div class="lbl">Visibility</div></div>
          <div><div class="val" style="font-size:1rem;">${AlpineUtils.escapeHtml(c.conditions)}</div><div class="lbl">Conditions</div></div>
        </div>
        <p style="color:rgba(247,249,248,0.75); margin:0;"><i class="bi bi-info-circle me-1"></i>${AlpineUtils.escapeHtml(c.recommendation)}</p>
      `;
    } catch (e) {
      card.innerHTML = '<div class="empty-state text-light"><i class="bi bi-exclamation-triangle"></i>Conditions data unavailable right now.</div>';
    }
  })();

  /* ---------- NEWSLETTER ---------- */
  (function newsletterInit() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const msg = document.getElementById('newsletterMsg');
      if (emailInput && emailInput.checkValidity() && msg) {
        msg.textContent = 'Thanks — you are on the list for mountain stories.';
        msg.classList.remove('d-none');
        form.reset();
      }
    });
  })();

  /* ---------- SHARED: reveal observer for dynamically injected content ---------- */
  function observeReveal(container) {
    const targets = container.querySelectorAll('.fade-in-up');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      targets.forEach((el) => observer.observe(el));
    } else {
      targets.forEach((el) => el.classList.add('in-view'));
    }
  }

  /* ---------- SHARED: generic detail modal ---------- */
  function showDetailModal(title, bodyHtml, noPadding) {
    const modalEl = document.getElementById('detailModal');
    if (!modalEl || !window.bootstrap) return;
    modalEl.querySelector('.modal-title').textContent = title;
    modalEl.querySelector('.modal-title').style.display = title ? '' : 'none';
    modalEl.querySelector('.modal-body').innerHTML = bodyHtml;
    modalEl.querySelector('.modal-body').style.padding = noPadding ? '0' : '';
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.querySelector('.modal-body').innerHTML = '';
    }, { once: true });
  }
  window.showDetailModal = showDetailModal;

  /* ---------- INIT MODULES ---------- */
  GalleryModule.init();
  MapModule.init();
  FiltersModule.initRecords();
  FiltersModule.initMountains();
  SearchModule.init();
});
