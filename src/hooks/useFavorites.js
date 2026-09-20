// src/hooks/useFavorites.js
// Wishlist / favorites for accessories, persisted to localStorage per-browser.
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'msp_favorites';

function readStoredFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStoredFavorites);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); } catch { /* storage unavailable */ }
  }, [favorites]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
