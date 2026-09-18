/* ============================================
   UTILITIES — shared helper functions
   ============================================ */

const AlpineUtils = (function () {

  /** Format a date string into a readable form, e.g. "14 Aug 2026" */
  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  /** Pad a number for the visitor counter display, e.g. 1248 -> "001,248" */
  function padVisitorCount(num) {
    const str = String(Math.floor(num));
    const padded = str.padStart(6, '0');
    return padded.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /** Simple debounce helper for input events */
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Escape a string for safe HTML insertion */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Render a skeleton loading block set into a container */
  function renderSkeletons(container, count, heightPx) {
    if (!container) return;
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<div class="skeleton mb-3" style="height:${heightPx || 120}px; border-radius:8px;"></div>`;
    }
    container.innerHTML = html;
  }

  /** Render an empty state message into a container */
  function renderEmptyState(container, message, icon) {
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi ${icon || 'bi-search'}"></i>
        <p class="mb-0">${escapeHtml(message)}</p>
      </div>`;
  }

  /** Basic count-up animator for a DOM element */
  function countUp(el, target, duration) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();
    duration = duration || 1600;

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(tick);
  }

  return { formatDate, padVisitorCount, debounce, escapeHtml, renderSkeletons, renderEmptyState, countUp };
})();
