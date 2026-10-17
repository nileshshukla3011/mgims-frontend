import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalId, PORTALS } from '@/config/portals';

/**
 * Where a portal opens, for buttons and other click handlers. Links should use <PortalLink> instead, so the address
 * shows on hover and the visitor can open it in a new tab.
 *
 * A portal that runs as a separate application (and has no in-app module) is linked to directly; otherwise the link
 * goes to the portal's route on this website (src/config/portals.ts).
 */
export function usePortal(id: PortalId) {
  const navigate = useNavigate();
  const portal = PORTALS[id];
  const external = !portal.module ? portal.externalUrl : undefined;
  const open = useCallback(() => {
    if (external) window.location.assign(external);
    else navigate(portal.path);
  }, [external, navigate, portal.path]);
  return { portal, href: external ?? portal.path, external: Boolean(external), open };
}
