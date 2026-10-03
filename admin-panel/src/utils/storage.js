const KEYS = {
  theme: 'YORK_theme',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

/* ---------------------------- Theme ---------------------------- */
/* Dark/light mode preference */

export function getTheme() {
  return read(KEYS.theme, 'light');
}

export function saveTheme(theme) {
  write(KEYS.theme, theme);
}

export { KEYS };