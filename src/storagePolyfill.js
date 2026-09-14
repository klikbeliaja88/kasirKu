// Polyfills the window.storage API that KasirKU-POS.jsx was originally built
// against (an artifact-only feature in Claude.ai). This makes the exact same
// App.jsx work in any normal browser, backed by localStorage instead.
// If you later add a real backend, replace this file's internals with fetch()
// calls to your API instead of localStorage - the App component itself
// does not need to change.

const PREFIX = "kasirku:";

window.storage = {
  async get(key) {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) {
      throw new Error(`Key not found: ${key}`);
    }
    return { key, value: raw, shared: false };
  },

  async set(key, value) {
    localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  },

  async delete(key) {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },

  async list(prefix) {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length))
      .filter((k) => !prefix || k.startsWith(prefix));
    return { keys };
  },
};
