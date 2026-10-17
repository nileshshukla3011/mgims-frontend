import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useCurrentCrumbLabel } from '@/hooks/useCrumbLabel';

// URL segments that are not plain words: acronyms and official spellings.
const SEGMENT_LABELS: Record<string, string> = {
  opd: 'OPD', meu: 'Medical Education Unit', iqac: 'IQAC', cbme: 'CBME', cbcwd: 'CBCWD', bmw: 'Biomedical Waste', naac: 'NAAC',
  nirf: 'NIRF', nmc: 'NMC', muhs: 'MUHS', pbcr: 'PBCR', rti: 'RTI', faqs: 'FAQs', phd: 'Ph.D.', pg: 'MD / MS', mbbs: 'MBBS',
  jbtdrc: 'JBTDRC', cme: 'CMEs & Conferences', 'information-technology': 'Information Technology', track: 'Track Inquiry',
  contact: 'Contact', 'screen-reader-access': 'Screen Reader Access', notices: 'News & Notices',
  'patient-portal': 'Patient Portal', 'student-portal': 'Student Portal', 'fee-portal': 'Fee Portal',
  'faculty-staff': 'Faculty & Staff', visitors: 'Public, Alumni & Researchers', 'accessibility-statement': 'Accessibility Statement',
  'blood-bank': 'Blood Bank', surveys: 'Surveys', newsletter: 'Newsletter', manage: 'Manage Subscription',
};
// Segments without a page of their own link to the closest listing instead.
const SEGMENT_PATHS: Record<string, string> = {
  '/notices': '/news', '/policies': '/policies/privacy-policy', '/admissions': '/academics/admissions', '/feedback/surveys': '/feedback',
  '/newsletter': '/feedback',
};

interface BreadcrumbsProps {
  customCrumbs?: { label: string; path?: string }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customCrumbs }) => {
  const location = useLocation();
  const pageLabel = useCurrentCrumbLabel(location.pathname);

  if (location.pathname === '/') return null;

  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" data-print-hide className="bg-slate-100 border-b border-slate-200 py-2 px-4 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="flex items-center gap-1 text-link hover:underline font-medium">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {customCrumbs ? (
          customCrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              {crumb.path ? (
                <Link to={crumb.path} className="text-link hover:underline font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-semibold" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          pathParts.map((part, idx) => {
            const fullPath = `/${pathParts.slice(0, idx + 1).join('/')}`;
            const path = SEGMENT_PATHS[fullPath] ?? fullPath;
            const isLast = idx === pathParts.length - 1;
            const formattedName =
              isLast && pageLabel
                ? pageLabel
                : pathParts[0] === 'notices' && idx === 1
                ? `Notice #${part}`
                : SEGMENT_LABELS[part] ?? part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

            return (
              <React.Fragment key={fullPath}>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                {isLast ? (
                  <span className="text-slate-800 font-semibold" aria-current="page">
                    {formattedName}
                  </span>
                ) : (
                  <Link to={path} className="text-link hover:underline font-medium">
                    {formattedName}
                  </Link>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </nav>
  );
};
