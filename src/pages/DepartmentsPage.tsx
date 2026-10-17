import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Search, ArrowRight, Users } from 'lucide-react';
import { apiService } from '@/services/api';
import { Department } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonCards } from '@/components/ui/Skeleton';

export const DepartmentsPage: React.FC = () => {
  usePageMeta('Medical departments', 'The 24 pre-clinical, para-clinical and clinical departments of MGIMS Sevagram.');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepts() {
      try {
        const data = await apiService.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error loading departments:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDepts();
  }, []);

  const catParam = searchParams.get('cat');
  useEffect(() => {
    if (catParam === 'pre') setSelectedCategory('Pre-clinical');
    else if (catParam === 'para') setSelectedCategory('Para-clinical');
    else if (catParam === 'clinical') setSelectedCategory('Clinical');
    else if (catParam === 'super') setSelectedCategory('Super-speciality');
    else setSelectedCategory('all');
  }, [catParam]);

  const categories = ['all', 'Pre-clinical', 'Para-clinical', 'Clinical', 'Super-speciality', 'Support'];

  const filteredDepts = departments.filter((dept) => {
    const matchesCat = selectedCategory === 'all' || dept.category === selectedCategory;
    const matchesSearch =
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.overview.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">
          Academic & clinical wings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">
          Medical departments at MGIMS
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore all 24 departments spanning basic medical sciences, para-clinical diagnostic laboratories, and tertiary clinical specialties.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
          <input
                aria-label="Search department by name"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department by name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (cat === 'all') setSearchParams({});
                else if (cat === 'Pre-clinical') setSearchParams({ cat: 'pre' });
                else if (cat === 'Para-clinical') setSearchParams({ cat: 'para' });
                else if (cat === 'Clinical') setSearchParams({ cat: 'clinical' });
                else if (cat === 'Super-speciality') setSearchParams({ cat: 'super' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Departments' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <SkeletonCards label="Loading medical departments" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <Link
              key={dept.id}
              to={`/departments/${dept.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-blue hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    dept.category === 'Clinical' ? 'bg-blue-100 text-blue-800' :
                    dept.category === 'Para-clinical' ? 'bg-purple-100 text-purple-800' :
                    dept.category === 'Pre-clinical' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {dept.category}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-link transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>

                <h2 className="font-bold text-base text-ink group-hover:text-link mb-2 font-serif">
                  {dept.name}
                </h2>

                {dept.overview && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{dept.overview}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  {dept.faculty.length > 0 ? `${dept.faculty.length} Faculty Members` : 'Faculty Profile'}
                </span>
                <span className="text-link font-bold group-hover:underline flex items-center gap-1">
                  <span>View details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
