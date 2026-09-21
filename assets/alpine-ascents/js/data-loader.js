/* ============================================
   DATA LOADER — fetches and caches JSON data
   ============================================ */

const DataLoader = (function () {
  const cache = {};

  /**
   * Load a JSON file from the data/ directory, caching the result.
   * Returns a Promise resolving to the parsed JSON, or rejecting on failure.
   */
  function load(name) {
    if (cache[name]) {
      return Promise.resolve(cache[name]);
    }
    return fetch(`data/${name}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${name}.json (${res.status})`);
        return res.json();
      })
      .then((data) => {
        cache[name] = data;
        return data;
      })
      .catch((err) => {
        console.error('[DataLoader]', err.message);
        throw err;
      });
  }

  /** Load several JSON files at once, keyed by name */
  function loadAll(names) {
    return Promise.all(names.map((n) => load(n).catch(() => null)))
      .then((results) => {
        const out = {};
        names.forEach((n, i) => { out[n] = results[i]; });
        return out;
      });
  }

  return { load, loadAll };
})();
