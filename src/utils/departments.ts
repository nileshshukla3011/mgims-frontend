import { Department, FacultyMember } from '@/types';

/**
 * Whether a faculty member belongs to a department. Used by the public department page and by the admin console's
 * access rules. The department name must match exactly: a substring match put Community Medicine staff under Medicine.
 */
export const isFacultyInDepartment = (f: FacultyMember, d: Department) =>
  f.department.toLowerCase() === d.name.toLowerCase() ||
  d.faculty.some((df) => df.toLowerCase().includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(df.toLowerCase()));
