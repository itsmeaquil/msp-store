// src/hooks/useTheme.js
// Appearance (System / Light / Dark) preference, persisted to localStorage and
// applied via a data-theme attribute on <html> so index.css tokens can react to it.
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'msp_theme';
const VALID = ['system', 'light', 'dark'];

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage unavailable */ }
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (VALID.includes(next)) setThemeState(next);
  }, []);

  return { theme, setTheme };
}
