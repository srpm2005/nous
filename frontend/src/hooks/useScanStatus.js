import { useState, useEffect, useRef } from 'react';
import { getScanStatus } from '../services/api';

/**
 * Custom React Hook to poll scan status asynchronously until a terminal state is reached.
 * @param {string|null} scanId - The active scan UUID to monitor.
 * @param {number} intervalMs - Polling frequency in milliseconds (default: 1500ms).
 * @param {Function} [onComplete] - Optional callback triggered when status reaches terminal state.
 */
export function useScanStatus(scanId, intervalMs = 1500, onComplete = null) {
  const [scanState, setScanState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!scanId) {
      setScanState(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    const poll = async () => {
      try {
        const data = await getScanStatus(scanId);
        if (!isSubscribed) return;

        setScanState(data);
        setLoading(false);

        // Check if scan has reached terminal state (COMPLETE, PARTIAL, FAILED)
        if (data && (data.status === 'COMPLETE' || data.status === 'PARTIAL' || data.status === 'FAILED')) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (onCompleteRef.current) {
            onCompleteRef.current(data);
          }
        }
      } catch (err) {
        if (!isSubscribed) return;
        setError(err.message || 'Failed to fetch scan status');
        setLoading(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    // Run first query immediately
    poll();

    // Setup periodic polling interval
    timerRef.current = setInterval(poll, intervalMs);

    // Cleanup function when component unmounts or scanId changes
    return () => {
      isSubscribed = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scanId, intervalMs]);

  return { scanState, loading, error };
}
