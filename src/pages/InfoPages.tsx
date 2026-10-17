import React from 'react';
import { Link } from 'react-router-dom';
import { PortalLink } from '@/components/navigation/PortalLink';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';

const Page: React.FC<{ title: string; intro: string; children: React.ReactNode }> = ({ title, intro, children }) => (
  <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
    <div className="border-b border-slate-200 pb-4">
      <h1 className="font-serif text-2xl font-black text-ink sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{intro}</p>
    </div>
    <div className="space-y-6 text-sm leading-relaxed text-slate-800 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-link [&_a]:underline">
      {children}
    </div>
  </div>
);

/** How to use the website (GIGW 3.0 Help page). Describes this website only. */
export const HelpPage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('help.title'), t('help.intro'));
  return (
    <Page title={t('help.title')} intro={t('help.intro')}>
      <section className="space-y-2">
        <h2>Finding information</h2>
        <ul className="space-y-1">
          <li>The main menu has the sections of the website. On a phone, open it with the "MGIMS portal menu" button.</li>
          <li>The line under the menu ("breadcrumbs") shows where you are; select any part of it to go back.</li>
          <li>Search the whole website from the "Search portal" button or with Ctrl + K. You can also search by voice where your browser allows it.</li>
          <li>The <Link to="/sitemap">sitemap</Link> lists every page. Pages for each kind of visitor are at <Link to="/patients">patients</Link>, <Link to="/students">students</Link>, <Link to="/faculty-staff">faculty and staff</Link>, <Link to="/visitors">public and alumni</Link> and <Link to="/regulators">regulators</Link>.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>Changing how the website looks</h2>
        <ul className="space-y-1">
          <li>Make text bigger or smaller with the A+ and A- buttons at the top of every page.</li>
          <li>Switch to high contrast or dark colours from the top bar, or open "Accessibility settings" for more options such as line spacing, highlighted links and a dyslexia-friendly font.</li>
          <li>The accessibility button at the bottom right of every page opens the same options.</li>
          <li>Your choices are remembered in this browser.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>Using a keyboard or a screen reader</h2>
        <ul className="space-y-1">
          <li>Press Tab to move between links and buttons, and Enter to open them. "Skip to main content" is the first link on every page.</li>
          <li>Dialogs close with Esc, and focus returns to where you were.</li>
          <li>The <Link to="/screen-reader-access">screen reader access</Link> page lists free screen readers.</li>
          <li>Content pages have a "Listen to this page" button that reads the text aloud where your browser supports it.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>Languages</h2>
        <p>Choose English, हिन्दी or मराठी from the language list at the top. Menus, buttons and the online services follow your choice; most page content is in English at present. Your choice stays for every page you open.</p>
      </section>
      <section className="space-y-2">
        <h2>Online services</h2>
        <ul className="space-y-1">
          <li><PortalLink portal="patient">Patient Portal</PortalLink>: appointments, reports and bills for patients of Kasturba Hospital.</li>
          <li><PortalLink portal="student">Student Portal</PortalLink>: admissions, results and academic records.</li>
          <li><PortalLink portal="fee">Fee Portal</PortalLink>: pay fees online.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>Documents</h2>
        <p>Reports, receipts and many notices are PDF files. Your browser can usually open them; otherwise install a free PDF reader. Where a file's size is known, it is shown next to the link.</p>
      </section>
      <section className="space-y-2">
        <h2>Still need help?</h2>
        <p>Write to us from the <Link to="/contact">contact page</Link> and keep your ticket number to <Link to="/contact/track">track the reply</Link>, or tell us what to improve on the <Link to="/feedback">feedback page</Link>.</p>
      </section>
    </Page>
  );
};

/** Accessibility statement: what the website does for accessibility, its known limits, and how to report a problem. */
export const AccessibilityStatementPage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('a11y.title'), t('a11y.intro'));
  return (
    <Page title={t('a11y.title')} intro={t('a11y.intro')}>
      <section className="space-y-2">
        <h2>Standards</h2>
        <p>This website aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, the Guidelines for Indian Government Websites (GIGW 3.0) and the UX4G design guidelines.</p>
      </section>
      <section className="space-y-2">
        <h2>What you can do on this website</h2>
        <ul className="space-y-1">
          <li>Use it with a keyboard only; every page starts with a "Skip to main content" link.</li>
          <li>Use it with a screen reader: pages have headings, labelled forms, descriptions of images and tables with headers.</li>
          <li>Make text larger, switch to high contrast or dark colours, increase spacing and highlight links.</li>
          <li>Search by voice, and listen to page text, where your browser supports it.</li>
          <li>Use it on a phone: pages fit small screens, and buttons are large enough to tap.</li>
          <li>Read error messages next to the form field that needs fixing, with a list of all problems at the top of the form.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>Known limitations</h2>
        <ul className="space-y-1">
          <li>Most page content is in English; menus and online services are also in Hindi and Marathi.</li>
          <li>Some PDF documents carried over from the earlier website are scanned images and may not work with screen readers. Ask us for an accessible copy.</li>
          <li>Videos and maps from other websites follow those websites' accessibility.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2>How this website is checked</h2>
        <p>Pages are tested with automated accessibility checks (axe-core) at desktop and phone widths, and by keyboard.</p>
      </section>
      <section className="space-y-2">
        <h2>Report a problem</h2>
        <p>If something on this website is hard to use, tell us on the <Link to="/feedback">feedback page</Link> or the <Link to="/contact">contact page</Link>. Mention the page and what you were trying to do.</p>
        <p className="text-xs text-slate-600">Statement prepared on 14 October 2026.</p>
      </section>
    </Page>
  );
};
