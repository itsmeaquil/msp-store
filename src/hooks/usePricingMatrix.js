// src/hooks/usePricingMatrix.js
import { useState, useEffect } from 'react';
import { subscribeToPricingMatrix } from '../firebase/firestoreService';
import { DEFAULT_PRICE_MATRIX } from '../data/repairPrices';

export function usePricingMatrix() {
  const [matrix,  setMatrix]  = useState(DEFAULT_PRICE_MATRIX);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPricingMatrix((data) => {
      setMatrix(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { matrix, loading };
}
