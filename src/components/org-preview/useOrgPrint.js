import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { baseUrl } from '../../api/api';
import { orgEndpoints } from '../../api/orgEndpoints';
import { orgAuthHeaders } from '../org/orgAuth.js';

// Org print queue hook.
//
// Keeps the dashboard's print queue live: the server pushes `print:queue-updated`
// over the org socket room whenever anything changes (new job, claim, printed,
// failed, reordered, cancelled). On (re)connect we refetch the queue as a
// catch-up so a dropped socket never loses state. Mutations go through REST.
const useOrgPrint = (token) => {
  const [queue, setQueue] = useState({ queue: [], history: [] });
  const [loading, setLoading] = useState(false);
  const [socketOnline, setSocketOnline] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const fetchQueue = useCallback(async (silent = false) => {
    if (!tokenRef.current) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(orgEndpoints.printQueue, {
        headers: orgAuthHeaders(tokenRef.current),
      });
      const data = await res.json();
      if (data.success) {
        setQueue({ queue: data.queue || [], history: data.history || [] });
      } else {
        setError(data.message || 'Failed to load print queue');
      }
    } catch (err) {
      setError(err.message || 'Failed to load print queue');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Socket lifecycle: connect with the org JWT; the server places us in the
  // org's dashboard room and pushes queue updates from there.
  useEffect(() => {
    if (!tokenRef.current) return undefined;

    const socket = io(baseUrl, {
      auth: { token: tokenRef.current },
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketOnline(true);
      setError('');
      fetchQueue(true); // catch-up after (re)connect
    });
    socket.on('disconnect', () => setSocketOnline(false));
    socket.on('connect_error', () => setSocketOnline(false));

    socket.on('print:queue-updated', () => fetchQueue(true));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchQueue]);

  const toggleAutoPrint = useCallback(async (enabled) => {
    try {
      const res = await fetch(orgEndpoints.autoPrint, {
        method: 'POST',
        headers: { ...orgAuthHeaders(tokenRef.current), 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update Auto Print');
      return { success: true, enabled: data.autoPrint?.enabled ?? enabled };
    } catch (err) {
      setError(err.message);
      return { success: false, enabled };
    }
  }, []);

  const moveJob = useCallback(async (id, direction) => {
    const res = await fetch(orgEndpoints.printMove(id), {
      method: 'POST',
      headers: { ...orgAuthHeaders(tokenRef.current), 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Failed to move job');
      return false;
    }
    return true;
  }, []);

  const cancelJob = useCallback(async (id) => {
    const res = await fetch(orgEndpoints.printCancel(id), {
      method: 'POST',
      headers: orgAuthHeaders(tokenRef.current),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Failed to cancel job');
      return false;
    }
    return true;
  }, []);

  const retryJob = useCallback(async (id) => {
    const res = await fetch(orgEndpoints.printRetry(id), {
      method: 'POST',
      headers: orgAuthHeaders(tokenRef.current),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Failed to retry job');
      return false;
    }
    return true;
  }, []);

  return { queue, loading, socketOnline, error, fetchQueue, toggleAutoPrint, moveJob, cancelJob, retryJob };
};

export default useOrgPrint;
