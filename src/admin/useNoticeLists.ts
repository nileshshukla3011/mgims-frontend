import { useCallback, useEffect, useRef, useState } from 'react';
import { NoticeSummary } from '@/types';
import { apiService } from '@/services/api';
import { adminApi } from '@/admin/adminApi';

/**
 * Notices, tenders and vacancies of the console, with delete-and-Undo (UX4G 6.11.1 / 6.12.3): a deleted notice
 * disappears at once, and the server delete is sent once the 8-second Undo time is over (or straight away when another
 * notice is deleted or the admin signs out). If the server refuses, the notice comes back with a message.
 */
export function useNoticeLists(enabled: boolean, notify: (message: string) => void) {
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [tenders, setTenders] = useState<NoticeSummary[]>([]);
  const [jobs, setJobs] = useState<NoticeSummary[]>([]);
  const [undo, setUndo] = useState<{ item: NoticeSummary; timer: number } | null>(null);
  // The waiting delete, readable from callbacks that outlive a render (sign-out, the next delete).
  const pending = useRef(undo);
  useEffect(() => {
    pending.current = undo;
  }, [undo]);

  useEffect(() => {
    if (!enabled) return;
    // The console lists scheduled and expired notices too; the public site shows only live ones.
    const all = { includeUnpublished: true };
    Promise.all([apiService.getNotices(undefined, undefined, all), apiService.getTenders(all), apiService.getRecruitment(all)])
      .then(([allN, tN, rN]) => {
        // A copy: in demo mode the service's own list is changed by adminApi.createNotice, which must not change state.
        setNotices([...allN]);
        setTenders(tN);
        setJobs(rN);
      })
      .catch((err) => console.error('Error loading notices:', err));
  }, [enabled]);

  const insert = useCallback((item: NoticeSummary) => {
    setNotices((list) => [item, ...list]);
    if (item.category === 'Tender') setTenders((list) => [item, ...list]);
    if (item.category === 'Recruitment') setJobs((list) => [item, ...list]);
  }, []);

  const commitDelete = useCallback(
    async (item: NoticeSummary) => {
      try {
        await adminApi.deleteNotice(item.id);
      } catch {
        insert(item);
        notify(`“${item.title}” could not be deleted, so it is back in the list.`);
      }
    },
    [insert, notify],
  );

  /** Sends a delete that is still waiting for its Undo time, e.g. before signing out. */
  const flushPendingDelete = useCallback(() => {
    const waiting = pending.current;
    if (!waiting) return;
    window.clearTimeout(waiting.timer);
    void commitDelete(waiting.item);
    setUndo(null);
  }, [commitDelete]);

  const remove = (id: number) => {
    const item = notices.find((n) => n.id === id) || tenders.find((t) => t.id === id) || jobs.find((j) => j.id === id);
    if (!item) return;
    flushPendingDelete();
    setNotices((list) => list.filter((n) => n.id !== id));
    setTenders((list) => list.filter((t) => t.id !== id));
    setJobs((list) => list.filter((j) => j.id !== id));
    notify('');
    setUndo({ item, timer: window.setTimeout(() => { setUndo(null); void commitDelete(item); }, 8000) });
  };

  const undoDelete = () => {
    if (!undo) return;
    window.clearTimeout(undo.timer);
    insert(undo.item);
    setUndo(null);
  };

  return { notices, tenders, jobs, add: insert, remove, undoPending: Boolean(undo), undoDelete, flushPendingDelete };
}
