import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Users, BookOpen, Stethoscope, ArrowLeft, User, Newspaper } from 'lucide-react';
import { apiService } from '@/services/api';
import { Department, FacultyMember } from '@/types';
import { OfficialContent } from '@/components/content/OfficialContent';
import { ReviewContent, SHOW_REVIEW_CONTENT } from '@/components/content/ReviewContent';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { isFacultyInDepartment } from '@/utils/departments';
import { DepartmentNotices } from '@/components/dynamic/DepartmentNotices';

export const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<Department | null>(null);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'academics' | 'faculty' | 'notices'>('overview');
  const [loading, setLoading] = useState(true);
  usePageMeta(dept ? `Department of ${dept.name}` : 'Department', dept?.paragraphs?.[0]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [d, allFac] = await Promise.all([
          apiService.getDepartmentById(id),
          apiService.getFacultyList(),
        ]);
        if (d) {
          setDept(d);
          // Match faculty
          setFacultyMembers(allFac.filter((f) => isFacultyInDepartment(f, d)));
        }
      } catch (err) {
        console.error('Error fetching department:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8"><SkeletonRows count={6} label="Loading department details" /></div>
    );
  }

  if (!dept) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Department not found</h2>
        <p className="text-xs text-slate-500">The requested medical department could not be found.</p>
        <Link to="/departments" className="inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to departments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/departments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all departments
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
              dept.category === 'Clinical' ? 'bg-blue-100 text-blue-800' :
              dept.category === 'Para-clinical' ? 'bg-purple-100 text-purple-800' :
              dept.category === 'Pre-clinical' ? 'bg-emerald-100 text-emerald-800' :
              'bg-slate-200 text-slate-800'
            }`}>
              {dept.category} Department
            </span>
            <span className="text-xs text-slate-500">MGIMS Sevagram & Kasturba Hospital</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">
            Department of {dept.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Delivering excellence in medical education, rural specialty healthcare, and research.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/contact"
            className="bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            Department Contacts
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          aria-pressed={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-brand-blue text-link'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        {SHOW_REVIEW_CONTENT && (
          <button
            type="button"
            aria-pressed={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'border-brand-blue text-link'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Clinical & diagnostic services</span>
          </button>
        )}

        {SHOW_REVIEW_CONTENT && (
          <button
            type="button"
            aria-pressed={activeTab === 'academics'}
            onClick={() => setActiveTab('academics')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'academics'
                ? 'border-brand-blue text-link'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & training</span>
          </button>
        )}

        <button
          type="button"
          aria-pressed={activeTab === 'faculty'}
          onClick={() => setActiveTab('faculty')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'faculty'
              ? 'border-brand-blue text-link'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty & Staff ({facultyMembers.length || dept.faculty.length})</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'notices'}
          onClick={() => setActiveTab('notices')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'notices'
              ? 'border-brand-blue text-link'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Notices & events</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold font-serif text-ink">About the department</h2>

            <OfficialContent page={dept} showHeading={false} />
          </div>
        )}

        {/* 2. SERVICES */}
        {activeTab === 'services' && SHOW_REVIEW_CONTENT && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold font-serif text-ink">Clinical, diagnostic & support services</h2>
            <ReviewContent note="This general description is not specific to the department and was not taken from its official page.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <h3 className="font-bold text-sm text-link">Outpatient consultation & specialty clinics</h3>
                <p className="text-xs text-slate-600">
                  Comprehensive OPD consultations from 8:00 AM to 1:00 PM, Monday through Saturday in Kasturba Hospital OPD complex.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <h3 className="font-bold text-sm text-link">24x7 Inpatient & Emergency Coverage</h3>
                <p className="text-xs text-slate-600">
                  Dedicated specialty wards, intensive care coverage, emergency bedside consultations, and round-the-clock on-call consultants.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              For complete tariff, investigation rates, and concessions under Ayushman Bharat / MJPJAY, visit the{' '}
              <Link to="/hospital/charges" className="text-link font-bold hover:underline">
                Hospital charges directory
              </Link>.
            </p>
            </ReviewContent>
          </div>
        )}

        {/* 3. ACADEMICS */}
        {activeTab === 'academics' && SHOW_REVIEW_CONTENT && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold font-serif text-ink">Curriculum & academic training</h2>
            <ReviewContent note="This general description is not specific to the department and was not taken from its official page.">
            <div className="space-y-3">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                <h3 className="font-bold text-sm text-slate-900">Undergraduate teaching (MBBS)</h3>
                <p className="text-xs text-slate-600">
                  Didactic lectures, practical laboratory classes, clinical bedside postings, and community field visits in compliance with the NMC CBME curriculum.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                <h3 className="font-bold text-sm text-slate-900">Postgraduate residency (MD / MS)</h3>
                <p className="text-xs text-slate-600">
                  3-year structured residency, weekly journal clubs, clinical case presentations, seminars, mortality audits, and mandatory thesis research.
                </p>
              </div>
            </div>
            </ReviewContent>
          </div>
        )}

        {/* 4. FACULTY */}
        {activeTab === 'faculty' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-ink">Faculty & Physicians in {dept.name}</h2>

            {facultyMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyMembers.map((fac) => (
                  <div
                    key={fac.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-brand-blue hover:shadow-xs transition bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-link flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-ink">{fac.name}</h3>
                        <p className="text-xs text-slate-500">{fac.designation}</p>
                      </div>
                    </div>
                    {fac.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {fac.bio}
                      </p>
                    )}
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <Link
                        to={`/faculty?select=${fac.slug}`}
                        className="text-link font-bold hover:underline"
                      >
                        View full faculty profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <p>Faculty members recorded in department register:</p>
                <div className="flex flex-wrap gap-2">
                  {dept.faculty.map((fName, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-medium border border-slate-200">
                      {fName}
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <Link to="/faculty" className="text-link font-bold hover:underline">
                    Search complete MGIMS faculty directory →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. NOTICES placed automatically from the notice board (WEB-DYN-3) */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-serif text-ink">Notices & events of {dept.name}</h2>
            <DepartmentNotices departmentId={dept.id} departmentName={dept.name} />
          </div>
        )}
      </div>
    </div>
  );
};
