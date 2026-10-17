import React, { useRef, useState } from 'react';
import { Copy, FileText, Trash2, Upload } from 'lucide-react';
import { AdminUser, Department } from '@/types';
import { MediaItem, mediaApi } from '@/admin/governanceApi';
import { isSuperAdmin } from '@/admin/access';
import { checkAltText, checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';
import { useAsync } from '@/hooks/useAsync';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/utils/format';

// Files departments may upload. SVG is excluded because it can carry scripts.
const ACCEPT: Record<string, number> = { 'image/jpeg': 2048, 'image/png': 2048, 'image/webp': 2048, 'application/pdf': 10240 };

/** Shared, brand-compliant media library (WEB-CMS-7): upload once, reuse the link, alt text required for images. */
export const MediaLibrary: React.FC<{ user: AdminUser; departments: Department[] }> = ({ user, departments }) => {
  const superAdmin = isSuperAdmin(user);
  const media = useAsync(() => mediaApi.list(superAdmin ? undefined : user.departmentId), [user.username]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [departmentId, setDepartmentId] = useState(user.departmentId ?? '');
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | MediaItem['kind']>('all');
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null) => {
    setError('');
    if (!f) return setFile(null);
    const limit = ACCEPT[f.type];
    if (!limit) {
      if (fileRef.current) fileRef.current.value = '';
      return setError('Choose a JPG, PNG, WebP or PDF file.');
    }
    if (f.size > limit * 1024) {
      if (fileRef.current) fileRef.current.value = '';
      return setError(`The file is ${Math.ceil(f.size / 1024)} KB; the limit is ${limit / 1024} MB.`);
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '));
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Choose a file.');
    const isImage = file.type.startsWith('image/');
    const found = [...checkText('Title', title, { required: true, paragraph: false, maxLength: 150 }), ...(isImage ? checkAltText('Image description', alt, file.name) : [])];
    setIssues(found);
    if (hasErrors(found)) return setError('Fix the problems marked "must be fixed" first.');
    setBusy(true);
    setError('');
    try {
      const item = await mediaApi.upload(user, file, { title: title.trim(), alt: isImage ? alt.trim() : undefined, departmentId: departmentId || undefined });
      setMessage(`Uploaded “${item.title}”.`);
      setFile(null);
      setTitle('');
      setAlt('');
      setIssues([]);
      if (fileRef.current) fileRef.current.value = '';
      media.reload();
    } catch {
      setError('The upload failed. The server may have rejected the file.');
    } finally {
      setBusy(false);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = (media.data ?? []).filter((m) => (kind === 'all' || m.kind === kind) && (!q || `${m.title} ${m.fileName} ${m.alt ?? ''}`.toLowerCase().includes(q)));

  return (
    <div className="space-y-6">
      <form onSubmit={upload} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-xs">
        <h2 className="text-sm font-bold text-ink">Upload a file</h2>
        <p className="text-slate-600">Images (JPG, PNG, WebP, up to 2 MB) and PDF documents (up to 10 MB). Reuse uploaded files instead of uploading copies.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="media-file" className="mb-1 block font-semibold text-slate-700">File *</label>
            <input ref={fileRef} id="media-file" type="file" accept={Object.keys(ACCEPT).join(',')} onChange={(e) => pick(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
          </div>
          <div>
            <label htmlFor="media-title" className="mb-1 block font-semibold text-slate-700">Title *</label>
            <input id="media-title" value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 px-2" />
          </div>
          {file?.type.startsWith('image/') && (
            <div className="sm:col-span-2">
              <label htmlFor="media-alt" className="mb-1 block font-semibold text-slate-700">Image description (alt text) *</label>
              <input id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} aria-describedby="media-alt-hint" className="min-h-11 w-full rounded-lg border border-slate-300 px-2" />
              <p id="media-alt-hint" className="mt-1 text-slate-600">What the image shows, for people who cannot see it. Example: “Doctors examining patients at a village health camp”.</p>
            </div>
          )}
          {superAdmin && (
            <div>
              <label htmlFor="media-dept" className="mb-1 block font-semibold text-slate-700">Department</label>
              <select id="media-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2">
                <option value="">Institute-wide</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <ContentIssues issues={issues} />
        {error && <p role="alert" className="font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-blue px-4 font-bold text-white disabled:opacity-60">
          <Upload className="h-4 w-4" aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">{message}</p>}

      <section aria-label="Files in the library" className="space-y-3">
        <div className="flex flex-wrap items-end gap-3 text-xs">
          <div>
            <label htmlFor="media-search" className="mb-1 block font-semibold text-slate-700">Search files</label>
            <input id="media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-2" />
          </div>
          <div role="group" aria-label="File type" className="flex gap-1">
            {(['all', 'image', 'document'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={`min-h-11 rounded-lg px-3 font-semibold ${kind === k ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
                {k === 'all' ? 'All' : k === 'image' ? 'Images' : 'Documents'}
              </button>
            ))}
          </div>
        </div>
        {media.error ? <p role="alert" className="text-xs text-red-700">The library could not be loaded.</p> : !media.data ? <p className="text-xs text-slate-600">Loading…</p> : shown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-600">No files yet. Uploaded files appear here for everyone in your department to reuse.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <li key={m.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                {m.kind === 'image' ? (
                  <img src={m.url} alt={m.alt ?? ''} className="h-32 w-full rounded object-cover" />
                ) : (
                  <div aria-hidden="true" className="flex h-32 items-center justify-center rounded bg-slate-100"><FileText className="h-10 w-10 text-slate-500" /></div>
                )}
                <p className="font-semibold text-slate-900">{m.title}</p>
                <p className="text-slate-600">{m.fileName} · {m.kind === 'image' ? 'Image' : 'PDF'}, {m.sizeKb >= 1024 ? `${(m.sizeKb / 1024).toFixed(1)} MB` : `${m.sizeKb} KB`}</p>
                {m.alt && <p className="text-slate-700">Alt: {m.alt}</p>}
                <p className="text-slate-600">{m.uploadedBy}, {formatDateTime(m.uploadedAt)}{m.departmentId ? ` · ${departments.find((d) => d.id === m.departmentId)?.name ?? m.departmentId}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigator.clipboard?.writeText(m.url).then(() => setMessage(`Link to “${m.title}” copied.`), () => setMessage(m.url))} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-2 font-semibold text-link">
                    <Copy className="h-4 w-4" aria-hidden="true" /> Copy link<span className="sr-only"> to {m.title}</span>
                  </button>
                  <button type="button" onClick={() => setDeleting(m)} disabled={(m.usedOn?.length ?? 0) > 0} title={(m.usedOn?.length ?? 0) > 0 ? 'Used on a page' : undefined} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-red-300 px-2 font-semibold text-red-700 disabled:opacity-50">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete<span className="sr-only"> {m.title}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {deleting && (
        <Modal title="Delete this file?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-slate-800">“{deleting.title}” will be removed from the library. Links to it will stop working.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
            <button
              type="button"
              onClick={async () => {
                const target = deleting;
                setDeleting(null);
                try {
                  await mediaApi.remove(user, target);
                  setMessage(`Deleted “${target.title}”.`);
                  media.reload();
                } catch {
                  setMessage('The file could not be deleted. It may still be used on a page.');
                }
              }}
              className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-bold text-white"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
