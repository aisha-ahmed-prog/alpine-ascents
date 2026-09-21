/* ============================================
   SEARCH — global content search overlay
   ============================================ */

const SearchModule = (function () {
  let index = [];
  let built = false;

  async function buildIndex() {
    if (built) return;
    const [mountains, techniques, styles, organizations, records, stories] = await Promise.all([
      DataLoader.load('mountains').catch(() => []),
      DataLoader.load('techniques').catch(() => []),
      DataLoader.load('styles').catch(() => []),
      DataLoader.load('organizations').catch(() => []),
      DataLoader.load('records').catch(() => []),
      DataLoader.load('stories').catch(() => [])
    ]);

    (mountains || []).forEach((m) => index.push({ type: 'Mountain', title: m.name, sub: m.country, target: '#explorer' }));
    (techniques || []).forEach((t) => index.push({ type: 'Technique', title: t.name, sub: t.summary, target: '#techniques' }));
    (styles || []).forEach((s) => index.push({ type: 'Climbing Style', title: s.name, sub: s.description, target: '#styles' }));
    (organizations || []).forEach((o) => index.push({ type: 'Organization', title: o.name, sub: `${o.city}, ${o.country}`, target: '#expeditions' }));
    (records || []).forEach((r) => index.push({ type: 'Record', title: r.title, sub: r.holder, target: '#records' }));
    (stories || []).forEach((s) => index.push({ type: 'Story', title: s.title, sub: s.location, target: '#expeditions' }));

    built = true;
  }

  function renderResults(query) {
    const resultsEl = document.getElementById('searchResults');
    if (!resultsEl) return;
    if (!query.trim()) {
      resultsEl.innerHTML = '';
      return;
    }
    const q = query.toLowerCase();
    const matches = index.filter((item) => item.title.toLowerCase().includes(q) || (item.sub || '').toLowerCase().includes(q)).slice(0, 12);

    if (!matches.length) {
      resultsEl.innerHTML = `<div class="empty-state" style="color:rgba(247,249,248,0.6);"><i class="bi bi-search"></i>No results for "${AlpineUtils.escapeHtml(query)}"</div>`;
      return;
    }
    resultsEl.innerHTML = matches.map((m) => `
      <a href="${m.target}" data-close-search="true">
        <span class="res-type">${m.type.toUpperCase()}</span><br>
        ${AlpineUtils.escapeHtml(m.title)}
      </a>
    `).join('');
  }

  function open() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (!overlay) return;
    buildIndex().then(() => {
      overlay.classList.add('open');
      setTimeout(() => input && input.focus(), 250);
    });
  }

  function close() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (!overlay) return;
    overlay.classList.remove('open');
    if (input) input.value = '';
    const resultsEl = document.getElementById('searchResults');
    if (resultsEl) resultsEl.innerHTML = '';
  }

  function init() {
    const openBtn = document.getElementById('searchToggle');
    const closeBtn = document.getElementById('searchClose');
    const input = document.getElementById('searchInput');
    const overlay = document.getElementById('searchOverlay');

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (input) input.addEventListener('input', AlpineUtils.debounce((e) => renderResults(e.target.value), 150));

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
        if (e.target.closest('[data-close-search]')) close();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  return { init };
})();
