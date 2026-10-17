import React, { useState, useCallback } from 'react';
import { AccessibilityBar } from '@/components/layout/AccessibilityBar';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AlertTicker } from '@/components/layout/AlertTicker';
import { Navbar } from '@/components/layout/Navbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ScrollOnNavigate } from '@/components/navigation/ScrollOnNavigate';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SearchModal } from '@/components/search/SearchModal';
import { ExternalLinkNotice } from '@/components/accessibility/ExternalLinkNotice';
import { FloatingAccessibilityWidget } from '@/components/accessibility/AccessibilitySettings';

interface LayoutProps {
  children: React.ReactNode;
  customCrumbs?: { label: string; path?: string }[];
}

export const Layout: React.FC<LayoutProps> = ({ children, customCrumbs }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      <ScrollOnNavigate />
      <div data-print-hide>
        {/* 1. UX4G Accessibility Toolbar */}
        <AccessibilityBar />

        {/* 2. Institute header with logo & branding */}
        <SiteHeader onOpenSearch={() => setIsSearchOpen(true)} />

        {/* 3. Emergency / Urgent Notice Ticker */}
        <AlertTicker />
      </div>

      {/* 4. Multi-tier Megamenu Navigation */}
      <Navbar />

      {/* 5. Accessible Breadcrumbs */}
      <Breadcrumbs customCrumbs={customCrumbs} />

      {/* 6. Main Page Content with skip link target */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
        {children}
      </main>

      {/* 7. Site footer: ownership, policies, contact */}
      <SiteFooter />

      {/* 8. Global Portal Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      {/* 9. Redirection notice for links leaving the portal */}
      <ExternalLinkNotice />

      {/* 10. Sticky accessibility widget (bottom-right) */}
      <FloatingAccessibilityWidget />
    </div>
  );
};
