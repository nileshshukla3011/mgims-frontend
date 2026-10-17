import React from 'react';
import { PhoneCall, Search, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Link } from 'react-router-dom';
import mgimsLogo from '@/assets/images/mgims-logo-160.jpg';
import mgimsLogoLarge from '@/assets/images/mgims-logo.jpg';

interface NationalHeaderProps {
  onOpenSearch: () => void;
}

export const SiteHeader: React.FC<NationalHeaderProps> = ({ onOpenSearch }) => {
  const { t } = useAccessibility();

  return (
    <header className="bg-white border-b border-slate-200">
      {/* Indian National Tiranga Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-flag-saffron via-white to-flag-green"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left: Branding & Logos */}
          <Link to="/" className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left group">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <img
                src={mgimsLogo}
                srcSet={`${mgimsLogo} 160w, ${mgimsLogoLarge} 400w`}
                sizes="80px"
                width={80}
                height={80}
                alt="Mahatma Gandhi Institute of Medical Sciences logo"
                className="h-16 w-16 object-contain sm:h-20 sm:w-20"
              />
              {/* Grade per the official notice "MGIMS awarded A+ grade by NAAC". */}
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" /> NAAC Accredited "A+" Grade
              </span>
            </div>

            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider">
                Kasturba Health Society's
              </span>
              <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-ink leading-tight font-serif">
                {t('institute_full_name')}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Sevagram, Wardha, Maharashtra 442102 — India's first rural medical college
              </p>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Affiliated to MUHS, Nashik | Recognized by National Medical Commission (NMC)
              </p>
            </div>
          </Link>

          {/* Right: Emergency Card & Search trigger */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {/* 24x7 Kasturba Emergency Callout */}
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-900 px-3 py-2 rounded-lg shadow-xs hover:bg-red-100 transition">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-red-700 block">
                  24x7 Emergency / Casualty
                </span>
                <a
                  href="tel:07152284341"
                  className="text-xs sm:text-sm font-extrabold text-red-900 tracking-wide hover:underline"
                >
                  07152-284341 to 55
                </a>
              </div>
            </div>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium transition cursor-pointer shadow-2xs"
              aria-label="Open portal search"
              aria-haspopup="dialog"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Search portal</span>
              <kbd className="hidden md:inline-block bg-white text-slate-500 border border-slate-300 rounded px-1.5 py-0.5 text-[10px]">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
