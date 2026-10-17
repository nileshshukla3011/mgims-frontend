import React, { useId, useState } from 'react';
import { ChevronDown, ExternalLink, FileText } from 'lucide-react';
import { contentImages, hasOfficialContent, OfficialPage, ScrapedTable } from '@/utils/officialContent';
import { PhotoGallery } from '@/components/content/PhotoGallery';
import { useAccessibility } from '@/context/AccessibilityContext';

const PARAGRAPH_STEP = 40;
// Text beside photos starts with about as much text as the photo column is tall (at least 2000 characters and 3
// paragraphs), then "Continue reading".
const CLIP_CHARS = 2000;
const CHARS_PER_PHOTO = 160;

/** How many of `paragraphs` fill about as much height as `photoCount` photos beside them. */
const clipCount = (paragraphs: string[], photoCount: number) => {
  const target = Math.max(CLIP_CHARS, photoCount * CHARS_PER_PHOTO);
  let n = 0;
  let chars = 0;
  while (n < paragraphs.length && (n < 3 || chars < target)) chars += paragraphs[n++].length;
  return n;
};

/**
 * How a page's paragraphs are laid out. `text`: as paragraphs. `timeline`: a story told by year; a paragraph that
 * names a year near its start gets that year as a marker, and an opening paragraph without one is the lead.
 * `updates`: news-style items; a short line without a full stop followed by a longer paragraph is its title.
 */
export type OfficialLayout = 'text' | 'timeline' | 'updates';

/** A banner photo in two widths (see OfficialContent's `cover`). */
export interface OfficialCover {
  large: string;
  small: string;
  /** Width of `large` in pixels. */
  width: number;
}

const YEAR = /\b(1[89]\d{2}|20\d{2})\b/;

/** The opening paragraph of a timeline page when it names no year: the lead, shown before the timeline. */
const timelineLead = (paragraphs: string[]) => (paragraphs[0] && !YEAR.test(paragraphs[0].slice(0, 80)) ? paragraphs[0] : undefined);

const Timeline: React.FC<{ paragraphs: string[]; showLead: boolean; limit?: number }> = ({ paragraphs, showLead, limit }) => {
  const lead = timelineLead(paragraphs);
  let lastYear = '';
  const items = (lead ? paragraphs.slice(1) : paragraphs).map((text) => {
    const year = text.slice(0, 80).match(YEAR)?.[1];
    const marker = year && year !== lastYear ? year : undefined;
    if (year) lastYear = year;
    return { text, marker };
  });
  return (
    <div className="space-y-6">
      {lead && showLead && <p className="max-w-[70ch] text-base font-medium leading-relaxed text-slate-800 sm:text-lg">{lead}</p>}
      <ol className="ml-2 max-w-[70ch] space-y-6 border-l-2 border-amber-300 pl-6">
        {items.slice(0, limit).map(({ text, marker }, i) => (
          <li key={i} className="relative">
            <span aria-hidden="true" className={`absolute top-1.5 -left-[31px] rounded-full ring-4 ring-white ${marker ? 'h-3.5 w-3.5 bg-amber-500' : 'h-2.5 w-2.5 -left-[29px] bg-amber-300'}`} />
            {/* The year is in the sentence itself, so the marker is for the eye only. */}
            {marker && <p aria-hidden="true" className="mb-1 font-serif text-xl font-black leading-none text-amber-800">{marker}</p>}
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Updates: React.FC<{ paragraphs: string[]; titleTag: 'h3' | 'h4' }> = ({ paragraphs, titleTag: Title }) => {
  const items: { title?: string; body: string }[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    const next = paragraphs[i + 1]?.trim();
    if (next && p.length <= 100 && !/[.:;]$/.test(p) && next.length > p.length) {
      items.push({ title: p, body: next });
      i++;
    } else items.push({ body: p });
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="space-y-1.5 rounded-xl border border-slate-200 border-l-4 border-l-brand-blue bg-slate-50 p-4">
          {item.title && <Title className="font-serif text-base font-bold text-ink">{item.title}</Title>}
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  );
};

const ScrapedTableView: React.FC<{ table: ScrapedTable; label: string }> = ({ table, label }) => {
  const rows = table.rows ?? [];
  const width = Math.max(table.headers?.length ?? 0, ...rows.map((r) => r.length), 1);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Focusable so keyboard users can scroll a wide table sideways. */}
      <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label={table.caption || label}>
        <table className="w-full text-xs text-left">
          <caption className="sr-only">{table.caption || label}</caption>
          {table.headers && table.headers.length > 0 && (
            <thead className="bg-brand-navy text-white">
              <tr>
                {/* Empty scraped header cells become plain cells so they are not announced as blank headers. */}
                {table.headers.map((h, i) =>
                  h.trim() ? (
                    <th key={i} scope="col" className="p-3 font-semibold align-top">{h}</th>
                  ) : (
                    <td key={i} className="p-3" />
                  ),
                )}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50 align-top">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    colSpan={ci === row.length - 1 && row.length < width ? width - row.length + 1 : undefined}
                    className={`p-3 text-slate-700 ${row.length === 1 ? 'font-bold text-ink bg-slate-50' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Renders a scraped page from the official MGIMS website: paragraphs, lists, tables and photos. */
export const OfficialContent: React.FC<{
  page?: OfficialPage;
  heading?: string;
  showHeading?: boolean;
  layout?: OfficialLayout;
  /** Id of the page's part, for links to it (e.g. a section's "On this page" links). */
  anchorId?: string;
  /** A photo behind the heading (and a timeline's lead paragraph), as a banner. */
  cover?: OfficialCover;
}> = ({ page, heading, showHeading = true, layout = 'text', anchorId, cover }) => {
  const { t } = useAccessibility();
  const [paraLimit, setParaLimit] = useState(PARAGRAPH_STEP);
  const [expanded, setExpanded] = useState(false);
  const headingId = useId();

  if (!page) return null;

  const tables = page.tables ?? [];
  // Table cells were also captured as separate paragraphs, sometimes one name per paragraph from a cell holding
  // several ("DG Dambhare" from "DG Dambhare Chetana Maliye"); drop those duplicates.
  const cells = tables.flatMap((t) => [...(t.headers ?? []), ...(t.rows ?? []).flat()]).map((c) => c.trim());
  const tableCells = new Set(cells);
  const cellText = cells.join('\n');
  const paragraphs = (page.paragraphs ?? []).filter((p) => {
    const t = p.trim();
    return t && !tableCells.has(t) && !(t.length < 60 && cellText.includes(t));
  });
  const lists = page.lists ?? [];
  const images = contentImages(page.images);
  const title = heading ?? page.title;

  const photos = images.map((im) => ({ url: im.url, caption: (im.alt || im.title || '').trim() || undefined }));
  // Text and photos side by side (photos in a column on wide screens, a swipeable row on phones) instead of a long
  // text followed by a long grid.
  const beside = layout !== 'updates' && photos.length >= 2 && paragraphs.length >= 3 && tables.length === 0;
  const banner = cover && showHeading;
  const lead = layout === 'timeline' ? timelineLead(paragraphs) : undefined;
  // Beside photos, long text starts shorter so the text and photo columns are about the same height.
  const flowing = layout === 'timeline' && lead ? paragraphs.slice(1) : paragraphs;
  const shown = beside && !expanded ? clipCount(flowing, photos.length) : flowing.length;
  const clipped = beside && clipCount(flowing, photos.length) < flowing.length;
  const more = clipped && (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((e) => !e)}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-link hover:bg-slate-50"
    >
      {expanded ? t('content.less') : t('content.continue', { count: flowing.length - clipCount(flowing, photos.length) })}
      <ChevronDown className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
  );

  const body = (
    <>
      {!hasOfficialContent(page) && (
        <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <FileText className="h-5 w-5 shrink-0 text-link" aria-hidden="true" />
          <p>
            This content (usually a PDF or embedded document) is available on the official MGIMS website.
            {page.url && (
              <>
                {' '}
                <a href={page.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link hover:underline">
                  View {page.title} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {paragraphs.length > 0 && layout === 'timeline' && (
        <div className="text-sm leading-relaxed text-slate-700 sm:text-base"><Timeline paragraphs={paragraphs} showLead={!banner} limit={shown} /></div>
      )}
      {paragraphs.length > 0 && layout === 'updates' && (
        <div className="text-sm leading-relaxed text-slate-700"><Updates paragraphs={paragraphs} titleTag={showHeading ? 'h4' : 'h3'} /></div>
      )}
      {paragraphs.length > 0 && layout === 'text' && (
        <div className="max-w-[75ch] space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
          {paragraphs.slice(0, Math.min(paraLimit, shown)).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {paragraphs.length > paraLimit && (
            <button
              type="button"
              onClick={() => setParaLimit((n) => n + PARAGRAPH_STEP * 5)}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-link hover:bg-slate-50"
            >
              Show more ({paragraphs.length - paraLimit} more entries)
            </button>
          )}
        </div>
      )}

      {more}

      {lists.map((l, i) => {
        const ListTag = l.type === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={i} className={`${l.type === 'ordered' ? 'list-decimal' : 'list-disc'} max-w-[75ch] pl-5 space-y-1.5 text-sm sm:text-base text-slate-700`}>
            {l.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ListTag>
        );
      })}

      {tables.map((tb, i) => (
        <ScrapedTableView key={i} table={tb} label={`${title} — table ${i + 1}`} />
      ))}
    </>
  );

  return (
    <section id={anchorId} className="scroll-mt-20 space-y-5" aria-labelledby={showHeading ? headingId : undefined}>
      {banner ? (
        <div className="relative isolate overflow-hidden rounded-2xl bg-brand-navy text-white">
          <img
            src={cover.large}
            srcSet={`${cover.small} 960w, ${cover.large} ${cover.width}w`}
            sizes="(min-width: 1024px) 870px, 100vw"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          {/* Keeps the text readable over the photo: dark under the text, lighter on the right. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy/85 sm:bg-transparent sm:bg-gradient-to-r sm:from-brand-navy/95 sm:via-brand-navy/85 sm:via-70% sm:to-brand-navy/45" />
          <div className="max-w-2xl space-y-3 px-5 py-8 sm:px-8 sm:py-12">
            <h3 id={headingId} className="font-serif text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h3>
            {lead && <p className="text-base leading-relaxed text-slate-100 sm:text-lg">{lead}</p>}
          </div>
        </div>
      ) : (
        showHeading && (
          <h3 id={headingId} className="flex items-center gap-2 border-b border-slate-200 pb-2 font-serif text-lg font-bold text-ink">
            <span aria-hidden="true" className="h-5 w-1.5 rounded-full bg-amber-500" />
            {title}
          </h3>
        )
      )}

      {beside ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-5 lg:col-span-8">{body}</div>
          <aside aria-label={`${title}: ${t('gallery.photos', { count: photos.length })}`} className="order-first space-y-2 lg:order-none lg:col-span-4">
            <p className="text-xs font-bold text-slate-600">{t('gallery.photos', { count: photos.length })}</p>
            <PhotoGallery photos={photos} label={title} beside />
          </aside>
        </div>
      ) : (
        <>
          {body}
          {photos.length > 0 && <PhotoGallery photos={photos} label={title} />}
        </>
      )}
    </section>
  );
};
