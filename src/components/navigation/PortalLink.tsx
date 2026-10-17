import React from 'react';
import { Link } from 'react-router-dom';
import { PortalId } from '@/config/portals';
import { usePortal } from '@/hooks/usePortal';

type PortalLinkProps = { portal: PortalId } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

/** A link to a portal: to its route on this website, or straight to the portal when it is a separate application. */
export const PortalLink: React.FC<PortalLinkProps> = ({ portal, children, ...rest }) => {
  const { href, external } = usePortal(portal);
  return external ? <a href={href} {...rest}>{children}</a> : <Link to={href} {...rest}>{children}</Link>;
};
