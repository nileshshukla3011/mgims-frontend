import { InquiryRecord } from '@/types';
import { isMockMode } from '@/services/api';

// The public site and this console are separate apps on different ports or hosts. Without a backend, inquiries sent
// from the public site stay in that site's browser storage, which this console cannot read.
export const NO_INQUIRIES = isMockMode
  ? 'Demo mode: inquiries sent from the public website are kept in that website\'s browser storage, so they do not appear here. They will once the backend is connected.'
  : 'No inquiries have been submitted yet.';

export const STATUS_STYLE: Record<InquiryRecord['status'], string> = {
  Received: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
};
