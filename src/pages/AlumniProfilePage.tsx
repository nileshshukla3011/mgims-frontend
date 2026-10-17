import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { apiService } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { useCrumbLabel } from '@/hooks/useCrumbLabel';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ErrorState } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { mediaUrl } from '@/utils/media';
import type { DistinguishedAlumnus } from '@/types';

const BACK = '/alumni#alumni-distinguished';

/** A previous / next link to another distinguished alumnus, with their portrait. */
const Neighbour: React.FC<{ alumnus: DistinguishedAlumnus; direction: 'previous' | 'next' }> = ({ alumnus, direction }) => {
  const { t } = useAccessibility();
  const next = direction === 'next';
  return (
    <Link
      to={`/alumni/${encodeURIComponent(alumnus.slug)}`}
      className={`group flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-blue hover:shadow-md ${next ? 'flex-row-reverse text-right' : ''}`}
    >
      {alumnus.photo && <img src={mediaUrl(alumnus.photo)} alt="" width={56} height={70} loading="lazy" className="h-16 w-12 shrink-0 rounded-md bg-slate-100 object-cover" />}
      <span className="min-w-0 flex-1">
        <span className={`flex items-center gap-1 text-xs font-semibold text-slate-600 ${next ? 'justify-end' : ''}`}>
          {!next && <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
          {next ? t('alumni.next') : t('alumni.previous')}
          {next && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
        <span className="block truncate font-serif text-sm font-bold text-ink group-hover:text-link">{alumnus.name}</span>
      </span>
    </Link>
  );
};

/**
 * The profile of one distinguished alumnus (/alumni/<slug>): portrait, name, position and the profile text of the
 * official site, with links to the previous and next alumnus in the order of the alumni page.
 */
export const AlumniProfilePage: React.FC = () => {
  const { t } = useAccessibility();
  const { slug = '' } = useParams();
  const profile = useAsync(() => apiService.getDistinguishedAlumnusProfile(slug), [slug]);
  const list = useAsync(() => apiService.getDistinguishedAlumni(), []);
  const a = profile.data;
  const notFound = !profile.loading && !profile.error && !a;
  usePageMeta(a?.name ?? t('alumni.distinguished'), a ? `${a.name}, ${a.role}. ${t('alumni.distinguished')}, MGIMS Sevagram.` : undefined, { noindex: notFound });
  useCrumbLabel(a?.name);

  const all = list.data ?? [];
  const at = all.findIndex((x) => x.slug === slug);
  const previous = at > 0 ? all[at - 1] : undefined;
  const next = at >= 0 && at < all.length - 1 ? all[at + 1] : undefined;

  const back = (
    <Link to={BACK} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-link underline">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('alumni.all_distinguished')}
    </Link>
  );

  if (profile.error) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">{back}<ErrorState onRetry={profile.reload} /></div>;
  if (notFound) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-12">
        <h1 className="font-serif text-2xl font-bold text-ink">{t('alumni.not_found')}</h1>
        {back}
      </div>
    );
  }
  if (!a) return <div className="mx-auto max-w-5xl px-4 py-8"><SkeletonRows count={6} label={t('alumni.distinguished')} /></div>;

  return (
    <article className="pb-12">
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-white">
        <div className="mx-auto max-w-5xl px-4 pt-4 pb-8">
          {back}
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end">
            {a.photo && (
              <img
                src={mediaUrl(a.photo)}
                alt=""
                width={280}
                height={460}
                fetchPriority="high"
                className="aspect-[4/5] w-36 shrink-0 rounded-2xl bg-slate-200 object-cover shadow-md ring-4 ring-white sm:w-48"
              />
            )}
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-amber-800">{t('alumni.distinguished')}</p>
              <h1 className="font-serif text-3xl font-black leading-tight text-ink sm:text-4xl">{a.name}</h1>
              <p className="max-w-2xl text-base text-slate-700 sm:text-lg">{a.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-12 px-4 pt-8">
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-slate-800">
          {a.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>

        {(previous || next) && (
          <nav aria-label={t('alumni.more')} className="border-t border-slate-200 pt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>{previous && <Neighbour alumnus={previous} direction="previous" />}</div>
              <div>{next && <Neighbour alumnus={next} direction="next" />}</div>
            </div>
          </nav>
        )}
      </div>
    </article>
  );
};
