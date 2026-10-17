import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { AdminUser, Department, FacultyMember } from '@/types';
import { FacultyEditDialog } from '@/admin/FacultyEditDialog';

/** Faculty the admin may edit: everyone for a super admin, their own department's faculty otherwise. */
export const FacultyPanel: React.FC<{
  user: AdminUser;
  faculty: FacultyMember[];
  departments: Department[];
  onDone: (result: { saved?: FacultyMember; message: string }) => void;
}> = ({ user, faculty, departments, onDone }) => {
  const [editing, setEditing] = useState<FacultyMember | null>(null);
  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
        <div className="relative overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="p-3 font-semibold">Doctor name</th>
                <th className="p-3 font-semibold">Designation</th>
                <th className="p-3 font-semibold">Department</th>
                <th className="p-3 font-semibold">Official phones</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-600">No faculty profiles are linked to this department yet.</td>
                </tr>
              )}
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{f.name}</td>
                  <td className="p-3 text-amber-800 font-semibold">{f.designation}</td>
                  <td className="p-3 text-slate-600">{f.department}</td>
                  <td className="p-3 font-mono text-slate-500">{f.phones.join(', ') || '—'}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(f)}
                      aria-label={`Edit ${f.name}`}
                      title="Edit profile"
                      className="min-h-11 min-w-11 inline-flex items-center justify-center text-link hover:bg-blue-50 rounded transition"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && (
        <FacultyEditDialog
          user={user}
          member={editing}
          departmentId={departments.find((d) => d.name === editing.department)?.id}
          onClose={() => setEditing(null)}
          onDone={(result) => {
            setEditing(null);
            onDone(result);
          }}
        />
      )}
    </>
  );
};
