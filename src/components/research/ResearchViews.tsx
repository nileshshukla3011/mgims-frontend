import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { ResearchRecord, StudentResearchInfo } from '@/types';
import { ReviewContent } from '@/components/content/ReviewContent';
import { DetailLines, ResearchRecordsView } from '@/components/research/ResearchRecordsView';

const Meta: React.FC<{ items: (string | false | undefined)[] }> = ({ items }) => (
  <p className="text-xs text-slate-600">{items.filter(Boolean).join(' · ')}</p>
);

const ThesisEntry = (r: ResearchRecord) => (
  <>
    <p className="font-semibold text-ink">{r.title}</p>
    <Meta items={[r.people && `Student: ${r.people}`, r.guide && `Guide: ${r.guide}`, r.details]} />
  </>
);

// Publications and presentations list all authors (students and faculty); projects list the students.
const peopleLabel = (r: ResearchRecord) =>
  r.category === 'Publications' || r.category === 'Other presentations' ? 'Authors' : r.people?.includes(',') ? 'Students' : 'Student';

const StudentEntry = (r: ResearchRecord) => (
  <>
    <p className="font-semibold text-ink">{r.title}</p>
    <Meta
      items={[
        r.people && `${peopleLabel(r)}: ${r.people}`,
        r.guide && `${r.guide.includes(',') ? 'Guides' : 'Guide'}: ${r.guide}`,
        r.department,
      ]}
    />
    <DetailLines details={r.details} />
  </>
);

const PublicationEntry = (r: ResearchRecord) => (
  <p>
    {r.people && <span>{r.people}. </span>}
    <span className="font-semibold text-ink">{r.title}.</span>
    {r.details && <span className="text-slate-600"> {r.details}</span>}
  </p>
);

const FundedEntry = (r: ResearchRecord) => (
  <>
    <p className="font-semibold text-ink">{r.title}</p>
    {r.people && <Meta items={[`Investigators: ${r.people}`]} />}
    <DetailLines details={r.details} />
  </>
);

const PresentationEntry = (r: ResearchRecord) => (
  <>
    <p className="font-semibold text-ink">{r.people}</p>
    <p>{r.title}</p>
    {r.details && <p className="text-xs text-slate-600">{r.details}</p>}
  </>
);

export const ThesesView: React.FC = () => (
  <ResearchRecordsView kind="thesis" noun="theses" groupBy="department" renderEntry={ThesisEntry} />
);

export const PublicationsView: React.FC = () => (
  <ResearchRecordsView kind="publication" noun="publications" groupBy="department" renderEntry={PublicationEntry} />
);

export const FundedResearchView: React.FC = () => (
  <ResearchRecordsView kind="funded-project" noun="projects" groupBy="department" renderEntry={FundedEntry} />
);

export const PresentationsView: React.FC = () => (
  <ResearchRecordsView kind="presentation" noun="presentations" groupBy="department" renderEntry={PresentationEntry} />
);

/** Undergraduate research: the scheme, then per academic year its committee, notes and projects by programme. */
export const StudentResearchView: React.FC = () => {
  const [info, setInfo] = useState<StudentResearchInfo | null>(null);
  useEffect(() => {
    apiService
      .getStudentResearchInfo()
      .then(setInfo)
      .catch(() => setInfo({ intro: [], scheme: [], years: [] }));
  }, []);

  const yearInfo = (year: string) => {
    const y = info?.years.find((item) => item.year === year);
    if (!y) return null;
    return (
      <div className="space-y-4">
        {y.inferred && (
          <ReviewContent note="The official page does not give the year of this list; it was dated from the events and papers it mentions.">
            <></>
          </ReviewContent>
        )}
        {y.source && <p className="text-xs text-slate-600">From the {y.source}.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {y.committee.length > 0 && (
            <section aria-label="Committee for Promotion of Undergraduate Research" className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-bold text-ink">Committee for Promotion of Undergraduate Research</h3>
              <ul className="space-y-0.5 text-xs text-slate-700">
                {y.committee.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          )}
          {y.notes.length > 0 && (
            <section aria-label="Awards and achievements" className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-bold text-ink">Awards and achievements</h3>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-700">
                {y.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {info && (info.intro.length > 0 || info.scheme.length > 0) && (
        <div className="max-w-[75ch] space-y-3 text-sm leading-relaxed text-slate-700">
          {info.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {info.scheme.length > 0 && (
            <>
              <h3 className="pt-2 text-base font-bold text-ink">Dr Sushila Nayar Scheme for Promotion of Undergraduate Research</h3>
              {info.scheme.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </>
          )}
        </div>
      )}
      <ResearchRecordsView kind="student-research" noun="entries" groupBy="category" renderEntry={StudentEntry} yearInfo={yearInfo} />
    </div>
  );
};
