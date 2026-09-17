/* ============================================
   FILTERS — records table & mountain explorer search
   ============================================ */

const FiltersModule = (function () {
  let records = [];
  let mountains = [];

  /* ---------- RECORDS ---------- */
  function renderRecordsTable(list) {
    const tbody = document.getElementById('recordsTableBody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="bi bi-search"></i>No records match these filters.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map((r) => `
      <tr>
        <td><strong>${AlpineUtils.escapeHtml(r.title)}</strong><br><span style="color:var(--muted); font-size:0.82rem;">${AlpineUtils.escapeHtml(r.holder)}</span></td>
        <td>${AlpineUtils.escapeHtml(r.value)}</td>
        <td>${AlpineUtils.escapeHtml(r.category)}</td>
        <td>${AlpineUtils.escapeHtml(r.country)}</td>
      </tr>
    `).join('');
  }

  function populateRecordFilterOptions() {
    const catSelect = document.getElementById('recordCategoryFilter');
    if (!catSelect) return;
    const cats = [...new Set(records.map((r) => r.category))];
    catSelect.innerHTML = '<option value="all">All Categories</option>' +
      cats.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  function applyRecordFilters() {
    const catSelect = document.getElementById('recordCategoryFilter');
    const val = catSelect ? catSelect.value : 'all';
    const filtered = val === 'all' ? records : records.filter((r) => r.category === val);
    renderRecordsTable(filtered);
  }

  async function initRecords() {
    const tbody = document.getElementById('recordsTableBody');
    try {
      records = await DataLoader.load('records');
      populateRecordFilterOptions();
      renderRecordsTable(records);
      const catSelect = document.getElementById('recordCategoryFilter');
      if (catSelect) catSelect.addEventListener('change', applyRecordFilters);
    } catch (e) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i>Records could not be loaded right now.</div></td></tr>`;
    }
  }

  /* ---------- MOUNTAIN EXPLORER ---------- */
  function renderMountains(list) {
    const grid = document.getElementById('mountainsGrid');
    if (!grid) return;
    if (!list.length) {
      AlpineUtils.renderEmptyState(grid, 'No mountains match your search.', 'bi-search');
      return;
    }
    grid.innerHTML = list.map((m) => `
      <div class="col-sm-6 col-lg-4">
        <div class="mountain-card fade-in-up in-view">
          <img src="${m.image}" alt="${AlpineUtils.escapeHtml(m.name)}" loading="lazy">
          <div class="body">
            <h3 class="h6 mb-1">${AlpineUtils.escapeHtml(m.name)}</h3>
            <p class="section-tag-count mb-2">${AlpineUtils.escapeHtml(m.country)}</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="mountain-elevation">${m.elevation.toLocaleString()} m</span>
              <span class="tag-pill">${AlpineUtils.escapeHtml(m.difficulty)}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--muted); margin:0;"><i class="bi bi-calendar3 me-1"></i>${AlpineUtils.escapeHtml(m.season)}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  function applyMountainFilters() {
    const nameVal = (document.getElementById('mountainSearchInput') || {}).value || '';
    const countryVal = (document.getElementById('mountainCountryFilter') || {}).value || 'all';
    const diffVal = (document.getElementById('mountainDifficultyFilter') || {}).value || 'all';

    const filtered = mountains.filter((m) => {
      const matchesName = m.name.toLowerCase().includes(nameVal.toLowerCase()) || m.country.toLowerCase().includes(nameVal.toLowerCase());
      const matchesCountry = countryVal === 'all' || m.country === countryVal;
      const matchesDiff = diffVal === 'all' || m.difficulty === diffVal;
      return matchesName && matchesCountry && matchesDiff;
    });
    renderMountains(filtered);
  }

  function populateMountainFilterOptions() {
    const countrySelect = document.getElementById('mountainCountryFilter');
    const diffSelect = document.getElementById('mountainDifficultyFilter');
    if (countrySelect) {
      const countries = [...new Set(mountains.map((m) => m.country))];
      countrySelect.innerHTML = '<option value="all">All Countries</option>' + countries.map((c) => `<option value="${c}">${c}</option>`).join('');
    }
    if (diffSelect) {
      const diffs = [...new Set(mountains.map((m) => m.difficulty))];
      diffSelect.innerHTML = '<option value="all">All Difficulties</option>' + diffs.map((d) => `<option value="${d}">${d}</option>`).join('');
    }
  }

  async function initMountains() {
    const grid = document.getElementById('mountainsGrid');
    try {
      mountains = await DataLoader.load('mountains');
      populateMountainFilterOptions();
      renderMountains(mountains);

      const searchInput = document.getElementById('mountainSearchInput');
      const countrySelect = document.getElementById('mountainCountryFilter');
      const diffSelect = document.getElementById('mountainDifficultyFilter');
      if (searchInput) searchInput.addEventListener('input', AlpineUtils.debounce(applyMountainFilters, 200));
      if (countrySelect) countrySelect.addEventListener('change', applyMountainFilters);
      if (diffSelect) diffSelect.addEventListener('change', applyMountainFilters);
    } catch (e) {
      AlpineUtils.renderEmptyState(grid, 'Mountain data could not be loaded right now.', 'bi-exclamation-triangle');
    }
  }

  return { initRecords, initMountains };
})();
