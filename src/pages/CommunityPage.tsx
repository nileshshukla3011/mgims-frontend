import React from 'react';
import { Radio, Users, HeartHandshake, Sparkles, Baby, Shield } from 'lucide-react';
import { apiService } from '@/services/api';
import { SectionedPage, SectionConfig } from '@/components/content/SectionedPage';
import { ReviewContent } from '@/components/content/ReviewContent';

// The Jowar Health Assurance Scheme (village health insurance) is described on the hospital's Health Insurance page.
const loadCommunity = () =>
  Promise.all([apiService.getCommunity(), apiService.getHospitalServices()]).then(([community, hospital]) => ({
    ...community,
    'health-insurance': hospital['health-insurance'],
  }));

// Hand-written in the earlier design; no dedicated official page was captured for these initiatives.
const OtherInitiatives: React.FC = () => (
  <ReviewContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
      <div className="border border-slate-200 rounded-xl p-5 space-y-2 bg-slate-50">
        <h3 className="flex items-center gap-2 font-bold text-sm text-ink">
          <HeartHandshake className="h-4 w-4 text-link" aria-hidden="true" /> Village Self-Help Groups (SHGs)
        </h3>
        <p>Women's self-help groups initiated by MGIMS support village health activities and micro-savings for medical emergencies.</p>
      </div>
    </div>
  </ReviewContent>
);

const sections: SectionConfig[] = [
  { id: 'cbme', title: 'Community based medical education', icon: Users, heading: 'Community based medical education', pages: ['community-based-medical-education'] },
  { id: 'activities', title: 'Community activities', icon: Sparkles, heading: 'Community activities', pages: ['community-activities'] },
  { id: 'social-impact', title: 'Social impact', icon: HeartHandshake, heading: 'Social impact', pages: ['social-impact'] },
  { id: 'seva-bhaav', title: 'Seva-Bhaav', icon: Radio, heading: 'Seva-Bhaav', pages: ['seva-bhaav'] },
  { id: 'cbcwd', title: 'CBCWD', icon: Baby, heading: 'CBCWD', pages: ['cbcwd'] },
  { id: 'health-assurance', title: 'Village health assurance', icon: Shield, heading: 'Jowar Health Assurance Scheme', pages: ['health-insurance'] },
  { id: 'other-initiatives', title: 'Other initiatives', icon: Shield, heading: 'Other community initiatives', reviewOnly: true, before: <OtherInitiatives /> },
];

const aliases: Record<string, string> = {
  'community-based-medical-education': 'cbme',
  'community-activities': 'activities',
  'index-php-seva-bhaav': 'seva-bhaav',
  'index-php-social-impact': 'social-impact',
};

export const CommunityPage: React.FC = () => (
  <SectionedPage
    eyebrow="Social Outreach & Rural Extension"
    eyebrowClass="text-emerald-800"
    title="Community Engagement & Social Impact"
    description="Community-based medical education and outreach programmes of MGIMS in Wardha district."
    basePath="/community"
    navLabel="Community Programmes"
    sections={sections}
    loadPages={loadCommunity}
    aliases={aliases}
  />
);
