// Portal modules (patient, student and fee) are built by other teams. This website only owns their entry points:
// every link to a portal points at its route below, and that route (src/pages/PortalGateway.tsx) opens the portal
// in the first way that applies:
//   1. `module`: a module built into this app. It is loaded on demand and renders its own nested routes under `path`.
//   2. `externalUrl` (VITE_*_PORTAL_URL in .env): a separate application. The route forwards to it, keeping the rest
//      of the address, so /fee-portal/hostel?ref=1 opens <VITE_FEE_PORTAL_URL>/hostel?ref=1.
//   3. Neither: a placeholder page that says the portal is being connected and links to related pages.
// To plug a portal in, set its address in .env, or add `module: () => import('@/portals/<name>')` below.
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { TaskKey } from '@/i18n/translations';
import { CreditCard, GraduationCap, HeartPulse } from 'lucide-react';

export type PortalId = 'patient' | 'student' | 'fee';

/** Props that an in-app portal module receives. */
export interface PortalModuleProps {
  /** The portal's route, e.g. /patient-portal. The module's own routes are relative to it. */
  basePath: string;
}

export interface PortalConfig {
  id: PortalId;
  /** Route on this website. Every link to the portal uses it. */
  path: string;
  icon: LucideIcon;
  /** Address of the portal when it is a separate application. */
  externalUrl?: string;
  /** A portal module built into this app. */
  module?: () => Promise<{ default: ComponentType<PortalModuleProps> }>;
  /** Existing pages offered on the placeholder page; keys of `hub.task.*` labels. */
  related: { to: string; task: TaskKey }[];
}

const address = (value: string | undefined) => value?.trim().replace(/\/+$/, '') || undefined;

export const PORTALS: Record<PortalId, PortalConfig> = {
  patient: {
    id: 'patient',
    path: '/patient-portal',
    icon: HeartPulse,
    externalUrl: address(import.meta.env.VITE_PATIENT_PORTAL_URL),
    related: [
      { to: '/hospital/opd', task: 'opd' },
      { to: '/hospital/emergency', task: 'emergency' },
      { to: '/hospital/charges', task: 'charges' },
      { to: '/contact', task: 'inquiry' },
    ],
  },
  student: {
    id: 'student',
    path: '/student-portal',
    icon: GraduationCap,
    externalUrl: address(import.meta.env.VITE_STUDENT_PORTAL_URL),
    related: [
      { to: '/academics/admissions', task: 'admissions_info' },
      { to: '/academics/results', task: 'results' },
      { to: '/academics/mbbs', task: 'mbbs' },
      { to: '/contact', task: 'inquiry' },
    ],
  },
  fee: {
    id: 'fee',
    path: '/fee-portal',
    icon: CreditCard,
    externalUrl: address(import.meta.env.VITE_FEE_PORTAL_URL),
    related: [
      { to: '/academics/admissions', task: 'admissions_info' },
      { to: '/hospital/charges', task: 'charges' },
      { to: '/contact', task: 'inquiry' },
    ],
  },
};

export const PORTAL_LIST = Object.values(PORTALS);
