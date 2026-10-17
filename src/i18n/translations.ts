import { Language } from '@/types';
import { serviceStrings, ServiceKey } from '@/i18n/services';

// UI strings for the language switcher (menus and site chrome); the online services' strings come from
// src/i18n/services. Most page content is in English. English defines the keys; Hindi and Marathi must have the same.
const en = {
  'home': 'Home',
  'about_us': 'About Us',
  'hospital': 'Kasturba Hospital',
  'academics': 'Academics',
  'departments': 'Departments',
  'faculty': 'Faculty Directory',
  'research': 'Research',
  'accreditations': 'Accreditations',
  'tenders': 'Tenders',
  'recruitment': 'Recruitment',
  'community': 'Community Outreach',
  'contact': 'Contact & Directory',
  'search': 'Search',
  'emergency_help': '24x7 Emergency Helpline',
  'skip_to_content': 'Skip to main content',
  'screen_reader': 'Screen Reader Access',
  'high_contrast': 'High Contrast',
  'font_size': 'Font Size',
  'read_more': 'Read More',
  'download': 'Download',
  'view_details': 'View Details',
  'institute_full_name': 'Mahatma Gandhi Institute of Medical Sciences',
  'institute_tagline': 'Sevagram, Wardha, Maharashtra — Estd. 1969',
  'society_name': 'Kasturba Health Society',
};

type BaseKey = keyof typeof en;

/** Every translation key; t() only accepts these, so a missing or mistyped key fails the type-check. */
export type TranslationKey = BaseKey | ServiceKey;

/** The tasks that persona and portal pages can list: the `x` of every `hub.task.x` key. */
export type TaskKey = TranslationKey extends infer K ? (K extends `hub.task.${infer Task}` ? Task : never) : never;

const hi: Record<BaseKey, string> = {
  'home': 'मुख्य पृष्ठ',
  'about_us': 'हमारे बारे में',
  'hospital': 'कस्तूरबा अस्पताल',
  'academics': 'शैक्षणिक',
  'departments': 'विभाग',
  'faculty': 'संकाय निर्देशिका',
  'research': 'अनुसंधान',
  'accreditations': 'मान्यता व प्रत्यायन',
  'tenders': 'निविदाएं',
  'recruitment': 'भर्ती एवं नियुक्तियां',
  'community': 'सामुदायिक सेवाएं',
  'contact': 'संपर्क एवं निर्देशिका',
  'search': 'खोजें',
  'emergency_help': '२४x७ आपातकालीन हेल्पलाइन',
  'skip_to_content': 'मुख्य सामग्री पर जाएं',
  'screen_reader': 'स्क्रीन रीडर सहायता',
  'high_contrast': 'उच्च कंट्रास्ट',
  'font_size': 'फ़ॉन्ट आकार',
  'read_more': 'अधिक पढ़ें',
  'download': 'डाउनलोड',
  'view_details': 'विवरण देखें',
  'institute_full_name': 'महात्मा गांधी आयुर्विज्ञान संस्थान',
  'institute_tagline': 'सेवाग्राम, वर्धा, महाराष्ट्र — स्थापना १९६९',
  'society_name': 'कस्तूरबा हेल्थ सोसाइटी',
};

const mr: Record<BaseKey, string> = {
  'home': 'मुख्य पृष्ठ',
  'about_us': 'आमच्याबद्दल',
  'hospital': 'कस्तुरबा रुग्णालय',
  'academics': 'शैक्षणिक',
  'departments': 'विभाग',
  'faculty': 'प्राध्यापक वर्ग',
  'research': 'संशोधन',
  'accreditations': 'प्रत्यायन व मान्यता',
  'tenders': 'निविदा',
  'recruitment': 'भरती व पदभरती',
  'community': 'समुदाय पोहोच',
  'contact': 'संपर्क व निर्देशिका',
  'search': 'शोधा',
  'emergency_help': '२४x७ आपत्कालीन मदत',
  'skip_to_content': 'मुख्य मजकुरावर जा',
  'screen_reader': 'स्क्रीन रीडर प्रवेश',
  'high_contrast': 'उच्च कॉन्ट्रास्ट',
  'font_size': 'फॉन्ट आकार',
  'read_more': 'अधिक वाचा',
  'download': 'डाउनलोड',
  'view_details': 'तपशील पहा',
  'institute_full_name': 'महात्मा गांधी वैद्यकीय विज्ञान संस्था',
  'institute_tagline': 'सेवाग्राम, वर्धा, महाराष्ट्र — स्थापना १९६९',
  'society_name': 'कस्तुरबा हेल्थ सोसायटी',
};

export const translations: Record<Language, Record<string, string>> = {
  en: { ...serviceStrings.en, ...en },
  hi: { ...serviceStrings.hi, ...hi },
  mr: { ...serviceStrings.mr, ...mr },
};
