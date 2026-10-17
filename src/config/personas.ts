// Persona destinations (WEB-IA-3, SRS 4.7): each kind of visitor gets a landing page with the tasks they come for.
// Every link goes to an existing page or to a portal's route; labels are translation keys (src/i18n/services.ts).
import type { LucideIcon } from 'lucide-react';
import type { TaskKey } from '@/i18n/translations';
import {
  Activity, Award, BadgeIndianRupee, BookOpen, Briefcase, Building2, CalendarPlus, CreditCard, Droplet, FileCheck2,
  FileSearch, FileText, FlaskConical, GraduationCap, HandHeart, HeartPulse, History, Landmark, Library, Microscope, Newspaper, PhoneCall,
  Recycle, Scale, School, ShieldAlert, Siren, Stethoscope, UserRound, Users,
} from 'lucide-react';
import { PortalId, PORTALS } from '@/config/portals';

export type PersonaId = 'patients' | 'students' | 'faculty-staff' | 'visitors' | 'regulators';

export interface PersonaConfig {
  id: PersonaId;
  icon: LucideIcon;
  /** Where this persona's "I am a…" card on the home page leads: their portal instead of the persona page. */
  portal?: PortalId;
  tasks: { to: string; key: TaskKey; icon: LucideIcon }[];
  /** Latest notices of this category are listed on the page. */
  noticeCategory?: string;
  /** Show the emergency numbers strip. */
  emergency?: boolean;
  /** Show regulatory updates synced from NMC. */
  regulatory?: boolean;
}

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'patients',
    icon: HeartPulse,
    portal: 'patient',
    emergency: true,
    tasks: [
      { to: PORTALS.patient.path, key: 'patient_portal', icon: UserRound },
      { to: '/hospital/opd', key: 'opd', icon: Stethoscope },
      { to: '/hospital/emergency', key: 'emergency', icon: Siren },
      { to: '/hospital/charges', key: 'charges', icon: BadgeIndianRupee },
      { to: '/hospital/health-insurance', key: 'insurance', icon: HandHeart },
      { to: '/hospital/blood-bank', key: 'blood', icon: Droplet },
      { to: '/about-us/citizen-charter', key: 'charter', icon: FileText },
      { to: '/contact', key: 'inquiry', icon: PhoneCall },
      { to: '/contact/track', key: 'track_inquiry', icon: FileSearch },
    ],
  },
  {
    id: 'students',
    icon: GraduationCap,
    portal: 'student',
    noticeCategory: 'CME & Academic Events',
    tasks: [
      { to: PORTALS.student.path, key: 'student_portal', icon: UserRound },
      { to: PORTALS.fee.path, key: 'fee_portal', icon: CreditCard },
      { to: '/academics/admissions', key: 'admissions_info', icon: School },
      { to: '/academics/mbbs', key: 'mbbs', icon: BookOpen },
      { to: '/academics/pg', key: 'pg', icon: GraduationCap },
      { to: '/academics/results', key: 'results', icon: Award },
      { to: '/academics/anti-ragging', key: 'anti_ragging', icon: ShieldAlert },
      { to: '/academics/library', key: 'library', icon: Library },
      { to: '/academics/meu', key: 'meu', icon: Users },
      { to: '/academics/public-health', key: 'public_health', icon: Building2 },
      { to: '/alumni', key: 'alumni', icon: Users },
    ],
  },
  {
    id: 'faculty-staff',
    icon: Microscope,
    noticeCategory: 'Recruitment',
    tasks: [
      { to: '/faculty', key: 'faculty', icon: Users },
      { to: '/academics/staff-lists', key: 'staff', icon: Users },
      { to: '/research/overview', key: 'research', icon: Microscope },
      { to: '/research/institutional', key: 'funded', icon: FlaskConical },
      { to: '/academics/iqac', key: 'ethics', icon: Scale },
      { to: '/academics/cme', key: 'cme', icon: CalendarPlus },
      { to: '/recruitment', key: 'recruitment', icon: Briefcase },
      { to: '/about-us/compliance', key: 'committees', icon: ShieldAlert },
    ],
  },
  {
    id: 'visitors',
    icon: Landmark,
    noticeCategory: 'News & Events',
    tasks: [
      { to: '/about-us/overview', key: 'about', icon: Landmark },
      { to: '/about-us/history', key: 'history', icon: History },
      { to: '/research/publications', key: 'publications', icon: BookOpen },
      { to: '/research/theses', key: 'theses', icon: GraduationCap },
      { to: '/alumni', key: 'alumni', icon: Users },
      { to: '/community/cbme', key: 'community', icon: HandHeart },
      { to: '/community/seva-bhaav', key: 'seva', icon: HandHeart },
      { to: '/hospital/arogyadham', key: 'arogyadham', icon: HeartPulse },
      { to: '/news', key: 'news', icon: Newspaper },
      { to: '/tenders', key: 'tenders', icon: FileText },
    ],
  },
  {
    id: 'regulators',
    icon: Scale,
    regulatory: true,
    tasks: [
      { to: '/accreditations/nmc', key: 'nmc', icon: FileCheck2 },
      { to: '/accreditations/muhs', key: 'muhs', icon: School },
      { to: '/accreditations/naac', key: 'naac', icon: Award },
      { to: '/accreditations/nirf', key: 'nirf', icon: Award },
      { to: '/about-us/audit-statements', key: 'audit', icon: BadgeIndianRupee },
      { to: '/about-us/annual-reports', key: 'annual_reports', icon: BookOpen },
      { to: '/hospital/bmw', key: 'bmw', icon: Recycle },
      { to: '/hospital/overview', key: 'hospital_numbers', icon: Activity },
      { to: '/about-us/rti', key: 'rti', icon: FileSearch },
      { to: '/about-us/compliance', key: 'committees', icon: ShieldAlert },
    ],
  },
];
