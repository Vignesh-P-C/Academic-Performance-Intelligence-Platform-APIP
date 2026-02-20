// ═══════════════════════════════════════════════════════════
// data.ts — Types, constants, and seeded dataset
// All data lives here. Pure definitions, no side effects.
// ═══════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface Subject {
  code:          string
  name:          string
  facultyId:     string
  credits:       number
  internalMarks: number
  externalMarks: number
  totalMarks:    number
  attendance:    number
  grade:         string
  gradePoint:    number
  eligible:      boolean
}

export interface Semester {
  semesterNumber: number
  subjects:       Subject[]
  sgpa:           number
}

export interface Student {
  id:           string
  name:         string
  regNo:        string
  email:        string
  password:     string
  semesters:    Semester[]
  cgpa:         number
  rank:         number
  rankBySem:    Record<number, number>
  weakSubjects: string[]
}

export interface FacultyDef {
  id:          string
  name:        string
  email:       string
  password:    string
  subjectCode: string
  subjectName: string
}

export interface User {
  role:         'hod' | 'faculty' | 'student'
  id:           string
  name:         string
  email:        string
  expires:      number
  // faculty
  subjectCode?: string
  subjectName?: string
  // student
  regNo?:       string
}

// ── Subjects & faculty ───────────────────────────────────────

export const SUBJECTS = [
  { code: 'CS301', name: 'Data Structures',      facultyId: 'f1', credits: 4 },
  { code: 'CS302', name: 'Computer Networks',    facultyId: 'f2', credits: 4 },
  { code: 'CS303', name: 'Database Systems',     facultyId: 'f3', credits: 4 },
  { code: 'CS304', name: 'Operating Systems',    facultyId: 'f4', credits: 4 },
  { code: 'CS305', name: 'Software Engineering', facultyId: 'f5', credits: 4 },
]

export const FACULTY_DATA: FacultyDef[] = [
  { id: 'f1', name: 'Rajesh Kumar',  email: 'rajesh@vitfaculty.ac.in', password: 'faculty123', subjectCode: 'CS301', subjectName: 'Data Structures'      },
  { id: 'f2', name: 'Priya Sharma',  email: 'priya@vitfaculty.ac.in',  password: 'faculty123', subjectCode: 'CS302', subjectName: 'Computer Networks'    },
  { id: 'f3', name: 'Arun Menon',    email: 'arun@vitfaculty.ac.in',   password: 'faculty123', subjectCode: 'CS303', subjectName: 'Database Systems'     },
  { id: 'f4', name: 'Divya Nair',    email: 'divya@vitfaculty.ac.in',  password: 'faculty123', subjectCode: 'CS304', subjectName: 'Operating Systems'    },
  { id: 'f5', name: 'Suresh Pillai', email: 'suresh@vitfaculty.ac.in', password: 'faculty123', subjectCode: 'CS305', subjectName: 'Software Engineering' },
]

export const HOD = { email: 'btechcsehod@vit.ac.in', password: 'hodpass' }

// ── Navigation ───────────────────────────────────────────────

export const NAV: Record<string, { view: string; label: string; icon: string }[]> = {
  hod: [
    { view: 'hod-overview',    label: 'Overview',    icon: 'LayoutDashboard' },
    { view: 'hod-students',    label: 'Students',    icon: 'Users'           },
    { view: 'hod-subjects',    label: 'Subjects',    icon: 'BookOpen'        },
    { view: 'hod-analytics',   label: 'Analytics',   icon: 'BarChart2'       },
    { view: 'hod-comparisons', label: 'Comparisons', icon: 'GitCompare'      },
    { view: 'hod-alerts',      label: 'Alerts',      icon: 'Bell'            },
  ],
  faculty: [
    { view: 'faculty-dashboard', label: 'Dashboard',  icon: 'LayoutDashboard' },
    { view: 'faculty-edit',      label: 'Edit Marks', icon: 'Edit2'           },
  ],
  student: [
    { view: 'student-dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { view: 'student-subjects',  label: 'Subjects',  icon: 'BookOpen'        },
    { view: 'student-rank',      label: 'Ranking',   icon: 'Award'           },
  ],
}

export const VIEW_TITLES: Record<string, string> = {
  'hod-overview':      'Department Overview',
  'hod-students':      'All Students',
  'hod-subjects':      'Subject Analytics',
  'hod-analytics':     'Deep Analytics',
  'hod-comparisons':   'Comparisons',
  'hod-alerts':        'Alerts & Risks',
  'faculty-dashboard': 'Faculty Dashboard',
  'faculty-edit':      'Edit Marks',
  'student-dashboard': 'My Dashboard',
  'student-subjects':  'My Subjects',
  'student-rank':      'Class Ranking',
}

export const DEFAULT_VIEW: Record<string, string> = {
  hod:     'hod-overview',
  faculty: 'faculty-dashboard',
  student: 'student-dashboard',
}

export const GRADE_ORDER = ['S', 'A+', 'A', 'B+', 'B', 'C', 'F']

// Grade to color (used by charts and heatmap)
export const GRADE_COLORS: Record<string, string> = {
  'S':  '#00af9b',
  'A+': '#22c55e',
  'A':  '#6366f1',
  'B+': '#818cf8',
  'B':  '#3b82f6',
  'C':  '#f59e0b',
  'F':  '#ef4444',
}

// Grade to CSS badge class
export const GRADE_BADGE: Record<string, string> = {
  'S':  'badge badge-s',
  'A+': 'badge badge-aplus',
  'A':  'badge badge-a',
  'B+': 'badge badge-bplus',
  'B':  'badge badge-b',
  'C':  'badge badge-c',
  'F':  'badge badge-f',
}

// ── VIT grading scale ────────────────────────────────────────

export function computeGrade(total: number, attendance: number): Pick<Subject, 'grade' | 'gradePoint' | 'eligible'> {
  if (attendance < 75)  return { grade: 'F', gradePoint: 0, eligible: false }
  if (total >= 91)      return { grade: 'S',  gradePoint: 10, eligible: true }
  if (total >= 81)      return { grade: 'A+', gradePoint: 9,  eligible: true }
  if (total >= 71)      return { grade: 'A',  gradePoint: 8,  eligible: true }
  if (total >= 61)      return { grade: 'B+', gradePoint: 7,  eligible: true }
  if (total >= 51)      return { grade: 'B',  gradePoint: 6,  eligible: true }
  if (total >= 45)      return { grade: 'C',  gradePoint: 5,  eligible: true }
  return                       { grade: 'F',  gradePoint: 0,  eligible: true }
}

// ── Seed data generation ─────────────────────────────────────

const NAMES = [
  'Aarav Sharma', 'Aditya Verma', 'Akash Singh', 'Amit Kumar', 'Ananya Rao',
  'Arjun Nair', 'Aryan Gupta', 'Ashwin Pillai', 'Bhavya Mehta', 'Chetan Joshi',
  'Deepak Patel', 'Dhruv Agarwal', 'Divya Krishnan', 'Esha Reddy', 'Farhan Khan',
  'Gaurav Malhotra', 'Harini Subramanian', 'Harsh Pandey', 'Ishaan Bose', 'Jatin Tiwari',
  'Kavitha Venkatesh', 'Keerthana Mohan', 'Kiran Yadav', 'Kritika Saxena', 'Lakshmi Narayanan',
  'Manoj Srinivasan', 'Meera Iyer', 'Mihir Shah', 'Nandita Rao', 'Naveen Choudhary',
  'Neha Jain', 'Nikita Banerjee', 'Nikhil Deshpande', 'Pallavi Mishra', 'Pratheek Nair',
  'Priya Subramaniam', 'Rajesh Babu', 'Rakesh Chandra', 'Ravi Shankar', 'Rohit Menon',
  'Sahana Krishnamurthy', 'Sandeep Patil', 'Sanjana Hegde', 'Siddharth Kulkarni', 'Sneha Ramachandran',
  'Supriya Chatterjee', 'Tanmay Goswami', 'Uma Maheshwari', 'Varun Nambiar', 'Vishal Acharya',
]

// Performance tier distribution: 10% high, 60% avg, 20% at-risk, 10% failing
const TIERS = [
  ...Array(5).fill('high'),
  ...Array(30).fill('avg'),
  ...Array(10).fill('risk'),
  ...Array(5).fill('fail'),
]

const TIER_RANGES: Record<string, { int: [number, number]; ext: [number, number]; att: [number, number] }> = {
  high: { int: [30, 40], ext: [50, 60], att: [85, 98] },
  avg:  { int: [19, 34], ext: [32, 52], att: [76, 93] },
  risk: { int: [12, 24], ext: [20, 38], att: [66, 84] },
  fail: { int: [5,  18], ext: [10, 28], att: [55, 78] },
}

// Deterministic LCG RNG (reproducible seed data)
function rng(seed: number) {
  let s = seed >>> 0
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff }
}
function rInt(r: () => number, min: number, max: number) {
  return Math.round(r() * (max - min) + min)
}

function sgpa(subjects: Subject[]) {
  const credits = subjects.reduce((a, s) => a + s.credits, 0)
  const weighted = subjects.reduce((a, s) => a + s.gradePoint * s.credits, 0)
  return parseFloat((weighted / credits).toFixed(2))
}

function cgpa(semesters: Semester[]) {
  const credits  = semesters.reduce((a, s) => a + s.subjects.length * 4, 0)
  const weighted = semesters.reduce((a, s) => a + s.sgpa * s.subjects.length * 4, 0)
  return parseFloat((weighted / credits).toFixed(2))
}

function makeSemester(rand: () => number, tier: string, semNum: number): Semester {
  const r = TIER_RANGES[tier]
  const subjects = SUBJECTS.map(def => {
    const internal   = rInt(rand, ...r.int)
    const external   = rInt(rand, ...r.ext)
    const total      = internal + external
    let   attendance = rInt(rand, ...r.att)
    if (rand() < 0.08) attendance = rInt(rand, 55, 74)  // ~8% defaulters
    const computed = computeGrade(total, attendance)
    return {
      code: def.code, name: def.name, facultyId: def.facultyId, credits: def.credits,
      internalMarks: internal, externalMarks: external, totalMarks: total, attendance,
      ...computed,
    }
  })
  return { semesterNumber: semNum, subjects, sgpa: sgpa(subjects) }
}

function attachRanks(students: Student[]) {
  const ranksBySem: Record<string, Record<number, number>> = {}
  for (const semNum of [1, 2]) {
    const sorted = [...students]
      .map(s => ({ id: s.id, name: s.name, sgpa: s.semesters.find(x => x.semesterNumber === semNum)?.sgpa ?? 0 }))
      .sort((a, b) => b.sgpa !== a.sgpa ? b.sgpa - a.sgpa : a.name.localeCompare(b.name))
    sorted.forEach((s, i) => {
      if (!ranksBySem[s.id]) ranksBySem[s.id] = {}
      ranksBySem[s.id][semNum] = i + 1
    })
  }
  return students.map(s => ({ ...s, rankBySem: ranksBySem[s.id] ?? {}, rank: ranksBySem[s.id]?.[1] ?? 0 }))
}

function buildStudents(): Student[] {
  return NAMES.map((name, i) => {
    const tier     = TIERS[i]
    const regNo    = `21BCE${String(1001 + i).padStart(4, '0')}`
    const sem1     = makeSemester(rng(i * 9973  + 1_234_567), tier, 1)
    const sem2     = makeSemester(rng(i * 7919  + 7_654_321), tier, 2)
    const semesters = [sem1, sem2]
    const cg       = cgpa(semesters)
    const weak     = [...new Set([
      ...sem1.subjects.filter(s => s.totalMarks < 60 || !s.eligible).map(s => s.code),
      ...sem2.subjects.filter(s => s.totalMarks < 60 || !s.eligible).map(s => s.code),
    ])]
    return {
      id: `s${i + 1}`, name, regNo, email: `${regNo}@vitstudent.ac.in`,
      password: regNo.slice(-4), semesters, cgpa: cg, rank: 0, rankBySem: {}, weakSubjects: weak,
    }
  })
}

export const INITIAL_STUDENTS: Student[] = attachRanks(buildStudents())
