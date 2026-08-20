import { useState, useEffect, useRef } from 'react';
import { getScanStatus, API_BASE } from '../services/api';

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
  const eventSourceRef = useRef(null);
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

    const handleUpdate = (data) => {
      if (!isSubscribed) return;
      setScanState(data);
      setLoading(false);

      if (data && (data.status === 'COMPLETE' || data.status === 'PARTIAL' || data.status === 'FAILED')) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        if (onCompleteRef.current) {
          onCompleteRef.current(data);
        }
      }
    };

    const poll = async () => {
      try {
        const data = await getScanStatus(scanId);
        handleUpdate(data);
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

    // Try EventSource (SSE) first for instant streaming updates
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        const es = new EventSource(`${API_BASE}/api/scans/${scanId}/events`);
        eventSourceRef.current = es;

        es.addEventListener('status', (evt) => {
          try {
            const data = JSON.parse(evt.data);
            handleUpdate(data);
          } catch {
            // Ignore parse errors
          }
        });

        es.onerror = () => {
          // SSE failed or timed out — close stream and fallback to polling interval
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          if (!timerRef.current && isSubscribed) {
            poll();
            timerRef.current = setInterval(poll, intervalMs);
          }
        };
      } catch {
        // EventSource creation failed, fallback to polling
        poll();
        timerRef.current = setInterval(poll, intervalMs);
      }
    } else {
      // EventSource not supported in browser, fallback to polling
      poll();
      timerRef.current = setInterval(poll, intervalMs);
    }

    return () => {
      isSubscribed = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [scanId, intervalMs]);

  return { scanState, loading, error };
}
