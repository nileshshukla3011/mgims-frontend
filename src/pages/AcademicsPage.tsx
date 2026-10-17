import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  ShieldAlert,
  Cpu,
  Library,
  Users,
  FileCheck,
  Presentation,
  ClipboardCheck,
  Trophy,
  Landmark,
  ListChecks,
  BadgeCheck,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { ReviewContent } from '@/components/content/ReviewContent';
import { StaffListsView } from '@/components/staff/StaffListsView';
import { PublicResults } from '@/components/dynamic/PublicResults';
import { Link } from 'react-router-dom';
import { PortalLink } from '@/components/navigation/PortalLink';

// Anti-ragging was scraped under About Us; merge it in so this page can show it.
const loadAcademics = () =>
  Promise.all([apiService.getAcademics(), apiService.getInstituteInfo()]).then(([academics, institute]) => ({
    ...academics,
    'anti-ragging-committee': institute['anti-ragging-committee'],
  }));

// Hand-written in the earlier design; no matching official page was captured.
const OverviewNote: React.FC = () => (
  <ReviewContent>
    <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
      <p>
        At MGIMS, education goes beyond textbooks and laboratory benches. Doctors are trained not merely to treat diseases,
        but to understand people in their social, cultural and economic contexts.
      </p>
      <p>
        Undergraduate (MBBS), postgraduate (MD/MS) and Ph.D. programmes are affiliated to the Maharashtra University of Health
        Sciences (MUHS), Nashik. Sanctioned intake for each course is listed under Postgraduate Courses (Government Approval).
      </p>
    </div>
  </ReviewContent>
);

// From the official Why MGIMS, Gandhian Principles, Life at Sevagram and Anti-Ragging pages.
const MbbsHallmarks: React.FC = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2 text-xs sm:text-sm">
    <h3 className="font-bold text-sm text-amber-900 font-serif">Hallmarks of MBBS at MGIMS</h3>
    <p><strong>Orientation camp:</strong> new students spend their first 15 days at Gandhiji's ashram in Sevagram.</p>
    <p><strong>Khadi:</strong> students and faculty wear Khadi.</p>
    <p><strong>Adopted village:</strong> midway through the first year, each student is assigned a few families in a village adopted by MGIMS.</p>
    <p><strong>Re-orientation of Medical Education (ROME) camp:</strong> a 15-day camp at the start of the final year.</p>
  </div>
);

const PhdNote: React.FC = () => (
  <ReviewContent>
    <p className="text-xs sm:text-sm text-slate-700">
      Recognised Ph.D. research centres at MGIMS under MUHS: Biochemistry, Microbiology, Community Medicine and Pathology.
    </p>
  </ReviewContent>
);

// Selection through NEET is stated on the official Why MGIMS page; the contact is from the official telephone directory.
const AdmissionsNote: React.FC = () => (
  <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
    <p>Candidates for the medical courses at MGIMS are selected through NEET.</p>
    <p>
      Admissions contact: Mrs Sangeeta Narang, Administrative Officer, Academic Section, Dean Office — 07152-284341 Ext. 207,{' '}
      <a href="mailto:adminofficer@mgims.ac.in" className="font-semibold text-link hover:underline">adminofficer@mgims.ac.in</a>
    </p>
    <div className="flex flex-wrap gap-2 pt-1">
      <PortalLink portal="student" className="inline-flex min-h-11 items-center rounded-lg bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-900">Apply or track an application in the Student Portal</PortalLink>
      <PortalLink portal="fee" className="inline-flex min-h-11 items-center rounded-lg border border-brand-blue bg-white px-4 text-sm font-bold text-link hover:bg-blue-50">Pay fees in the Fee Portal</PortalLink>
    </div>
  </div>
);

const AlumniLink: React.FC = () => (
  <p className="text-sm">
    <Link to="/alumni" className="inline-flex min-h-11 items-center font-semibold text-link underline">Join the MGIMS alumni network and find classmates</Link>
  </p>
);

const sections: SectionConfig[] = [
  { id: 'overview', title: 'Academics overview', icon: BookOpen, heading: 'Medical education overview', index: true, before: <OverviewNote /> },
  { id: 'mbbs', title: 'MBBS degree course', icon: GraduationCap, heading: 'MBBS — undergraduate students', pages: ['ug-students', 'ug-students-final'], before: <MbbsHallmarks /> },
  { id: 'pg', title: 'MD / MS postgraduate courses', icon: Award, heading: 'Postgraduate courses & government approval', subtitle: 'Course-wise recognition status and intake capacity', pages: ['government-approval', 'pg-students', 'pg-students-final'] },
  { id: 'phd', title: 'Ph.D. & fellowships', icon: FileCheck, heading: 'Doctor of Philosophy (Ph.D.)', reviewOnly: true, before: <PhdNote /> },
  { id: 'admissions', title: 'Admissions & affiliation', icon: FileCheck, heading: 'Admissions & affiliation', pages: ['affiliattion'], after: <AdmissionsNote /> },
  { id: 'anti-ragging', title: 'Anti-ragging committee & helpline', icon: ShieldAlert, heading: 'Anti-Ragging', pages: ['anti-ragging-committee'] },
  { id: 'meu', title: 'Medical Education Unit', icon: Presentation, heading: 'Medical Education Unit', pages: ['medical-education-unit'] },
  { id: 'iqac', title: 'IQAC & ethics committee', icon: ClipboardCheck, heading: 'Quality assurance & ethics', pages: ['iqac', 'institutional-ethics-committee'] },
  { id: 'public-health', title: 'School of Public Health', icon: Landmark, heading: 'Dr Sushila Nayar School of Public Health', pages: ['dr-sushila-nayar-school-of-public-health', 'academy-of-medical-sciences'] },
  { id: 'skills-lab', title: 'Centralized skills laboratory', icon: Cpu, heading: 'Centralized skills laboratory', pages: ['centralized-skills-laboratory'] },
  { id: 'library', title: 'Central library', icon: Library, heading: 'Library', pages: ['library', 'campus-wifi'] },
  { id: 'cme', title: 'CMEs, conferences & workshops', icon: Presentation, heading: 'CMEs, conferences, courses & workshops attended', pages: ['cme-attended', 'conference-attended', 'course-attended', 'workshops'] },
  { id: 'activities-conducted', title: 'Academic activities conducted', icon: Presentation, heading: 'Academic activities conducted', pages: ['conferences-workshops-conducted'] },
  { id: 'awards', title: 'Awards & achievements', icon: Trophy, heading: 'Awards & achievements', pages: ['awards-and-achievements', 'student-accolades'] },
  { id: 'student-life', title: 'Student life, alumni & magazine', icon: Users, heading: 'Student life', pages: ['students-activities', 'aaakanksha', 'alumni'], after: <AlumniLink /> },
  { id: 'results', title: 'Examination results', icon: BadgeCheck, heading: 'Examination results', after: <PublicResults /> },
  // The official staff pages embed their lists in sheets (fetched by scripts/fetch_embedded_sheets.py).
  { id: 'staff-lists', title: 'Teaching & non-teaching staff', icon: ListChecks, heading: 'Staff', subtitle: 'Teaching staff, non-teaching staff and senior residents', after: <StaffListsView /> },
];

// Search links and old bookmarks use the scraped site's slugs.
const aliases: Record<string, string> = {
  'ug-students': 'mbbs',
  'ug-students-final': 'mbbs',
  'government-approval': 'pg',
  'pg-students': 'pg',
  'pg-students-final': 'pg',
  'affiliattion': 'admissions',
  'anti-ragging-committee': 'anti-ragging',
  'medical-education-unit': 'meu',
  'institutional-ethics-committee': 'iqac',
  'dr-sushila-nayar-school-of-public-health': 'public-health',
  'academy-of-medical-sciences': 'public-health',
  'centralized-skills-laboratory': 'skills-lab',
  'campus-wifi': 'library',
  'cme-attended': 'cme',
  'cme-attended-showall-1': 'cme',
  'cme-attended-start-1': 'cme',
  'cme-attended-start-2': 'cme',
  'cme-attended-start-3': 'cme',
  'conference-attended': 'cme',
  'course-attended': 'cme',
  'workshops': 'cme',
  'conferences-workshops-conducted': 'activities-conducted',
  'awards-and-achievements': 'awards',
  'student-accolades': 'awards',
  'students-activities': 'student-life',
  'aaakanksha': 'student-life',
  'alumni': 'student-life',
  'faculty': 'staff-lists',
  'senior-residents': 'staff-lists',
  'non-pg-junior-residents': 'staff-lists',
  'non-teaching': 'staff-lists',
};

export const AcademicsPage: React.FC = () => (
  <SectionedPage
    eyebrow="Academic Excellence & Medical Education"
    title="Medical Education & Student Programs"
    description="Undergraduate (MBBS), postgraduate (MD/MS) and Ph.D. programmes affiliated to MUHS, Nashik."
    basePath="/academics"
    navLabel="Academic Portals"
    sections={sections}
    loadPages={loadAcademics}
    aliases={aliases}
  />
);
