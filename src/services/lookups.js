// Options for the <EntitySelect> dropdowns: what to load for each kind of record
// and how to label it, so admins pick "Class A · Year 2026" instead of typing an id.
import api from './api';

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const time = (t) => (t ? String(t).slice(0, 5) : '');
const join = (...parts) => parts.filter(Boolean).join(' · ');

export const LOOKUPS = {
  class: {
    url: '/classes',
    noun: 'class',
    label: (c) => c.name,
    hint: (c) => join(c.major_name, c.term_name, c.school_year_name),
  },
  subject: {
    url: '/subjects',
    noun: 'subject',
    label: (s) => s.name,
    hint: (s) => s.code,
  },
  teacher: {
    url: '/teachers',
    noun: 'teacher',
    label: (t) => t.user_name || [t.first_name, t.last_name].filter(Boolean).join(' ') || `Teacher #${t.id}`,
    hint: (t) => join(t.employee_code, t.email),
  },
  student: {
    url: '/students',
    noun: 'student',
    label: (s) => s.user_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || `Student #${s.id}`,
    hint: (s) => join(s.student_code, s.class_name),
  },
  room: {
    url: '/rooms',
    noun: 'room',
    label: (r) => r.name,
    hint: (r) => (r.capacity ? `${r.capacity} seats` : ''),
  },
  major: {
    url: '/majors',
    noun: 'major',
    label: (m) => m.name,
    hint: (m) => m.code,
  },
  faculty: {
    url: '/faculties',
    noun: 'faculty',
    label: (f) => f.name,
    hint: (f) => f.code,
  },
  classSubject: {
    url: '/class-subjects',
    noun: 'class subject',
    label: (cs) => join(cs.class_name, cs.subject_name),
    hint: (cs) => cs.teacher_name || 'No teacher assigned',
  },
  schedule: {
    url: '/schedules',
    noun: 'schedule',
    label: (s) => join(s.class_name, s.subject_name),
    hint: (s) => join(`${DAYS[s.day_of_week] || ''} ${time(s.start_time)}–${time(s.end_time)}`.trim(), s.room_name, s.teacher_name),
  },
  // Users who don't have a teacher profile yet are the ones worth offering when creating a teacher
  teacherUser: {
    url: '/users',
    noun: 'user',
    filter: (u) => u.role === 'teacher',
    label: (u) => u.name,
    hint: (u) => u.email,
  },
};

// Requests made at the same moment (several dropdowns on one page) share one call
const inflight = new Map();

export async function loadOptions(type) {
  const def = LOOKUPS[type];
  if (!def) throw new Error(`Unknown lookup type: ${type}`);

  if (!inflight.has(type)) {
    inflight.set(
      type,
      api.get(def.url).finally(() => setTimeout(() => inflight.delete(type), 0))
    );
  }
  const { data } = await inflight.get(type);
  const rows = Array.isArray(data) ? data : data?.data || [];

  return rows
    .filter(def.filter || (() => true))
    .map((row) => ({ id: row.id, label: String(def.label(row) ?? ''), hint: def.hint?.(row) || '' }));
}
