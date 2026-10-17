import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, FileText, Microscope, FlaskConical, GraduationCap, Presentation, HandCoins } from 'lucide-react';
import { apiService } from '@/services/api';
import { GenericPageContent, NoticeSummary } from '@/types';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { ReviewContent } from '@/components/content/ReviewContent';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { sortByDate } from '@/utils/noticeDates';
import { FundedResearchView, PresentationsView, PublicationsView, StudentResearchView, ThesesView } from '@/components/research/ResearchViews';

const loadResearch = () => apiService.getResearch();

const JbtdrcNote: React.FC = () => (
  <ReviewContent note="The official JBTDRC page was not available (page not found) when the website content was collected.">
    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
      JBTDRC is a centre for clinical and basic research on infectious diseases, with special emphasis on tuberculosis and filariasis.
    </p>
  </ReviewContent>
);

// The official In-house Publication page prints each publication's name as a heading and its editor below it.
const InHousePublications: React.FC<{ page?: GenericPageContent }> = ({ page }) => {
  const names = (page?.headings ?? []).slice(1).map((h) => h.text);
  if (!page || names.length === 0) return null;
  return (
    <section aria-labelledby="in-house-publications" className="space-y-3">
      <h3 id="in-house-publications" className="text-base font-bold text-ink">In-house publications</h3>
      <ul className="grid gap-3 sm:grid-cols-3">
        {names.map((name, i) => (
          <li key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-ink">{name}</p>
            {page.paragraphs[i] && <p className="text-xs text-slate-600">{page.paragraphs[i]}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
};

// The official website has no award page; its news notices report each year's award.
const AwardNotices: React.FC = () => {
  const [items, setItems] = useState<NoticeSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    apiService
      .getNotices(undefined, 'Gangadharam')
      .then((list) => setItems(sortByDate(list, 'newest')))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p role="alert" className="text-xs text-red-700">The award notices could not be loaded. Please try again later.</p>;
  if (!items) return <SkeletonRows count={4} label="Loading award notices" />;
  if (items.length === 0) return <p className="text-xs text-slate-600">No award notices have been published yet.</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs sm:text-sm text-slate-700">Award announcements and ceremonies published by MGIMS:</p>
      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
        {items.map((n) => (
          <li key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <Link to={`/notices/${n.id}`} className="font-bold text-sm text-link hover:underline">{n.title}</Link>
            <span className="shrink-0 text-slate-600">{n.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Theses, student research, publications, funded projects and presentations are structured records (by year and
// department) that department admins and the super admin manage in the admin console.
const sections: SectionConfig[] = [
  { id: 'overview', title: 'Research overview', icon: Microscope, heading: 'Research at MGIMS', pages: ['mgims-publications'], index: true },
  { id: 'institutional', title: 'Funded research', icon: FlaskConical, heading: 'Funded research projects', subtitle: 'Projects with extramural or institutional funding, by year and department', after: <FundedResearchView /> },
  {
    id: 'publications',
    title: 'Research publications',
    icon: FileText,
    heading: 'Publications',
    subtitle: 'Papers by MGIMS faculty and residents, by year and department',
    before: (pages) => <InHousePublications page={pages['in-house-publication']} />,
    after: <PublicationsView />,
  },
  { id: 'theses', title: 'MD / MS and PhD theses', icon: BookOpen, heading: 'Theses', subtitle: 'Postgraduate theses by year and department, with student and guide', after: <ThesesView /> },
  { id: 'student-research', title: 'Student research', icon: GraduationCap, heading: 'Undergraduate research', subtitle: 'Short-term studentships, research grants, travel grants, awards and publications', after: <StudentResearchView /> },
  { id: 'paper-presentations', title: 'Paper presentations', icon: Presentation, heading: 'Paper presentations', subtitle: 'Conference papers, talks and posters by department', after: <PresentationsView /> },
  { id: 'grants', title: 'Research grants & GMLF', icon: HandCoins, heading: 'Research grants', pages: ['shri-dhirubhai-mehta-memorial-scheme', 'gmlf'] },
  { id: 'jbtdrc', title: 'JBTDRC tuberculosis centre', icon: BookOpen, heading: 'JBTDRC', reviewOnly: true, before: <JbtdrcNote /> },
  { id: 'awards', title: 'Dr PRJ Gangadharam Award', icon: Award, heading: 'Dr. PRJ Gangadharam Endowment Award', before: <AwardNotices /> },
];

// Search links and old bookmarks use the scraped site's slugs.
const aliases: Record<string, string> = {
  'funded-research': 'institutional',
  'publications-annual': 'publications',
  'mgims-publications': 'overview',
  'in-house-publication': 'publications',
  'thesis': 'theses',
  'shri-dhirubhai-mehta-memorial-scheme': 'grants',
  'gmlf': 'grants',
};

export const ResearchPage: React.FC = () => (
  <SectionedPage
    eyebrow="Biomedical Science & Discovery"
    title="Research & Scientific Innovations"
    description="Publications, theses and research programmes of MGIMS, Sevagram."
    basePath="/research"
    navLabel="Research Portals"
    sections={sections}
    loadPages={loadResearch}
    aliases={aliases}
  />
);
