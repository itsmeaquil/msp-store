// src/hooks/useRepairTicket.js
// Real-time Firestore listener for a repair ticket by ticketId string
import { useState, useEffect, useRef } from 'react';
import { subscribeToTicket } from '../firebase/firestoreService';

export function useRepairTicket(ticketId) {
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    // Clean up previous listener
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const formattedId = ticketId.trim().toUpperCase();

    unsubRef.current = subscribeToTicket(formattedId, (data) => {
      if (data) {
        setTicket(data);
        setError(null);
      } else {
        setTicket(null);
        setError('No ticket found with that ID. Please check and try again.');
      }
      setLoading(false);
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [ticketId]);

  return { ticket, loading, error };
}
