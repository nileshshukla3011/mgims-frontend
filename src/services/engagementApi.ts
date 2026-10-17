// Engagement tools (WEB-ENG-1, -4, -5; WEB-ACD-6): newsletter subscriptions, surveys, site feedback routed to
// departments, and the alumni network.
import { apiFetch } from '@/services/http';
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

// Read here (not imported) so a live build drops the demo branches and their chunks entirely.
const IS_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

const demo = () => import('@/mocks/engagementMock');

export const engagementApi = {
  async getNewsletterSegments(): Promise<NewsletterSegment[]> {
    return IS_MOCK ? (await demo()).newsletterSegments() : apiFetch('/newsletter/segments');
  },

  /** Starts a double opt-in: the backend emails a confirmation link; nothing is sent before it is confirmed. */
  async subscribe(input: { email: string; segments: string[]; language: Language }): Promise<NewsletterSubscription> {
    return IS_MOCK ? (await demo()).subscribe(input) : apiFetch('/newsletter/subscriptions', { method: 'POST', body: { ...input, consent: true } });
  },

  /** The subscription behind a manage / unsubscribe link (the token comes from the email). */
  async getSubscription(token: string): Promise<NewsletterSubscription> {
    return IS_MOCK ? (await demo()).getSubscription(token) : apiFetch(`/newsletter/subscriptions/${encodeURIComponent(token)}`);
  },

  async updateSubscription(token: string, update: { segments: string[]; language: Language }): Promise<NewsletterSubscription> {
    return IS_MOCK
      ? (await demo()).updateSubscription(token, update)
      : apiFetch(`/newsletter/subscriptions/${encodeURIComponent(token)}`, { method: 'PATCH', body: update });
  },

  /** Unsubscribes from everything and erases the address (DPDP: withdrawal as easy as consent). */
  async unsubscribe(token: string): Promise<void> {
    return IS_MOCK ? (await demo()).unsubscribe(token) : apiFetch(`/newsletter/subscriptions/${encodeURIComponent(token)}`, { method: 'DELETE' });
  },

  async getOpenSurveys(): Promise<Survey[]> {
    return IS_MOCK ? (await demo()).openSurveys() : apiFetch('/surveys?status=open');
  },

  async getSurvey(id: string): Promise<Survey> {
    return IS_MOCK ? (await demo()).getSurvey(id) : apiFetch(`/surveys/${encodeURIComponent(id)}`);
  },

  async submitSurvey(id: string, answers: SurveyAnswers): Promise<void> {
    return IS_MOCK
      ? (await demo()).submitSurvey(id, answers)
      : apiFetch(`/surveys/${encodeURIComponent(id)}/responses`, { method: 'POST', body: { answers } });
  },

  /** Site feedback; `departmentId` routes it to that department's dashboard (WEB-ENG-4). */
  async submitSiteFeedback(input: SiteFeedbackInput): Promise<{ reference: string }> {
    return IS_MOCK ? (await demo()).submitSiteFeedback(input) : apiFetch('/feedback/site', { method: 'POST', body: input });
  },

  /** Alumni who agreed to be listed (WEB-ACD-6). */
  async getAlumni(query?: string): Promise<AlumniProfile[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return IS_MOCK ? (await demo()).alumni(query) : apiFetch(`/alumni${q}`);
  },

  async registerAlumnus(input: AlumniRegistrationInput): Promise<{ reference: string }> {
    return IS_MOCK ? (await demo()).registerAlumnus(input) : apiFetch('/alumni/registrations', { method: 'POST', body: { ...input, consent: true } });
  },
};
