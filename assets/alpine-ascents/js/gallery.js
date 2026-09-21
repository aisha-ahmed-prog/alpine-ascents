/* ============================================
   GALLERY — masonry grid, category filters, lightbox
   ============================================ */

const GalleryModule = (function () {
  let items = [];
  let lightbox = null;

  function render(list) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    if (!list.length) {
      AlpineUtils.renderEmptyState(grid, 'No images match this category yet.', 'bi-images');
      return;
    }
    grid.innerHTML = list.map((item) => `
      <a class="gallery-item glightbox" href="${item.image}" data-gallery="alpine-gallery" data-category="${item.category}">
        <img src="${item.image}" alt="${AlpineUtils.escapeHtml(item.caption)}" loading="lazy">
        <span class="caption">${AlpineUtils.escapeHtml(item.caption)}</span>
      </a>
    `).join('');

    if (window.GLightbox) {
      if (lightbox) lightbox.destroy();
      lightbox = GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
    }
  }

  function initFilters() {
    const filterBar = document.getElementById('galleryFilters');
    if (!filterBar) return;
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-filter');
      const filtered = val === 'all' ? items : items.filter((i) => i.category === val);
      render(filtered);
    });
  }

  async function init() {
    try {
      items = await DataLoader.load('gallery');
      render(items);
      initFilters();
    } catch (e) {
      const grid = document.getElementById('galleryGrid');
      AlpineUtils.renderEmptyState(grid, 'Gallery could not be loaded right now.', 'bi-exclamation-triangle');
    }
  }

  return { init };
})();
