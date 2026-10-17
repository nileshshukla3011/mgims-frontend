import React from 'react';
import { ShieldCheck, Award, FileText, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { ReportList } from '@/components/content/ReportList';
import { RegulatoryUpdates } from '@/components/dynamic/RegulatoryUpdates';

const loadAccreditations = () => apiService.getAccreditations();

const AQAR_KEYS = ['aqar-23-24', 'aqar-22-23', 'aqar-21-22', 'aqar-reports-4', 'aqar-reports-3', 'ssr'];

const sections: SectionConfig[] = [
  {
    id: 'naac',
    title: 'NAAC, AQAR & SSR',
    icon: Award,
    heading: 'National Assessment and Accreditation Council (NAAC)',
    pages: ['naac'],
    after: (pages) => <ReportList pages={pages} keys={AQAR_KEYS} label="NAAC AQAR and SSR reports" />,
  },
  { id: 'nirf', title: 'NIRF ranking disclosures', icon: ShieldCheck, heading: 'National Institutional Ranking Framework (NIRF)', pages: ['nirf'] },
  { id: 'nmc', title: 'NMC mandatory disclosures', icon: FileText, heading: 'NMC mandatory disclosures', pages: ['mci-requirements', 'disclosure'], after: <RegulatoryUpdates source="NMC" /> },
  { id: 'muhs', title: 'MUHS mandate & affiliation', icon: CheckCircle, heading: 'MUHS mandate', pages: ['mandate'] },
];

// Search links and old bookmarks use the scraped site's slugs.
const aliases: Record<string, string> = {
  ...Object.fromEntries(AQAR_KEYS.map((k) => [k, 'naac'])),
  'mci-requirements': 'nmc',
  'disclosure': 'nmc',
  'mandate': 'muhs',
};

export const AccreditationsPage: React.FC = () => (
  <SectionedPage
    eyebrow="Quality Assurance & Regulatory Compliance"
    eyebrowClass="text-emerald-800"
    title="Accreditations & Statutory Disclosures"
    description="NAAC SSR and AQAR reports, NIRF data and National Medical Commission disclosures."
    basePath="/accreditations"
    navLabel="Accreditation Portals"
    sections={sections}
    loadPages={loadAccreditations}
    aliases={aliases}
  />
);
