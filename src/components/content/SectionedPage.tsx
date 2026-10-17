import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { GenericPageContent } from '@/types';
import { OfficialContent, OfficialCover, OfficialLayout } from '@/components/content/OfficialContent';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { SHOW_REVIEW_CONTENT } from '@/components/content/ReviewContent';
import { ReadAloud } from '@/components/content/ReadAloud';

export interface SectionConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  heading?: string;
  subtitle?: string;
  /** Keys of scraped official pages shown in this section, in order. */
  pages?: string[];
  /** How some of those pages are shown: their layout (default: as text) and a banner photo. */
  pageOptions?: Record<string, { layout?: OfficialLayout; cover?: OfficialCover }>;
  /** Hand-built content shown above / below the official pages; may be built from the loaded pages. */
  before?: SectionSlot;
  after?: SectionSlot;
  /** Show links to the other sections (for overview sections without an official page of their own). */
  index?: boolean;
  /** The section has only unconfirmed content: hidden, with its URL redirected, unless review notes are shown. */
  reviewOnly?: boolean;
}

type SectionSlot = React.ReactNode | ((pages: Record<string, GenericPageContent>) => React.ReactNode);

interface SectionedPageProps {
  eyebrow: string;
  eyebrowClass?: string;
  title: string;
  description: string;
  basePath: string;
  navLabel: string;
  sections: SectionConfig[];
  loadPages: () => Promise<Record<string, GenericPageContent>>;
  /** Old or scraped slugs that should redirect to a section id. */
  aliases?: Record<string, string>;
  headerAside?: React.ReactNode;
}

/** Left-nav + content layout shared by the Hospital, About, Academics, Research and Accreditations pages. */
export const SectionedPage: React.FC<SectionedPageProps> = ({
  eyebrow, eyebrowClass = 'text-amber-800', title, description, basePath, navLabel, sections: allSections, loadPages, aliases = {}, headerAside,
}) => {
  const { t } = useAccessibility();
  const sections = SHOW_REVIEW_CONTENT ? allSections : allSections.filter((s) => !s.reviewOnly);
  const { section = sections[0].id } = useParams<{ section?: string }>();
  const [pages, setPages] = useState<Record<string, GenericPageContent>>({});
  const [loading, setLoading] = useState(true);
  // On phones the section menu is collapsed so the content is not pushed below a long list of links.
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    loadPages()
      .then(setPages)
      .catch((err) => console.error(`Error loading ${basePath} content:`, err))
      .finally(() => setLoading(false));
  }, [loadPages, basePath]);

  const current = sections.find((s) => s.id === section);
  const officialEntries = (current?.pages ?? []).flatMap((key) => (pages[key] ? [{ key, page: pages[key] }] : []));
  const officialPages = officialEntries.map((e) => e.page);
  usePageMeta(
    current ? `${current.heading ?? current.title} — ${title}` : title,
    officialPages[0]?.paragraphs?.[0] || current?.subtitle || description,
  );
  if (!current) {
    const owner = sections.find((s) => s.pages?.includes(section))?.id;
    return <Navigate to={`${basePath}/${aliases[section] ?? owner ?? sections[0].id}`} replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className={`text-xs font-bold tracking-widest block ${eyebrowClass}`}>{eyebrow}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{description}</p>
        </div>
        {headerAside}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <nav aria-label={navLabel} className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
          <p className="hidden lg:block px-3 py-2 text-xs font-bold text-slate-500 tracking-wider">{navLabel}</p>
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            aria-expanded={navOpen}
            aria-controls="section-menu"
            className="lg:hidden flex w-full min-h-11 items-center justify-between gap-2 px-3 text-left text-xs font-semibold text-slate-700"
          >
            <span>
              <span className="block text-[11px] font-bold text-slate-500 tracking-wider">{navLabel}</span>
              <span className="text-sm text-ink">{current.title}</span>
            </span>
            <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${navOpen ? 'rotate-180' : ''}`} />
          </button>
          <div id="section-menu" className={`${navOpen ? 'block' : 'hidden'} lg:block space-y-1`}>
          {sections.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === current.id;
            return (
              <Link
                key={item.id}
                to={`${basePath}/${item.id}`}
                onClick={() => setNavOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-brand-blue text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
          </div>
        </nav>

        <div id="section-content" className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-10 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold font-serif text-ink">{current.heading ?? current.title}</h2>
              {current.subtitle && <p className="text-xs text-slate-500">{current.subtitle}</p>}
            </div>
            <ReadAloud key={current.id} targetId="section-content" />
          </div>

          {typeof current.before === 'function' ? current.before(pages) : current.before}

          {loading && (current.pages?.length ?? 0) > 0 ? (
            <SkeletonRows count={4} label="Loading official content" />
          ) : (
            <>
              {/* Several official pages in one section: links to each, so a long section can be skimmed. */}
              {officialEntries.length > 1 && (
                <nav aria-label={t('section.on_this_page')} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{t('section.on_this_page')}:</span>
                  {officialEntries.map(({ key, page }) => (
                    <a key={key} href={`#page-${key}`} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-ink hover:border-brand-blue hover:bg-blue-50">
                      {page.title}
                    </a>
                  ))}
                </nav>
              )}
              {officialEntries.map(({ key, page: p }, i) => {
                // Two scraped pages can share a title (e.g. old and new "PG Students"); number repeats so headings stay unique.
                const repeat = officialPages.slice(0, i).filter((o) => o.title === p.title).length;
                return (
                  <OfficialContent
                    key={p.url}
                    page={p}
                    anchorId={`page-${key}`}
                    layout={current.pageOptions?.[key]?.layout}
                    cover={current.pageOptions?.[key]?.cover}
                    showHeading={officialPages.length > 1}
                    heading={repeat ? `${p.title} (${repeat + 1})` : undefined}
                  />
                );
              })}
            </>
          )}

          {current.index && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.filter((s) => s.id !== current.id).map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id}>
                    <Link
                      to={`${basePath}/${s.id}`}
                      className="flex h-full min-h-11 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 no-underline hover:border-brand-blue hover:bg-white"
                    >
                      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-link" />
                      <span>
                        <span className="block text-sm font-bold text-ink">{s.heading ?? s.title}</span>
                        {s.subtitle && <span className="block text-xs text-slate-600">{s.subtitle}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {typeof current.after === 'function' ? current.after(pages) : current.after}
        </div>
      </div>
    </div>
  );
};
