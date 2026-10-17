import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { ContactCard, GenericPageContent } from '@/types';
import { OfficialContent } from '@/components/content/OfficialContent';
import { InquiryForm } from '@/components/feedback/InquiryForm';
import { usePageMeta } from '@/hooks/usePageMeta';

export const DirectoryContactPage: React.FC = () => {
  usePageMeta('Contact and directory', 'Address, emergency numbers, telephone extensions, inquiry form and directions for MGIMS Sevagram.');
  const [contacts, setContacts] = useState<ContactCard[]>([]);
  const [contactPage, setContactPage] = useState<GenericPageContent>();
  const [gettingHere, setGettingHere] = useState<GenericPageContent>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await apiService.getDirectoryContacts();
        setContacts(data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    }
    fetchContacts();
    // Official address, emergency numbers and directions from the scraped Contact Us / Getting Here pages.
    apiService.getInstituteInfo()
      .then((pages) => {
        setContactPage(pages['contact-us']);
        setGettingHere(pages['getting-here']);
      })
      .catch((err) => console.error('Error fetching contact pages:', err));
  }, []);


  // The first directory card ("Contact Us") is the main address, shown in the emergency box above.
  const filteredContacts = contacts.filter(
    (c) =>
      c.title !== 'Contact Us' &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase()) ||
        c.person.toLowerCase().includes(search.toLowerCase()) ||
        c.raw_details.toLowerCase().includes(search.toLowerCase())),
  );


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">
          Official directory & citizen support
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">
          Contact information & telephone directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Direct extension directory of key officers, departments, hospital emergency desks, and patient grievance nodal officers.
        </p>
      </div>

      {/* Emergency Helpline Strip */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-red-900 font-serif">
              Emergency & immediate assistance helplines
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {(contactPage?.paragraphs ?? []).slice(0, 2).map((para, idx) => (
            <p key={idx} className="bg-white p-4 rounded-lg border border-red-100 font-semibold text-slate-900">{para}</p>
          ))}
        </div>
      </div>

      {/* Two columns: Directory Search & Feedback Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Official Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-ink">Official extension directory</h3>
              <p className="text-xs text-slate-500">EPABX exchange: 07152-284341 to 55 (16 lines)</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
              <input
                aria-label="Search officer or section"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search officer or section..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="relative overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th className="p-3 font-semibold">Section / designation</th>
                    <th className="p-3 font-semibold">Nodal officer / incharge</th>
                    <th className="p-3 font-semibold">Contact & extension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{c.title}</td>
                      <td className="p-3 text-slate-700">{c.person || c.role}</td>
                      <td className="p-3 font-mono text-slate-600">
                        {c.raw_details.includes('Ext.') ? (
                          <span className="font-semibold text-link">
                            {c.raw_details.split('Ext.')[1]?.split('\n')[0] ? `Ext. ${c.raw_details.split('Ext.')[1].split('\n')[0].trim()}` : '07152-284341'}
                          </span>
                        ) : (
                          c.phones.join(', ') || '07152-284341'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Citizen Grievance & Inquiry Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base font-serif text-ink">Citizen grievance and inquiry</h3>
            <p className="text-xs text-slate-500">Send an inquiry or feedback directly to administration</p>
          </div>

          <InquiryForm />

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p><strong>Postal Address:</strong></p>
            <p>Mahatma Gandhi Institute of Medical Sciences</p>
            <p>Sevagram, Wardha, Maharashtra 442102, India</p>
            <p className="text-link font-mono">dean@mgims.ac.in</p>
          </div>
        </div>
      </div>

      {/* Campus Map & Directions */}
      <div id="map" className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-4">
        <h3 className="font-bold text-base font-serif text-ink flex items-center gap-2">
          <MapPin className="w-5 h-5 text-link" />
          Location & how to reach Sevagram
        </h3>
        {/* The official page repeats its directions as Air/Train/Road tabs (the lists) and has link labels whose links
            were not captured ("Wardha Jn. Train List"); show the directions once. */}
        <OfficialContent
          page={gettingHere && { ...gettingHere, lists: [], paragraphs: gettingHere.paragraphs.filter((p) => !/Train List$/.test(p)) }}
          showHeading={false}
        />
      </div>
    </div>
  );
};
