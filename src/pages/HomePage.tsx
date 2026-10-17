import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, FileText, Briefcase, GraduationCap, HeartPulse, Award, ChevronRight, Shield, Sparkles, BookOpen, ArrowUpRight } from 'lucide-react';
import { apiService } from '@/services/api';
import { NoticeSummary } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sortByDate } from '@/utils/noticeDates';
import { HospitalStats } from '@/components/dynamic/HospitalStats';
import { PersonaSelector } from '@/pages/PersonaPage';
import { HeroSlideshow } from '@/components/home/HeroSlideshow';

// General institute services. Patient, student and fee services are reached through the "I am a…" cards and
// their portals above (src/config/portals.ts), so they are not repeated here.
const GENERAL_SERVICES = [
  {
    title: 'Hospital charges & tariff',
    desc: 'Official rates for investigations, procedures, beds, anaesthesia and diet at Kasturba Hospital.',
    link: '/hospital/charges',
    badge: 'Charges',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    icon: FileText,
  },
  {
    title: 'Tenders & procurement',
    desc: 'Tender notices for equipment, drugs and supplies, with downloadable documents.',
    link: '/tenders',
    badge: 'Tenders',
    badgeColor: 'bg-purple-100 text-purple-800',
    icon: FileText,
  },
  {
    title: 'Faculty & staff careers',
    desc: 'Current vacancies, recruitment notices, and shortlisted eligible/not-eligible candidate lists.',
    link: '/recruitment',
    badge: 'Job Openings',
    badgeColor: 'bg-teal-100 text-teal-800',
    icon: Briefcase,
  },
];

const HOSPITAL_WINGS = [
  { title: 'Cath lab & interventional cardiology', desc: 'Angiography suite and cardiac catheterization for patients with heart disease.', path: '/hospital/specialities' },
  { title: 'Radiation oncology & linear accelerator', desc: 'Telecobalt and modern Linear Accelerator for cancer therapy.', path: '/hospital/specialities' },
  { title: 'Model maternal & child health (MCH) wing', desc: '100-bed model wing for reproductive, maternal, newborn, child and adolescent health (RMNCH+A).', path: '/hospital/specialities' },
  { title: 'Arogyadham integrative medicine', desc: 'Holistic health through Naturopathy, Yoga, Ayurveda, and lifestyle therapy.', path: '/hospital/arogyadham' },
  { title: 'Tribal outreach (Melghat hospital)', desc: 'Dr. Sushila Nayar Hospital in Utavali, Melghat providing care to indigenous tribal communities.', path: '/hospital/melghat' },
  { title: 'Health insurance schemes', desc: 'MJPJAY and other schemes as per eligibility, and the Jowar Health Assurance Scheme for villagers.', path: '/hospital/health-insurance' },
];

export const HomePage: React.FC = () => {
  usePageMeta(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'tenders' | 'recruitment' | 'cme'>('all');
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [tenders, setTenders] = useState<NoticeSummary[]>([]);
  const [recruitment, setRecruitment] = useState<NoticeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allN, tN, rN] = await Promise.all([
          apiService.getNotices(),
          apiService.getTenders(),
          apiService.getRecruitment(),
        ]);
        // Newest first, so the board shows the latest official notices.
        setNotices(sortByDate(allN, 'newest').slice(0, 10));
        setTenders(sortByDate(tN, 'newest').slice(0, 8));
        setRecruitment(sortByDate(rN, 'newest').slice(0, 8));
      } catch (err) {
        console.error('Error loading notices:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Hero Banner, over a slideshow of archive photos */}
      <HeroSlideshow labelledBy="home-title">
        <div className="max-w-7xl mx-auto px-4 pt-40 pb-6 sm:pt-12 lg:pt-16 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* The text sits on its own dark panel, so the photos behind the banner can stay bright. */}
            <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/15 bg-brand-navy/75 p-5 shadow-xl backdrop-blur-md sm:p-7">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Established in 1969 — Mahatma Gandhi Centenary year</span>
              </div>

              <h1 id="home-title" className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-white">
                Mahatma Gandhi Institute of Medical Sciences
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-light max-w-2xl leading-relaxed">
                Sevagram, Wardha, Maharashtra — a rural medical institute and its teaching hospital, Kasturba Hospital, run by Kasturba Health Society. Combining modern medical science with Gandhian values of self-reliance, ethics and compassionate service.
              </p>

              {/* Quick Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/hospital/emergency"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>24x7 Emergency (07152-284341)</span>
                </Link>

                <Link
                  to="/hospital/charges"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Hospital charges & tariff</span>
                </Link>

                <Link
                  to="/academics/mbbs"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>MBBS admissions</span>
                </Link>
              </div>
            </div>

            {/* Right Card: Kasturba Hospital Quick Summary */}
            <div className="lg:col-span-4 lg:col-start-9 bg-brand-navy/75 backdrop-blur-md rounded-xl p-5 border border-white/20 text-xs space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="font-bold text-amber-300 tracking-wider text-[11px]">
                  Kasturba Hospital Sevagram
                </span>
                <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Teaching hospital
                </span>
              </div>

              <div className="space-y-2 text-slate-200">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>No medical representatives on campus, to keep prescribing rational and low-cost.</span>
                </div>
                <div className="flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Health insurance schemes such as MJPJAY, as listed in the Citizen Charter.</span>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                  <span>Recognized by National Medical Commission (NMC) & affiliated to MUHS Nashik.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20">
                <Link
                  to="/hospital/overview"
                  className="text-amber-300 hover:text-white font-bold flex items-center justify-between group"
                >
                  <span>Explore hospital services & wings</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HeroSlideshow>

      {/* Persona destinations: patients, students, faculty, public, regulators (WEB-IA-3) */}
      <PersonaSelector />

      {/* 2. Key Citizen Services Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <span className="text-xs font-bold text-amber-800 tracking-widest block">
            Public services
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-ink font-serif">
            Campus & citizen services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {GENERAL_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.link}
                to={srv.link}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-blue hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-link flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${srv.badgeColor}`}>
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ink group-hover:text-link mb-1.5">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-link group-hover:text-blue-700">
                  <span>Access service</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Key figures: hospital statistics from HIMS via the API (SRS 4.8) */}
      <HospitalStats />

      {/* 4. Live Updates, Tenders & Recruitment Center */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Notice Board */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-brand-navy text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base font-serif">Information notice board</h3>
                <p className="text-xs text-slate-300">Official circulars, tenders, vacancies & CMEs</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  aria-pressed={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded font-medium transition ${activeTab === 'all' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:text-white'}`}
                >
                  All notices
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'tenders'}
                  onClick={() => setActiveTab('tenders')}
                  className={`px-2.5 py-1 rounded font-medium transition ${activeTab === 'tenders' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:text-white'}`}
                >
                  Tenders ({tenders.length})
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'recruitment'}
                  onClick={() => setActiveTab('recruitment')}
                  className={`px-2.5 py-1 rounded font-medium transition ${activeTab === 'recruitment' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:text-white'}`}
                >
                  Jobs ({recruitment.length})
                </button>
              </div>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-120 overflow-y-auto">
              {loading ? (
                <div className="text-center py-10 text-slate-500 text-sm">Loading notices...</div>
              ) : (
                (activeTab === 'tenders' ? tenders : activeTab === 'recruitment' ? recruitment : notices).map((item) => (
                  <div key={item.id} className="py-3.5 hover:bg-slate-50/80 px-2 rounded-lg transition group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.category === 'Tender' ? 'bg-purple-100 text-purple-800' :
                        item.category === 'Recruitment' ? 'bg-teal-100 text-teal-800' :
                        item.category === 'Awards & Honors' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">{item.date}</span>
                    </div>
                    <Link
                      to={`/notices/${item.id}`}
                      className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-link hover:underline block leading-snug"
                    >
                      {item.title}
                    </Link>
                    {item.excerpt && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Displaying recent updates from MGIMS archive</span>
              <Link
                to={activeTab === 'tenders' ? '/tenders' : activeTab === 'recruitment' ? '/recruitment' : '/news'}
                className="text-link font-bold hover:underline flex items-center gap-1"
              >
                <span>View full archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Gandhian Heritage & Founder */}
          <div className="lg:col-span-4 space-y-5">
            {/* Founder Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs tracking-wider">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Our founder's inspiration</span>
              </div>
              <h4 className="text-lg font-serif font-black text-slate-900">
                Dr. Sushila Nayar (1914 – 2001)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Poor healthcare systems and an abound passion to serve mankind rowed Dr. Sushila Nayar to Sevagram. Inspired by Mahatma Gandhi, she pledged to build a medical institute that brings the highest quality scientific medicine to India's poorest villages."
              </p>
              <div className="pt-2">
                <Link
                  to="/about-us/founder"
                  className="text-amber-900 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <span>Read founder's biography & legacy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Gandhian Code & Sevagram Life */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-link" />
                Unique features of MGIMS
              </h4>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-800 font-bold">•</span>
                  <span><strong>Khadi Code:</strong> Faculty and medical students wear Khadi, instilling humility and equality.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-800 font-bold">•</span>
                  <span><strong>Rural Orientation Camp:</strong> Every new MBBS batch spends its first 15 days at Sevagram Ashram, and each student is assigned families in an adopted village.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-800 font-bold">•</span>
                  <span><strong>Jowar Health Assurance Scheme:</strong> villagers insure their families for a small yearly payment.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link
                  to="/about-us/history"
                  className="text-link font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <span>Life at Sevagram & heritage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Speciality Healthcare Wings Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-800 tracking-widest block">
              Advanced clinical care
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink font-serif">
              Specialty healthcare wings at Kasturba Hospital
            </h2>
          </div>
          <Link
            to="/hospital/overview"
            className="text-xs font-bold text-link hover:underline flex items-center gap-1"
          >
            <span>View all hospital services</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOSPITAL_WINGS.map((w, idx) => (
            <Link
              key={idx}
              to={w.path}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-md transition group"
            >
              <h3 className="font-bold text-sm text-ink group-hover:text-link mb-2 flex items-center justify-between">
                <span>{w.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-link group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {w.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Emergency & Campus Contact Strip */}
      <section className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-amber-300">
              Need medical assistance or hospital inquiry?
            </h3>
            <p className="text-xs text-slate-200">
              Kasturba Hospital is situated at Sevagram, Wardha (Maharashtra) — 70 km from Nagpur Airport, 8 km from Wardha Junction and 6 km from Sevagram station.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center">
            <a
              href="tel:07152284341"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Casualty: 07152-284341</span>
            </a>
            <Link
              to="/contact"
              className="bg-white text-ink hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-lg transition"
            >
              View full extension directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
