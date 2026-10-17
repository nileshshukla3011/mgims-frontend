import React from 'react';
import {
  PhoneCall,
  Activity,
  HeartPulse,
  Clock,
  FileText,
  ShieldCheck,
  Stethoscope,
  Building,
  CheckCircle,
  Cpu,
  Droplet,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { HospitalChargesTable } from '@/components/hospital/HospitalChargesTable';
import { BloodAvailability } from '@/components/dynamic/BloodAvailability';

// The Clinical Forensic Medicine Unit works inside the emergency unit but was scraped under About Us.
const loadHospital = () =>
  Promise.all([apiService.getHospitalServices(), apiService.getInstituteInfo()]).then(([hospital, institute]) => ({
    ...hospital,
    'clinical-forensic-medicine-unit': institute['clinical-forensic-medicine-unit'],
  }));

const sections: SectionConfig[] = [
  { id: 'overview', title: 'Hospital overview', icon: Building, heading: 'Kasturba Hospital overview', pages: ['overview', 'hospital-in-numbers'] },
  { id: 'emergency', title: '24x7 casualty & emergency', icon: PhoneCall, heading: 'Accident and emergency', pages: ['accident-and-emergency', 'clinical-forensic-medicine-unit'] },
  { id: 'opd', title: 'Outpatient services (OPD)', icon: Clock, heading: 'Outpatient services', subtitle: 'Department-wise OPD schedule', pages: ['outpatient-services'] },
  { id: 'inpatient', title: 'Inpatient care & wards', icon: Activity, heading: 'Inpatient services', pages: ['inpatient-services'] },
  // The official tariff, which the Hospital Charges page embeds from a published sheet.
  { id: 'charges', title: 'Hospital tariff & charges', icon: FileText, heading: 'Hospital charges', subtitle: 'Investigation, bed, anaesthesia and diet charges', after: <HospitalChargesTable /> },
  { id: 'investigations', title: 'Diagnostic laboratories', icon: Stethoscope, heading: 'Investigation facilities', pages: ['investigation-facilities', 'life-saving-equipment'] },
  { id: 'specialities', title: 'Super-specialty wings', icon: HeartPulse, heading: 'Specialty wings', pages: ['cath-lab', 'model-maternal-and-child-health-mch-wing', 'radiation-oncology'] },
  { id: 'health-insurance', title: 'Health insurance schemes', icon: ShieldCheck, heading: 'Health insurance', pages: ['health-insurance'] },
  { id: 'low-cost-drug', title: 'Low-cost generic drugs', icon: CheckCircle, heading: 'Low-cost drugs & ethical prescribing', pages: ['low-cost-drug', 'no-medical-representatives-in-kasturba-hospital', 'drug'] },
  { id: 'arogyadham', title: 'Arogyadham (integrative med)', icon: Activity, heading: 'Arogyadham', pages: ['arogyadham', 'hospital-arogyadham'] },
  { id: 'melghat', title: 'Melghat tribal hospital', icon: Building, heading: 'Melghat', pages: ['melghat'] },
  { id: 'information-technology', title: 'Hospital IT & HIS', icon: Cpu, heading: 'Information technology & Hospital Information System', pages: ['information-technology', 'his'] },
  { id: 'bmw', title: 'Biomedical waste reports', icon: FileText, heading: 'Bio Medical Waste', pages: ['bmw'] },
  // Live stock from e-RaktKosh once the backend syncs it (WEB-DYN-4).
  { id: 'blood-bank', title: 'Blood bank availability', icon: Droplet, heading: 'Blood bank: availability by blood group', after: <BloodAvailability /> },
];

// Search links and old bookmarks use the scraped site's slugs.
const aliases: Record<string, string> = {
  'accident-and-emergency': 'emergency',
  'outpatient-services': 'opd',
  'inpatient-services': 'inpatient',
  'hospital-charges': 'charges',
  'hospital-in-numbers': 'overview',
  'investigation-facilities': 'investigations',
  'life-saving-equipment': 'investigations',
  'cath-lab': 'specialities',
  'radiation-oncology': 'specialities',
  'model-maternal-and-child-health-mch-wing': 'specialities',
  'drug': 'low-cost-drug',
  'no-medical-representatives-in-kasturba-hospital': 'low-cost-drug',
  'hospital-arogyadham': 'arogyadham',
  'his': 'information-technology',
  'clinical-forensic-medicine-unit': 'emergency',
};

export const HospitalPage: React.FC = () => (
  <SectionedPage
    eyebrow="Patient Care & Clinical Services"
    eyebrowClass="text-red-700"
    title="Kasturba Hospital, Sevagram"
    description="Teaching hospital of MGIMS delivering affordable, evidence-based care to rural communities."
    basePath="/hospital"
    navLabel="Hospital Services"
    sections={sections}
    loadPages={loadHospital}
    aliases={aliases}
    headerAside={
      <a
        href="tel:07152284341"
        className="min-h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
      >
        <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Casualty: 07152-284341</span>
      </a>
    }
  />
);
