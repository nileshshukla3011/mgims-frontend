import React from 'react';
import { Link } from 'react-router-dom';
import { dynamicApi } from '@/services/dynamicApi';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { EmptyState, ErrorState } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';

/** Notices placed automatically on a department's page (WEB-DYN-3). */
export const DepartmentNotices: React.FC<{ departmentId: string; departmentName: string }> = ({ departmentId, departmentName }) => {
  const { t } = useAccessibility();
  const notices = useAsync(() => dynamicApi.getDepartmentNotices(departmentId, departmentName), [departmentId]);
  if (notices.error) return <ErrorState onRetry={notices.reload} />;
  if (!notices.data) return <SkeletonRows count={3} />;
  if (notices.data.length === 0) return <EmptyState title={t('deptnotices.none', { name: departmentName })} />;
  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {notices.data.map((n) => (
        <li key={n.id} className="py-3">
          <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">{n.category}</span>
          <span className="text-xs text-slate-600">{n.date}</span>
          <Link to={`/notices/${n.id}`} className="mt-1 block font-semibold text-link hover:underline">{n.title}</Link>
        </li>
      ))}
    </ul>
  );
};
