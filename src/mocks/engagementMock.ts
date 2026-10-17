// Demo-mode engagement data, kept in this browser. The website survey below asks about the website itself, so it
// states no institutional facts.
import {
  AlumniProfile,
  AlumniRegistrationInput,
  NewsletterSegment,
  NewsletterSubscription,
  SiteFeedbackInput,
  Survey,
  SurveyAnswers,
} from '@/types/services';
import { Language } from '@/types';
import { delay, demoId, demoStore, DemoError } from '@/mocks/demoStore';

const SEGMENTS: NewsletterSegment[] = [
  { id: 'notices', title: 'Notices and circulars', description: 'Institutional notices, holidays and announcements.' },
  { id: 'tenders', title: 'Tenders', description: 'New tenders and corrigenda.' },
  { id: 'recruitment', title: 'Recruitment', description: 'Vacancies and shortlisted-candidate lists.' },
  { id: 'academic-events', title: 'CMEs, conferences and workshops', description: 'Academic events and registration dates.' },
  { id: 'patient-services', title: 'Patient services', description: 'Health camps, OPD changes and patient information.' },
  { id: 'alumni', title: 'Alumni news', description: 'News and events for MGIMS alumni.' },
];

const SURVEY: Survey = {
  id: 'website-feedback',
  title: 'How easy is this website to use?',
  description: 'Five short questions about this website. Answers are anonymous and help the web team improve it.',
  status: 'Open',
  anonymous: true,
  questions: [
    { id: 'role', text: 'Who are you?', type: 'single', options: ['Patient or family member', 'Student', 'Faculty or staff', 'Applicant or job seeker', 'Vendor', 'Other'], required: true },
    { id: 'ease', text: 'How easy was it to find what you needed?', type: 'rating', required: true },
    { id: 'tasks', text: 'What did you come to do?', type: 'multiple', options: ['Hospital information', 'Book or check an appointment', 'Pay online', 'Admissions or results', 'Tenders or jobs', 'Contact someone'], required: false },
    { id: 'language', text: 'Which language do you prefer for this website?', type: 'single', options: ['English', 'हिन्दी', 'मराठी'], required: false },
    { id: 'improve', text: 'What should we improve?', type: 'longtext', required: false },
  ],
};

type Stored = NewsletterSubscription & { createdAt: string };

export async function newsletterSegments() {
  await delay(150);
  return SEGMENTS;
}

export async function subscribe(input: { email: string; segments: string[]; language: Language }): Promise<NewsletterSubscription> {
  await delay();
  const all = demoStore.get<Stored[]>('newsletter', []);
  const existing = all.find((s) => s.email.toLowerCase() === input.email.toLowerCase() && s.status !== 'Unsubscribed');
  const record: Stored = existing
    ? { ...existing, segments: input.segments, language: input.language }
    : { token: demoId('NL'), email: input.email, segments: input.segments, language: input.language, status: 'Pending confirmation', createdAt: new Date().toISOString() };
  demoStore.set('newsletter', [...all.filter((s) => s.token !== record.token), record]);
  return record;
}

export async function getSubscription(token: string): Promise<NewsletterSubscription> {
  await delay(150);
  const found = demoStore.get<Stored[]>('newsletter', []).find((s) => s.token === token);
  if (!found) throw new DemoError(404, 'Subscription not found');
  // In demo mode, opening the manage link stands in for clicking the confirmation email.
  return found.status === 'Pending confirmation' ? { ...found, status: 'Active' } : found;
}

export async function updateSubscription(token: string, update: { segments: string[]; language: Language }) {
  await delay();
  const all = demoStore.get<Stored[]>('newsletter', []);
  const found = all.find((s) => s.token === token);
  if (!found) throw new DemoError(404, 'Subscription not found');
  const record: Stored = { ...found, ...update, status: update.segments.length ? 'Active' : 'Unsubscribed' };
  demoStore.set('newsletter', all.map((s) => (s.token === token ? record : s)));
  return record;
}

export async function unsubscribe(token: string) {
  await delay();
  // The address is erased, not just flagged.
  demoStore.set('newsletter', demoStore.get<Stored[]>('newsletter', []).filter((s) => s.token !== token));
}

export async function openSurveys() {
  await delay(150);
  return [SURVEY];
}

export async function getSurvey(id: string) {
  await delay(150);
  if (id !== SURVEY.id) throw new DemoError(404, 'Survey not found');
  return SURVEY;
}

export async function submitSurvey(id: string, answers: SurveyAnswers) {
  await delay();
  demoStore.set('survey-responses', [...demoStore.get<unknown[]>('survey-responses', []), { id, answers, at: new Date().toISOString() }]);
}

export async function submitSiteFeedback(input: SiteFeedbackInput) {
  await delay();
  const reference = demoId('FB');
  demoStore.set('site-feedback', [...demoStore.get<unknown[]>('site-feedback', []), { ...input, reference, at: new Date().toISOString() }]);
  return { reference };
}

export async function alumni(query?: string): Promise<AlumniProfile[]> {
  await delay(150);
  // Only people who registered in this browser and chose to be listed: there is no real alumni data in demo mode.
  const list = demoStore.get<(AlumniProfile & { showInDirectory: boolean })[]>('alumni', []).filter((a) => a.showInDirectory);
  const q = query?.trim().toLowerCase();
  return q ? list.filter((a) => [a.name, a.batch, a.specialty, a.city, a.organisation].some((v) => v?.toLowerCase().includes(q))) : list;
}

export async function registerAlumnus(input: AlumniRegistrationInput) {
  await delay();
  const reference = demoId('AL');
  demoStore.set('alumni', [...demoStore.get<unknown[]>('alumni', []), { ...input, id: reference }]);
  return { reference };
}
