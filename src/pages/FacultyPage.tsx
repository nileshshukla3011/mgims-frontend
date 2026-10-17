import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Search, Phone, Mail, X, Building } from 'lucide-react';
import { apiService } from '@/services/api';
import { FacultyMember } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonCards } from '@/components/ui/Skeleton';

export const FacultyPage: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  usePageMeta(selectedFaculty ? `${selectedFaculty.name} — Faculty` : 'Faculty directory', 'Profiles of professors, physicians and researchers at MGIMS Sevagram.');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openProfile = (faculty: FacultyMember) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSelectedFaculty(faculty);
  };

  const closeProfile = () => {
    setSelectedFaculty(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  // UX4G modal guidance: focus moves into the dialog and Esc closes it.
  useEffect(() => {
    if (!selectedFaculty) return;
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProfile();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedFaculty]);

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const data = await apiService.getFacultyList();
        setFacultyList(data);

        // Check if query param 'select' is set
        const selectSlug = searchParams.get('select');
        if (selectSlug) {
          const match = data.find((f) => f.slug === selectSlug || f.id === selectSlug);
          if (match) setSelectedFaculty(match);
        }
      } catch (err) {
        console.error('Error fetching faculty:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaculty();
  }, [searchParams]);

  const departments = ['all', ...Array.from(new Set(facultyList.map((f) => f.department).filter(Boolean)))];

  const filtered = facultyList.filter((f) => {
    const matchesDept = selectedDept === 'all' || f.department === selectedDept;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase()) ||
      f.bio.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">
          Medical directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">
          Faculty directory & medical staff
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore profiles of over 90+ professors, physicians, clinical specialists, and researchers serving at MGIMS Sevagram.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
          <input
                aria-label="Search faculty by name, specialty, or title"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, specialty, or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="faculty-dept-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter dept:</label>
          <select
            id="faculty-dept-filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-blue outline-hidden font-medium max-w-64"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Specialties & Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results stats */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <strong className="text-slate-800">{filtered.length}</strong> faculty members
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <SkeletonCards label="Loading faculty directory" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((faculty) => (
            <div
              key={faculty.id}
              className="relative bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-blue hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-link border border-blue-200 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6 text-link" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-ink group-hover:text-link leading-snug">
                      {/* The button's ::after stretches over the card so the whole card is clickable and keyboard-focusable. */}
                      <button
                        type="button"
                        onClick={() => openProfile(faculty)}
                        aria-haspopup="dialog"
                        className="text-left after:absolute after:inset-0 after:rounded-xl after:content-['']"
                      >
                        {faculty.name}
                      </button>
                    </h2>
                    <p className="text-xs font-semibold text-amber-700 mt-0.5">{faculty.designation}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-600" />
                      {faculty.department}
                    </p>
                  </div>
                </div>

                {faculty.bio && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {faculty.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span aria-hidden="true" className="text-link font-bold underline">
                  View full bio & publications →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Faculty Detail Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onMouseDown={(e) => { if (e.target === e.currentTarget) closeProfile(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="faculty-dialog-title" className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-brand-navy text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 id="faculty-dialog-title" className="font-bold text-lg font-serif">{selectedFaculty.name}</h2>
                  <p className="text-xs text-amber-300 font-medium">
                    {selectedFaculty.designation} — {selectedFaculty.department}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeProfile}
                aria-label="Close profile"
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
              {selectedFaculty.paragraphs && selectedFaculty.paragraphs.length > 0 ? (
                selectedFaculty.paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed">{selectedFaculty.bio || selectedFaculty.text}</p>
              )}

              {/* Contact lines if available */}
              {(selectedFaculty.phones?.length > 0 || selectedFaculty.emails?.length > 0) && (
                <div className="pt-4 border-t border-slate-200 space-y-2 bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-bold text-xs text-ink tracking-wider">Contact details</h4>
                  {selectedFaculty.phones?.length > 0 && (
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-link" />
                      <span>{selectedFaculty.phones.join(', ')}</span>
                    </p>
                  )}
                  {selectedFaculty.emails?.length > 0 && (
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-link" />
                      <span className="font-mono">{selectedFaculty.emails.join(', ')}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={closeProfile}
                className="min-h-11 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition"
              >
                Close profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
