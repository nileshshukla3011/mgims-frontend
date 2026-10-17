import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PORTALS } from '@/config/portals';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { SHOW_REVIEW_CONTENT } from '@/components/content/ReviewContent';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useAccessibility();

  const allLinks: { title: string; path: string; submenu?: { title: string; path: string; reviewOnly?: boolean }[] }[] = [
    { title: t('home'), path: '/' },
    {
      title: t('about_us'),
      path: '/about-us/overview',
      submenu: [
        { title: 'Overview & vision', path: '/about-us/overview' },
        { title: 'History & heritage (1969)', path: '/about-us/history' },
        { title: 'Our Founder Dr. Sushila Nayar', path: '/about-us/founder' },
        { title: 'The MGIMS logo', path: '/about-us/logo' },
        { title: 'Governance & society leadership', path: '/about-us/governance' },
        { title: 'Annual reports archive (50th-55th)', path: '/about-us/annual-reports' },
        { title: 'Why MGIMS & Gandhian principles', path: '/about-us/why-mgims' },
        { title: 'Audited financial statements', path: '/about-us/audit-statements' },
        { title: 'Population Based Cancer Registry (PBCR)', path: '/about-us/pbcr' },
        { title: 'Citizen Charter', path: '/about-us/citizen-charter' },
        { title: 'Right to Information (RTI)', path: '/about-us/rti' },
        { title: 'Compliance & committees', path: '/about-us/compliance' },
        { title: 'Press clippings', path: '/about-us/press-clippings' },
      ],
    },
    {
      title: t('hospital'),
      path: '/hospital/overview',
      submenu: [
        { title: 'Kasturba Hospital overview', path: '/hospital/overview' },
        { title: '24x7 accident & emergency', path: '/hospital/emergency' },
        { title: 'Outpatient services (OPD)', path: '/hospital/opd' },
        { title: 'Inpatient services (wards & ICU)', path: '/hospital/inpatient' },
        { title: 'Hospital charges & tariff table', path: '/hospital/charges' },
        { title: 'Investigation & diagnostic facilities', path: '/hospital/investigations' },
        { title: 'Specialty wings (cath lab, MCH, radiotherapy)', path: '/hospital/specialities' },
        { title: 'Health insurance schemes', path: '/hospital/health-insurance' },
        { title: 'Low-cost generic drug policy', path: '/hospital/low-cost-drug' },
        { title: 'Arogyadham (integrative medicine)', path: '/hospital/arogyadham' },
        { title: 'Melghat tribal hospital (Utavali)', path: '/hospital/melghat' },
        { title: 'Hospital IT & HIS', path: '/hospital/information-technology' },
        { title: 'Blood bank availability', path: '/hospital/blood-bank' },
        { title: 'Patient Portal', path: PORTALS.patient.path },
      ],
    },
    {
      title: t('academics'),
      path: '/academics/overview',
      submenu: [
        { title: 'Academics overview', path: '/academics/overview' },
        { title: 'MBBS degree course', path: '/academics/mbbs' },
        { title: 'MD / MS postgraduate specialties', path: '/academics/pg' },
        { title: 'Ph.D. & research fellowships', path: '/academics/phd', reviewOnly: true },
        { title: 'Admissions & govt approval', path: '/academics/admissions' },
        { title: 'Zero-tolerance anti-ragging policy', path: '/academics/anti-ragging' },
        { title: 'Medical Education Unit', path: '/academics/meu' },
        { title: 'CMEs, conferences & workshops', path: '/academics/cme' },
        { title: 'Awards & achievements', path: '/academics/awards' },
        { title: 'Centralized skills lab & simulation', path: '/academics/skills-lab' },
        { title: 'Central library & resources', path: '/academics/library' },
        { title: 'Student life, hostels & magazine', path: '/academics/student-life' },
        { title: 'Teaching & non-teaching staff', path: '/academics/staff-lists' },
        { title: 'Examination results', path: '/academics/results' },
        { title: 'Student Portal', path: PORTALS.student.path },
        { title: 'Fee Portal: pay fees online', path: PORTALS.fee.path },
        { title: 'Alumni network', path: '/alumni' },
      ],
    },
    {
      title: t('departments'),
      path: '/departments',
      submenu: [
        { title: 'All 24 medical departments', path: '/departments' },
        { title: 'Pre-clinical departments', path: '/departments?cat=pre' },
        { title: 'Para-clinical departments', path: '/departments?cat=para' },
        { title: 'Clinical departments', path: '/departments?cat=clinical' },
        { title: 'Super-specialty units', path: '/departments?cat=super' },
      ],
    },
    { title: t('faculty'), path: '/faculty' },
    {
      title: t('research'),
      path: '/research/overview',
      submenu: [
        { title: 'Research overview', path: '/research/overview' },
        { title: 'JBTDRC tuberculosis research', path: '/research/jbtdrc', reviewOnly: true },
        { title: 'Dr PRJ Gangadharam Award', path: '/research/awards' },
        { title: 'Institutional research', path: '/research/institutional' },
        { title: 'Publications', path: '/research/publications' },
        { title: 'MD / MS theses', path: '/research/theses' },
        { title: 'Student research', path: '/research/student-research' },
        { title: 'NAAC cycle 3 SSR & AQAR reports', path: '/accreditations/naac' },
        { title: 'NIRF & NMC mandatory disclosures', path: '/accreditations/nirf' },
      ],
    },
    {
      title: 'Tenders & jobs',
      path: '/tenders',
      submenu: [
        { title: 'Active & archived tenders', path: '/tenders' },
        { title: 'Faculty & staff recruitment', path: '/recruitment' },
        { title: 'Eligible / shortlisted candidates', path: '/recruitment?tab=lists' },
      ],
    },
    { title: 'News & CMEs', path: '/news' },
    { title: 'Community', path: '/community' },
    { title: t('contact'), path: '/contact' },
  ];
  // Sections with only unconfirmed content are hidden unless review notes are shown (see ReviewContent).
  const navLinks = allLinks.map((item) =>
    item.submenu ? { ...item, submenu: item.submenu.filter((sub) => SHOW_REVIEW_CONTENT || !sub.reviewOnly) } : item,
  );

  return (
    <nav aria-label="Main navigation" data-print-hide className="bg-brand-navy text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-13">
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || (item.submenu && item.submenu.some(s => location.pathname === s.path));
              return (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.title)}
                  onMouseLeave={(event) => {
                    if (!event.currentTarget.contains(document.activeElement)) setActiveDropdown(null);
                  }}
                  onFocus={() => setActiveDropdown(item.title)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveDropdown(null);
                  }}
                >
                  <Link
                    to={item.path}
                    className={`px-2.5 py-3.5 flex items-center gap-1 transition rounded-xs hover:bg-slate-800 ${
                      isActive
                        ? 'bg-brand-blue text-amber-400 font-bold border-b-2 border-amber-400'
                        : 'text-slate-200 hover:text-white'
                    }`}
                    aria-haspopup={item.submenu ? 'true' : undefined}
                    aria-expanded={item.submenu ? activeDropdown === item.title : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.title}</span>
                    {item.submenu && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />}
                  </Link>

                  {/* Accessible Dropdown Menu */}
                  {item.submenu && activeDropdown === item.title && (
                    <div className="absolute left-0 top-full w-64 bg-brand-navy-dark border border-slate-700 shadow-xl rounded-b-md py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.title}
                          to={sub.path}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-2 text-xs text-slate-200 hover:bg-brand-blue hover:text-amber-300 transition"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center justify-between w-full py-2">
            <span className="text-sm font-bold text-amber-400">MGIMS portal menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 rounded"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-brand-navy-dark border-t border-slate-700 max-h-[80vh] overflow-y-auto px-4 py-3 space-y-2">
          {navLinks.map((item) => (
            <div key={item.title} className="border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  className={`min-h-11 flex flex-1 items-center py-2 font-bold text-sm text-slate-100 hover:text-amber-400`}
                >
                  {item.title}
                </Link>
                {item.submenu && (
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === item.title ? null : item.title)}
                    aria-label={`${mobileExpanded === item.title ? 'Hide' : 'Show'} ${item.title} links`}
                    aria-expanded={mobileExpanded === item.title}
                    className="min-h-11 min-w-11 rounded text-slate-200 hover:bg-slate-800"
                  >
                    <ChevronDown aria-hidden="true" className={`mx-auto h-4 w-4 transition-transform ${mobileExpanded === item.title ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.submenu && (
                <div hidden={mobileExpanded !== item.title} className="pl-3 border-l border-slate-700 mt-1">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.title}
                      to={sub.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-11 items-center text-sm text-slate-300 hover:text-amber-300"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};
