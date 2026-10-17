import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { Layout } from '@/components/layout/Layout';

import { HomePage } from '@/pages/HomePage';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { PORTAL_LIST } from '@/config/portals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppErrorFallback, PageErrorFallback } from '@/components/ErrorFallbacks';

// Inner pages load on demand so the first visit only downloads the home page (UX4G 6.16).
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const HospitalPage = lazy(() => import('@/pages/HospitalPage').then((m) => ({ default: m.HospitalPage })));
const AcademicsPage = lazy(() => import('@/pages/AcademicsPage').then((m) => ({ default: m.AcademicsPage })));
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage })));
const DepartmentDetailPage = lazy(() => import('@/pages/DepartmentDetailPage').then((m) => ({ default: m.DepartmentDetailPage })));
const FacultyPage = lazy(() => import('@/pages/FacultyPage').then((m) => ({ default: m.FacultyPage })));
const ResearchPage = lazy(() => import('@/pages/ResearchPage').then((m) => ({ default: m.ResearchPage })));
const AccreditationsPage = lazy(() => import('@/pages/AccreditationsPage').then((m) => ({ default: m.AccreditationsPage })));
const TendersPage = lazy(() => import('@/pages/TendersPage').then((m) => ({ default: m.TendersPage })));
const RecruitmentPage = lazy(() => import('@/pages/RecruitmentPage').then((m) => ({ default: m.RecruitmentPage })));
const NewsPage = lazy(() => import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage })));
const NoticeDetailPage = lazy(() => import('@/pages/NoticeDetailPage').then((m) => ({ default: m.NoticeDetailPage })));
const CommunityPage = lazy(() => import('@/pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const DirectoryContactPage = lazy(() => import('@/pages/DirectoryContactPage').then((m) => ({ default: m.DirectoryContactPage })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const PolicyPage = lazy(() => import('@/pages/PolicyPage').then((m) => ({ default: m.PolicyPage })));
const ScreenReaderPage = lazy(() => import('@/pages/ScreenReaderPage').then((m) => ({ default: m.ScreenReaderPage })));
const TrackInquiryPage = lazy(() => import('@/pages/TrackInquiryPage').then((m) => ({ default: m.TrackInquiryPage })));
// SRS / FRS services: persona pages, portal entry points, engagement, help and redirects.
const PersonaPage = lazy(() => import('@/pages/PersonaPage').then((m) => ({ default: m.PersonaPage })));
const PortalGateway = lazy(() => import('@/pages/PortalGateway').then((m) => ({ default: m.PortalGateway })));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })));
const SurveyPage = lazy(() => import('@/pages/FeedbackPage').then((m) => ({ default: m.SurveyPage })));
const NewsletterManagePage = lazy(() => import('@/pages/NewsletterManagePage').then((m) => ({ default: m.NewsletterManagePage })));
const AlumniPage = lazy(() => import('@/pages/AlumniPage').then((m) => ({ default: m.AlumniPage })));
const AlumniProfilePage = lazy(() => import('@/pages/AlumniProfilePage').then((m) => ({ default: m.AlumniProfilePage })));
const SitemapPage = lazy(() => import('@/pages/SitemapPage').then((m) => ({ default: m.SitemapPage })));
const HelpPage = lazy(() => import('@/pages/InfoPages').then((m) => ({ default: m.HelpPage })));
const AccessibilityStatementPage = lazy(() => import('@/pages/InfoPages').then((m) => ({ default: m.AccessibilityStatementPage })));
const LegacyRedirectPage = lazy(() => import('@/pages/LegacyRedirectPage').then((m) => ({ default: m.LegacyRedirectPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

/** A page that fails shows a message in its place; going to another address clears it. */
function PageBoundary({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary name="page" fallback={PageErrorFallback} resetKey={pathname}>{children}</ErrorBoundary>;
}

export function App() {
  return (
    <ErrorBoundary name="app" fallback={AppErrorFallback}>
      <AccessibilityProvider>
        <Router>
          <Layout>
            <PageBoundary>
              <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><SkeletonCards label="Loading page" /></div>}>
                <Routes>
                  <Route path="/" element={<HomePage />} />

                  {/* Institute & About Us */}
                  <Route path="/about-us" element={<Navigate to="/about-us/overview" replace />} />
                  <Route path="/about-us/:section" element={<AboutPage />} />

                  {/* Kasturba Hospital */}
                  <Route path="/hospital" element={<Navigate to="/hospital/overview" replace />} />
                  <Route path="/hospital/:section" element={<HospitalPage />} />

                  {/* Academics & Admissions */}
                  <Route path="/academics" element={<Navigate to="/academics/overview" replace />} />
                  <Route path="/academics/:section" element={<AcademicsPage />} />
                  <Route path="/admissions" element={<Navigate to="/academics/admissions" replace />} />
                  <Route path="/alumni" element={<AlumniPage />} />
                  <Route path="/alumni/:slug" element={<AlumniProfilePage />} />

                  {/* Departments */}
                  <Route path="/departments" element={<DepartmentsPage />} />
                  <Route path="/departments/:id" element={<DepartmentDetailPage />} />

                  {/* Faculty Directory */}
                  <Route path="/faculty" element={<FacultyPage />} />

                  {/* Research */}
                  <Route path="/research" element={<Navigate to="/research/overview" replace />} />
                  <Route path="/research/:section" element={<ResearchPage />} />

                  {/* Accreditations */}
                  <Route path="/accreditations" element={<Navigate to="/accreditations/naac" replace />} />
                  <Route path="/accreditations/:section" element={<AccreditationsPage />} />

                  {/* Tenders, Recruitment & News */}
                  <Route path="/tenders" element={<TendersPage />} />
                  <Route path="/recruitment" element={<RecruitmentPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/notices/:id" element={<NoticeDetailPage />} />

                  {/* Community & Outreach */}
                  <Route path="/community" element={<Navigate to="/community/cbme" replace />} />
                  <Route path="/community/:section" element={<CommunityPage />} />

                  {/* Contact & Directory */}
                  <Route path="/contact" element={<DirectoryContactPage />} />
                  <Route path="/contact/track" element={<TrackInquiryPage />} />

                  {/* Universal Search */}
                  <Route path="/search" element={<SearchPage />} />

                  {/* Website Policies (Privacy, Terms, Disclaimer, Hyperlinking, FAQs) */}
                  <Route path="/policies" element={<Navigate to="/policies/privacy-policy" replace />} />
                  <Route path="/policies/:slug" element={<PolicyPage />} />

                  <Route path="/screen-reader-access" element={<ScreenReaderPage />} />
                  <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/sitemap" element={<SitemapPage />} />

                  {/* Persona destinations (WEB-IA-3) */}
                  <Route path="/patients" element={<PersonaPage persona="patients" />} />
                  <Route path="/students" element={<PersonaPage persona="students" />} />
                  <Route path="/faculty-staff" element={<PersonaPage persona="faculty-staff" />} />
                  <Route path="/visitors" element={<PersonaPage persona="visitors" />} />
                  <Route path="/regulators" element={<PersonaPage persona="regulators" />} />

                  {/* Patient, Student and Fee portals: built by other teams; each route opens the portal (src/config/portals.ts) */}
                  {PORTAL_LIST.map((portal) => (
                    <Route key={portal.id} path={`${portal.path}/*`} element={<PortalGateway portal={portal.id} />} />
                  ))}

                  {/* Engagement (WEB-ENG) */}
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/feedback/surveys/:id" element={<SurveyPage />} />
                  <Route path="/newsletter/manage" element={<NewsletterManagePage />} />

                  {/* Old website addresses (WEB-ENG-3), then a real "not found" page */}
                  <Route path="/index.php" element={<LegacyRedirectPage />} />
                  <Route path="/index.php/*" element={<LegacyRedirectPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </PageBoundary>
          </Layout>
        </Router>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
