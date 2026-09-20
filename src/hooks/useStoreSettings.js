// src/hooks/useStoreSettings.js
import { useState, useEffect } from 'react';
import { subscribeToStoreSettings, getDefaultStoreSettings } from '../firebase/firestoreService';

export function useStoreSettings() {
  const [settings, setSettings] = useState(getDefaultStoreSettings);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = subscribeToStoreSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { settings, loading };
}
