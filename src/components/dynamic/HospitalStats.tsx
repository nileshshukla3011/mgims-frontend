import React from 'react';
import { Activity, Award, Building, HeartPulse, Stethoscope, Users } from 'lucide-react';
import { dynamicApi } from '@/services/dynamicApi';
import { apiService } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { FreshnessBadge } from '@/components/ui/Status';

const ICONS: Record<string, React.ElementType> = {
  beds: Activity,
  'outpatient-visits': Users,
  'inpatient-admissions': HeartPulse,
  'babies-delivered': Award,
};

/**
 * Key figures on the home page. Hospital figures come from HIMS through the API (SRS 4.8 "live hospital
 * statistics"), with their period and source; the department count comes from the department list.
 */
export const HospitalStats: React.FC = () => {
  const { t } = useAccessibility();
  const stats = useAsync(() => dynamicApi.getHospitalStatistics(), []);
  const departments = useAsync(() => apiService.getDepartments(), []);
  const hospital = stats.data?.data;
  const items = [
    ...(hospital?.items ?? []).map((i) => ({ id: i.id, value: i.value, label: i.label, desc: i.note ?? t('stats.in_period', { period: hospital?.period ?? '' }), icon: ICONS[i.id] ?? Activity })),
    ...(departments.data ? [{ id: 'departments', value: String(departments.data.length), label: t('stats.departments'), desc: t('stats.departments_desc'), icon: Building }] : []),
    { id: 'since', value: '1969', label: t('stats.since'), desc: t('stats.since_desc'), icon: Stethoscope },
  ];
  return (
    <section aria-label={t('stats.title')} className="border-y border-slate-200 bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-4">
        <ul className="grid grid-cols-2 gap-6 text-center md:grid-cols-3 lg:grid-cols-6">
          {items.map(({ id, value, label, desc, icon: Icon }) => (
            <li key={id} className="space-y-1">
              <div aria-hidden="true" className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-link">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-serif text-2xl font-black text-ink sm:text-3xl">{value}</p>
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-[10px] text-slate-600">{desc}</p>
            </li>
          ))}
        </ul>
        {stats.data && hospital && (
          <div className="text-center">
            <FreshnessBadge fetchedAt={stats.data.fetchedAt} stale={stats.data.stale} source={hospital.source} />
          </div>
        )}
      </div>
    </section>
  );
};
