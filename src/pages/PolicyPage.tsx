import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

// Website policy pages required in the footer by UX4G 5.1.3 / 5.1.7.
// The scraped MGIMS site had no published text for these, so each page states that
// plainly instead of presenting invented legal wording as official policy.
const policies: Record<string, { title: string; purpose: string }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    purpose: 'How this portal collects, uses, stores and protects personal information submitted through forms such as the citizen inquiry form.',
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    purpose: 'The terms governing use of this portal and its content.',
  },
  disclaimer: {
    title: 'Disclaimer',
    purpose: 'The limits of responsibility for information published on this portal.',
  },
  'hyperlinking-policy': {
    title: 'Hyperlinking Policy',
    purpose: 'Rules for linking to this portal and how links to external websites are handled.',
  },
  faqs: {
    title: 'Frequently Asked Questions',
    purpose: 'Answers to common questions from patients, students, applicants and vendors.',
  },
  // Website policies that GIGW 3.0 expects every government-linked website to publish.
  'copyright-policy': {
    title: 'Copyright Policy',
    purpose: 'Who owns the content of this portal, and how it may be reproduced or quoted.',
  },
  'content-moderation-approval-policy': {
    title: 'Content Contribution, Moderation & Approval Policy',
    purpose: 'Who may contribute content for this portal, how departments submit it, and who reviews and approves it before publication.',
  },
  'content-archival-policy': {
    title: 'Content Archival Policy',
    purpose: 'How long each kind of content (notices, tenders, events) stays on the portal, and how expired content is archived.',
  },
  'content-review-policy': {
    title: 'Content Review Policy',
    purpose: 'How often each kind of content is reviewed for accuracy and who is responsible for the review.',
  },
  'website-monitoring-policy': {
    title: 'Website Monitoring Policy',
    purpose: 'How the portal is monitored for availability, performance, functionality, broken links and accessibility.',
  },
  'contingency-management-plan': {
    title: 'Contingency Management Plan',
    purpose: 'What happens if the portal is defaced, hacked or unavailable, and how it is restored.',
  },
  'security-policy': {
    title: 'Website Security Policy',
    purpose: 'How the portal and the personal data it handles are protected.',
  },
};

export const PolicyPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const policy = policies[slug];
  usePageMeta(policy?.title ?? 'Website policies', policy?.purpose);

  if (!policy) return <Navigate to="/policies/privacy-policy" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">Website policies</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">{policy.title}</h1>
        <p className="text-sm text-slate-600 mt-1">{policy.purpose}</p>
      </div>

      <div role="note" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-slate-800">
        <FileText className="h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        <div className="space-y-2">
          <p className="font-bold">The official {policy.title.toLowerCase()} has not been published on this portal yet.</p>
          <p>
            Until it is, please contact the Web Information Manager for any question about this policy.
          </p>
          <p>
            <a href="mailto:dean@mgims.ac.in" className="inline-flex items-center gap-2 font-semibold text-link hover:underline">
              <Mail className="h-4 w-4" aria-hidden="true" /> dean@mgims.ac.in
            </a>
          </p>
        </div>
      </div>

      <nav aria-label="Other website policies" className="text-sm">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {Object.entries(policies).filter(([s]) => s !== slug).map(([s, p]) => (
            <li key={s}>
              <Link to={`/policies/${s}`} className="font-semibold text-link hover:underline">{p.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
