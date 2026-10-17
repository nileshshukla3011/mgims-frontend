// Portal entry points (src/config/portals.ts): [English, Hindi, Marathi].
import { Triple } from '@/i18n/services/common';

export const portalStrings = {
  'portal.patient.title': ['Patient Portal', 'रोगी पोर्टल', 'रुग्ण पोर्टल'],
  'portal.patient.intro': [
    'For patients of Kasturba Hospital: appointments, reports and bills.',
    'कस्तूरबा अस्पताल के रोगियों के लिए: अपॉइंटमेंट, रिपोर्ट और बिल।',
    'कस्तुरबा रुग्णालयातील रुग्णांसाठी: अपॉइंटमेंट, रिपोर्ट आणि बिले.',
  ],
  'portal.student.title': ['Student Portal', 'छात्र पोर्टल', 'विद्यार्थी पोर्टल'],
  'portal.student.intro': [
    'For students and applicants: admissions, results and academic records.',
    'छात्रों और आवेदकों के लिए: प्रवेश, परिणाम और शैक्षणिक रिकॉर्ड।',
    'विद्यार्थी आणि अर्जदारांसाठी: प्रवेश, निकाल आणि शैक्षणिक नोंदी.',
  ],
  'portal.fee.title': ['Fee Portal', 'शुल्क पोर्टल', 'शुल्क पोर्टल'],
  'portal.fee.intro': [
    'Pay fees online: academic and hostel fees, workshops and conferences.',
    'ऑनलाइन शुल्क भुगतान: शैक्षणिक और छात्रावास शुल्क, कार्यशालाएँ और सम्मेलन।',
    'ऑनलाइन शुल्क भरणा: शैक्षणिक आणि वसतिगृह शुल्क, कार्यशाळा आणि परिषदा.',
  ],
  'portal.coming': [
    'The {portal} is being connected to this website. It will open on this page when it is ready.',
    '{portal} को इस वेबसाइट से जोड़ा जा रहा है। तैयार होने पर यह इसी पेज पर खुलेगा।',
    '{portal} या वेबसाइटशी जोडले जात आहे. तयार झाल्यावर ते याच पानावर उघडेल.',
  ],
  'portal.meanwhile': ['Until then', 'तब तक', 'तोपर्यंत'],
  'portal.opening': ['Opening the {portal}…', '{portal} खुल रहा है…', '{portal} उघडत आहे…'],
  'portal.open_link': ['Open the {portal}', '{portal} खोलें', '{portal} उघडा'],
  'portal.loading': ['Loading the {portal}…', '{portal} लोड हो रहा है…', '{portal} लोड होत आहे…'],
  'hub.task.patient_portal': ['Patient Portal', 'रोगी पोर्टल', 'रुग्ण पोर्टल'],
  'hub.task.fee_portal': ['Fee Portal: pay fees online', 'शुल्क पोर्टल: ऑनलाइन शुल्क भरें', 'शुल्क पोर्टल: ऑनलाइन शुल्क भरा'],
} satisfies Record<string, Triple>;
