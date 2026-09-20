// src/hooks/useAccessories.js
import { useState, useEffect } from 'react';
import { subscribeToAccessories } from '../firebase/firestoreService';

export function useAccessories(category = 'All') {
  const [accessories, setAccessories] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = subscribeToAccessories(category, (data) => {
      setAccessories(data);
      setLoading(false);
    });

    return unsub;
  }, [category]);

  return { accessories, loading, error };
}
