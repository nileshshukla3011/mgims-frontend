// JSON shapes of the website's online services: engagement (WEB-ENG-*) and synced data (WEB-DYN-*).
// docs/BACKEND_INTEGRATION_GUIDE.md lists the endpoints.
import { Language } from '@/types';

// ---------------------------------------------------------------- Engagement (WEB-ENG-*)

export interface NewsletterSegment {
  id: string;
  title: string;
  description: string;
}

export interface NewsletterSubscription {
  token: string;
  email: string;
  segments: string[];
  language: Language;
  status: 'Pending confirmation' | 'Active' | 'Unsubscribed';
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'single' | 'multiple' | 'text' | 'longtext';
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  /** Department the answers are routed to (WEB-ENG-4); empty for institute-wide surveys. */
  departmentId?: string;
  status: 'Draft' | 'Open' | 'Closed';
  closesOn?: string;
  anonymous: boolean;
  questions: SurveyQuestion[];
}

export type SurveyAnswers = Record<string, string | string[]>;

export interface SiteFeedbackInput {
  rating: number;
  lookingFor?: string;
  found?: 'Yes' | 'Partly' | 'No';
  comment?: string;
  departmentId?: string;
  page?: string;
  email?: string;
}

export interface AlumniProfile {
  id: string;
  name: string;
  batch: string;
  currentRole?: string;
  organisation?: string;
  city?: string;
  specialty?: string;
}

export interface AlumniRegistrationInput {
  name: string;
  batch: string;
  email: string;
  phone?: string;
  currentRole?: string;
  organisation?: string;
  city?: string;
  specialty?: string;
  showInDirectory: boolean;
}

// ---------------------------------------------------------------- Dynamic content (WEB-DYN-*)

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodAvailability {
  bankName: string;
  /** When the stock was last synced from e-RaktKosh. */
  updatedAt: string;
  source: string;
  components: string[];
  stock: { group: BloodGroup; units: Record<string, number> }[];
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  date: string;
  url: string;
  source: string;
  category?: string;
}

export interface HospitalStatistics {
  /** Year or period the figures cover. */
  period: string;
  source: string;
  updatedAt?: string;
  items: { id: string; label: string; value: string; note?: string }[];
}

export interface PublicResult {
  id: string;
  title: string;
  date: string;
  /** Internal path (a notice page) or a document URL. */
  url: string;
  programme?: string;
}
