import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

/**
 * Signs a session out after a period without activity (WEB-SEC-7). A warning is shown `warningSeconds` before the end
 * so the user can stay signed in; while the warning is open, only the "Stay signed in" button extends the session.
 */
export function useIdleTimeout({ enabled, idleMinutes, warningSeconds = 60, onTimeout }: {
  enabled: boolean;
  idleMinutes: number;
  warningSeconds?: number;
  onTimeout: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivity = useRef(0);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  const stayActive = useCallback(() => {
    lastActivity.current = Date.now();
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    lastActivity.current = Date.now();
    const limit = idleMinutes * 60_000;
    const onActivity = () => {
      // Activity counts only until the warning appears.
      if (Date.now() - lastActivity.current < limit - warningSeconds * 1000) lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const timer = window.setInterval(() => {
      const left = Math.ceil((limit - (Date.now() - lastActivity.current)) / 1000);
      if (left <= 0) {
        setSecondsLeft(null);
        onTimeoutRef.current();
      } else setSecondsLeft(left <= warningSeconds ? left : null);
    }, 1000);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(timer);
    };
  }, [enabled, idleMinutes, warningSeconds]);

  return { secondsLeft, stayActive };
}
