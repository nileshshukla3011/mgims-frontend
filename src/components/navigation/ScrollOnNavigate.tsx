import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Tries for this long to find a #section that renders after its data loads.
const HASH_WAIT_MS = 2000;

/**
 * Scrolling for links inside the site, which the browser does not do by itself in a single-page app: a link to a new
 * page starts at its top, and a link to a #section scrolls there once the section has rendered. Back and Forward
 * keep the browser's own behaviour.
 */
export function ScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === 'POP') return;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const started = Date.now();
    let frame = 0;
    const find = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
      else if (Date.now() - started < HASH_WAIT_MS) frame = requestAnimationFrame(find);
    };
    find();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, navigationType]);
  return null;
}
