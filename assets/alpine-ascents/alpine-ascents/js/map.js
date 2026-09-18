/* ============================================
   MAP — Leaflet + OpenStreetMap organization markers
   ============================================ */

const MapModule = (function () {

  function renderOrgCards(orgs) {
    const wrap = document.getElementById('orgCardsGrid');
    if (!wrap) return;
    wrap.innerHTML = orgs.map((org) => `
      <div class="col-md-6 col-lg-4">
        <div class="org-card fade-in-up">
          <img class="logo" src="${org.logo}" alt="${AlpineUtils.escapeHtml(org.name)} logo" loading="lazy">
          <div class="body">
            <h3 class="h5">${AlpineUtils.escapeHtml(org.name)}</h3>
            <p class="section-tag-count mb-2"><i class="bi bi-geo-alt me-1"></i>${AlpineUtils.escapeHtml(org.city)}, ${AlpineUtils.escapeHtml(org.country)}</p>
            <p class="mb-3" style="color:var(--muted); font-size:0.92rem;">${AlpineUtils.escapeHtml(org.description)}</p>
            <a href="${org.website}" target="_blank" rel="noopener" class="btn-line">Explore <i class="bi bi-arrow-up-right"></i></a>
          </div>
        </div>
      </div>
    `).join('');

    // Re-observe new fade elements
    document.querySelectorAll('#orgCardsGrid .fade-in-up').forEach((el) => el.classList.add('in-view'));
  }

  function initMap(orgs) {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl || !window.L) return;

    const map = L.map('leaflet-map', { scrollWheelZoom: false }).setView([20, 10], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    const goldIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:16px;height:16px;background:#D6A84F;border:2px solid #0B1F2A;border-radius:50%;"></div>',
      iconSize: [16, 16]
    });

    orgs.forEach((org) => {
      L.marker([org.lat, org.lng], { icon: goldIcon }).addTo(map)
        .bindPopup(`
          <strong>${AlpineUtils.escapeHtml(org.name)}</strong><br>
          ${AlpineUtils.escapeHtml(org.city)}, ${AlpineUtils.escapeHtml(org.country)}<br>
          <span style="font-size:0.85rem;">${AlpineUtils.escapeHtml(org.description)}</span>
        `);
    });

    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
  }

  async function init() {
    try {
      const orgs = await DataLoader.load('organizations');
      renderOrgCards(orgs);
      initMap(orgs);
    } catch (e) {
      const wrap = document.getElementById('orgCardsGrid');
      AlpineUtils.renderEmptyState(wrap, 'Organizations could not be loaded right now.', 'bi-exclamation-triangle');
    }
  }

  return { init };
})();
