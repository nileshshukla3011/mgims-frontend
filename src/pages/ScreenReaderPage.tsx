import React from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';

const readers = [
  { name: 'NVDA (NonVisual Desktop Access)', platform: 'Windows', licence: 'Free', url: 'https://www.nvaccess.org' },
  { name: 'JAWS (Job Access With Speech)', platform: 'Windows', licence: 'Commercial', url: 'https://www.freedomscientific.com' },
  { name: 'Narrator', platform: 'Windows (built in)', licence: 'Free', url: 'https://support.microsoft.com/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1' },
  { name: 'VoiceOver', platform: 'macOS, iPhone and iPad (built in)', licence: 'Free', url: 'https://www.apple.com/accessibility/vision/' },
  { name: 'TalkBack', platform: 'Android (built in)', licence: 'Free', url: 'https://support.google.com/accessibility/android/answer/6283677' },
  { name: 'Orca', platform: 'Linux', licence: 'Free', url: 'https://orca.gnome.org' },
];

const shortcuts = [
  ['Tab / Shift + Tab', 'Move to the next / previous link, button or field'],
  ['Enter', 'Open a link or activate a button'],
  ['Ctrl + K (⌘ + K on Mac)', 'Open portal search'],
  ['Esc', 'Close a dialog, search or menu'],
  ['First Tab on any page', 'Shows “Skip to main content”'],
];

export const ScreenReaderPage: React.FC = () => {
  usePageMeta('Screen Reader Access', 'Screen readers and keyboard shortcuts for using the MGIMS portal.');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">Accessibility</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">Screen Reader Access</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          This portal follows WCAG 2.1 AA practices so that people with visual impairments can use it with a screen reader.
          The table lists widely used screen readers.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Screen readers</caption>
            <thead className="bg-brand-navy text-white">
              <tr>
                <th scope="col" className="p-3 font-semibold">Screen reader</th>
                <th scope="col" className="p-3 font-semibold">Platform</th>
                <th scope="col" className="p-3 font-semibold">Licence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readers.map((r) => (
                <tr key={r.name}>
                  <td className="p-3">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link hover:underline">{r.name}</a>
                  </td>
                  <td className="p-3 text-slate-700">{r.platform}</td>
                  <td className="p-3 text-slate-700">{r.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section aria-labelledby="shortcuts-title" className="space-y-3">
        <h2 id="shortcuts-title" className="text-lg font-bold text-ink">Keyboard shortcuts on this portal</h2>
        <dl className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-sm">
          {shortcuts.map(([key, action]) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-3">
              <dt className="font-mono font-semibold text-slate-900">{key}</dt>
              <dd className="sm:col-span-2 text-slate-700">{action}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};
