import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PORTALS } from '@/config/portals';
import { ExternalLink, MapPin, Phone, Mail, Accessibility } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { apiService } from '@/services/api';
import { NewsletterSignup } from '@/components/engagement/NewsletterSignup';
import mgimsLogo from '@/assets/images/mgims-logo-160.jpg';
import mgimsLogoLarge from '@/assets/images/mgims-logo.jpg';

export const SiteFooter: React.FC = () => {
  const { t } = useAccessibility();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  useEffect(() => {
    apiService
      .getSiteInfo()
      .then((info) => setLastUpdated(info.lastUpdated))
      .catch(() => undefined);
  }, []);

  const govtPortals = [
    { title: 'Ministry of Health & Family Welfare', url: 'https://mohfw.gov.in' },
    { title: 'National Medical Commission (NMC)', url: 'https://www.nmc.org.in' },
    { title: 'Maharashtra University of Health Sciences (MUHS)', url: 'https://www.muhs.ac.in' },
    { title: 'Indian Council of Medical Research (ICMR)', url: 'https://www.icmr.nic.in' },
    { title: 'Ayushman Bharat PM-JAY', url: 'https://pmjay.gov.in' },
  ];

  const mandatoryPolicies = [
    { title: 'Citizen Charter', path: '/about-us/citizen-charter' },
    { title: 'Right to Information (RTI)', path: '/about-us/rti' },
    { title: 'Anti-ragging regulations', path: '/academics/anti-ragging' },
    { title: 'Hospital tariff & charges', path: '/hospital/charges' },
    { title: 'Tenders & procurement', path: '/tenders' },
    { title: 'Recruitment & vacancies', path: '/recruitment' },
    { title: 'Internal Complaints Committee', path: '/about-us/compliance' },
    { title: 'Biomedical waste reports', path: '/hospital/bmw' },
    { title: 'All statutory disclosures', path: '/regulators' },
  ];

  // Portals built by other teams; their entry points are configured in src/config/portals.ts.
  const onlineServices = [
    { title: 'Patient Portal', path: PORTALS.patient.path },
    { title: 'Student Portal', path: PORTALS.student.path },
    { title: 'Fee Portal', path: PORTALS.fee.path },
  ];

  // UX4G 5.1.3 / 5.1.7: privacy, terms, FAQs and contact must be reachable from every footer.
  const siteLinks = [
    { title: 'Privacy Policy', path: '/policies/privacy-policy' },
    { title: 'Terms & Conditions', path: '/policies/terms-and-conditions' },
    { title: 'Disclaimer', path: '/policies/disclaimer' },
    { title: 'Hyperlinking Policy', path: '/policies/hyperlinking-policy' },
    { title: 'Copyright Policy', path: '/policies/copyright-policy' },
    { title: 'FAQs', path: '/policies/faqs' },
    { title: 'Help', path: '/help' },
    { title: 'Accessibility Statement', path: '/accessibility-statement' },
    { title: 'Feedback', path: '/feedback' },
    { title: 'Sitemap', path: '/sitemap' },
    { title: 'Contact Us', path: '/contact' },
  ];

  return (
    <footer data-print-hide className="bg-brand-navy text-slate-300 text-xs border-t border-slate-700">
      {/* Accessibility statement without claiming an external certification. */}
      <div className="bg-brand-navy-dark py-3 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Accessibility className="h-4 w-4" />
            </div>
            <div>
              <p className="text-white font-bold text-xs sm:text-sm">
                Accessibility and usability
              </p>
              <p className="text-[11px] text-slate-400">
                This interface uses UX4G handbook patterns for clear navigation and accessible controls.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Institute Info */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-3 border-b border-slate-700 pb-2">
              <span className="shrink-0 rounded-md bg-white p-1">
                <img src={mgimsLogo}
                srcSet={`${mgimsLogo} 160w, ${mgimsLogoLarge} 400w`}
                sizes="80px"
                width={80}
                height={80} alt="" className="h-11 w-11 object-contain" />
              </span>
              {t('institute_full_name')}
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              Founded in 1969 by Dr. Sushila Nayar with the blessings of Mahatma Gandhi. India's first rural medical institute committed to affordable, compassionate healthcare.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Sevagram, Wardha, Maharashtra 442102</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>EPABX: 07152-284341 to 55 (16 lines)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>dean@mgims.ac.in</span>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-xs">
              <a href="https://www.facebook.com/mgims/" target="_blank" rel="noreferrer" aria-label="MGIMS on Facebook" className="inline-flex min-h-11 items-center text-slate-200 underline underline-offset-2 hover:text-amber-300">Facebook</a>
              <a href="https://www.instagram.com/_mgims/" target="_blank" rel="noreferrer" aria-label="MGIMS on Instagram" className="inline-flex min-h-11 items-center text-slate-200 underline underline-offset-2 hover:text-amber-300">Instagram</a>
              <a href="https://www.linkedin.com/school/mahatma-gandhi-institute-of-medical-sciences/" target="_blank" rel="noreferrer" aria-label="MGIMS on LinkedIn" className="inline-flex min-h-11 items-center text-slate-200 underline underline-offset-2 hover:text-amber-300">LinkedIn</a>
              <a href="https://twitter.com/_mgims" target="_blank" rel="noreferrer" aria-label="MGIMS on X" className="inline-flex min-h-11 items-center text-slate-200 underline underline-offset-2 hover:text-amber-300">X</a>
            </div>
          </div>

          {/* Column 2: Government & Affiliated Portals */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-2">
              National health & regulatory portals
            </h2>
            <ul className="space-y-2 text-xs">
              {govtPortals.map((p) => (
                <li key={p.title}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-8 py-1 hover:text-amber-400 flex items-center gap-1.5 transition text-slate-300"
                  >
                    <span>{p.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Mandatory Disclosures & Citizen Services */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-2">
              Mandatory policies & disclosures
            </h2>
            <ul className="grid grid-cols-1 gap-1.5 text-xs">
              {mandatoryPolicies.map((m) => (
                <li key={m.title}>
                  <Link to={m.path} className="min-h-8 py-1 hover:text-amber-400 transition text-slate-300 flex items-center gap-1">
                    <span className="text-amber-400">›</span> {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Quick Portals & Web Info Manager */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-2">
              Citizen & patient helpdesk
            </h2>
            <div className="bg-slate-800/80 p-3 rounded border border-slate-700 mb-3 space-y-1.5">
              <p className="font-bold text-white text-xs">Web Information Manager:</p>
              <p className="text-[11px] text-slate-300">Dr. AK Shukla, Dean MGIMS</p>
              <p className="text-[11px] text-slate-400">Dean office, Sevagram, Wardha</p>
              <p className="text-[11px] text-amber-400 font-mono">dean@mgims.ac.in</p>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p>OPD hours: 8:00 AM – 1:00 PM (Mon-Sat)</p>
              <p className="text-emerald-400 font-semibold">Casualty & emergency: 24 hours open</p>
            </div>
            <h2 className="text-white font-bold text-sm mt-5 mb-2 border-b border-slate-700 pb-2">Online services</h2>
            <ul className="grid grid-cols-1 gap-1 text-xs">
              {onlineServices.map((o) => (
                <li key={o.path}>
                  <Link to={o.path} className="min-h-8 py-1 hover:text-amber-400 transition text-slate-300 flex items-center gap-1">
                    <span className="text-amber-400">›</span> {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter sign-up (WEB-ENG-5) */}
        <div className="mt-8 max-w-md">
          <NewsletterSignup />
        </div>

        {/* Site policy links */}
        <nav aria-label="Website policies" className="mt-8 pt-4 border-t border-slate-700">
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-xs">
            {siteLinks.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="inline-flex min-h-11 items-center text-slate-200 underline underline-offset-2 hover:text-amber-300">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Bar: Copyright and source content date */}
        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center md:text-left">
          <div>
            <p>
              © 1969 – 2026 Mahatma Gandhi Institute of Medical Sciences (Kasturba Health Society). All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400">
              Content owned, maintained, and updated by Mahatma Gandhi Institute of Medical Sciences, Sevagram.
            </p>
          </div>

          {lastUpdated && (
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <span className="text-slate-400">
                Last updated: <strong className="text-slate-200">{lastUpdated}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Indian National Flag Color Accent Stripe at Bottom */}
      <div className="h-1.5 w-full bg-gradient-to-r from-flag-saffron via-white to-flag-green"></div>
    </footer>
  );
};
