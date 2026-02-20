// ═══════════════════════════════════════════════════════════
// analytics.ts — Pure functions. No React. No side effects.
// All dashboard data is derived from these functions.
// ═══════════════════════════════════════════════════════════

import type { Student, Subject, Semester } from './data'
import { SUBJECTS, GRADE_ORDER, computeGrade } from './data'

// ── GPA ──────────────────────────────────────────────────────

export function computeSGPA(subjects: Subject[]): number {
  const credits  = subjects.reduce((a, s) => a + s.credits, 0)
  const weighted = subjects.reduce((a, s) => a + s.gradePoint * s.credits, 0)
  return parseFloat((weighted / credits).toFixed(2))
}

export function computeCGPA(semesters: Semester[]): number {
  const credits  = semesters.reduce((a, s) => a + s.subjects.length * 4, 0)
  const weighted = semesters.reduce((a, s) => a + s.sgpa * s.subjects.length * 4, 0)
  return parseFloat((weighted / credits).toFixed(2))
}

// ── Ranking ──────────────────────────────────────────────────

export function computeRanks(students: Student[], semNum: number) {
  return [...students]
    .map(s => ({ id: s.id, name: s.name, regNo: s.regNo, sgpa: s.semesters.find(x => x.semesterNumber === semNum)?.sgpa ?? 0 }))
    .sort((a, b) => b.sgpa !== a.sgpa ? b.sgpa - a.sgpa : a.name.localeCompare(b.name))
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function attachRanks(students: Student[]): Student[] {
  const bySem: Record<string, Record<number, number>> = {}
  for (const semNum of [1, 2]) {
    computeRanks(students, semNum).forEach((s, i) => {
      if (!bySem[s.id]) bySem[s.id] = {}
      bySem[s.id][semNum] = i + 1
    })
  }
  return students.map(s => ({ ...s, rankBySem: bySem[s.id] ?? {}, rank: bySem[s.id]?.[1] ?? 0 }))
}

// ── Update a single subject (used by faculty edit) ───────────

export function applySubjectUpdate(
  students: Student[],
  studentId: string,
  semNum: number,
  code: string,
  field: 'internalMarks' | 'externalMarks' | 'attendance',
  val: number
): Student[] {
  const updated = students.map(student => {
    if (student.id !== studentId) return student

    const newSemesters = student.semesters.map(sem => {
      if (sem.semesterNumber !== semNum) return sem

      const newSubjects = sem.subjects.map(sub => {
        if (sub.code !== code) return sub
        const next = { ...sub, [field]: val }
        next.totalMarks = next.internalMarks + next.externalMarks
        return { ...next, ...computeGrade(next.totalMarks, next.attendance) }
      })

      return { ...sem, subjects: newSubjects, sgpa: computeSGPA(newSubjects) }
    })

    const cg   = computeCGPA(newSemesters)
    const weak = [...new Set([
      ...newSemesters.flatMap(s => s.subjects.filter(sub => sub.totalMarks < 60 || !sub.eligible).map(sub => sub.code))
    ])]

    return { ...student, semesters: newSemesters, cgpa: cg, weakSubjects: weak }
  })

  return attachRanks(updated)
}

// ── Subject analytics ────────────────────────────────────────

export function subjectAnalytics(students: Student[], code: string, semNum: number) {
  const records = students.flatMap(s => {
    const sub = s.semesters.find(x => x.semesterNumber === semNum)?.subjects.find(x => x.code === code)
    return sub ? [{ ...sub, studentId: s.id, studentName: s.name, regNo: s.regNo }] : []
  })

  const total    = records.length
  const fails    = records.filter(r => r.grade === 'F').length
  const passes   = total - fails
  const avg      = total ? parseFloat((records.reduce((a, r) => a + r.totalMarks, 0) / total).toFixed(1)) : 0
  const topScore = records.length ? Math.max(...records.map(r => r.totalMarks)) : 0

  return {
    records,
    total,
    fails,
    passes,
    avg,
    topScore,
    passPercent: total ? parseFloat(((passes / total) * 100).toFixed(1)) : 0,
    failPercent: total ? parseFloat(((fails  / total) * 100).toFixed(1)) : 0,
    gradeDistrib: GRADE_ORDER.map(g => ({ grade: g, count: records.filter(r => r.grade === g).length })),
    attendanceAvg: total ? parseFloat((records.reduce((a, r) => a + r.attendance, 0) / total).toFixed(1)) : 0,
  }
}

// ── HOD overview ─────────────────────────────────────────────

export function hodOverview(students: Student[], semNum: number) {
  const subjectData = SUBJECTS.map(def => ({
    code: def.code,
    name: def.name,
    short: def.name.split(' ').slice(0, 2).join(' '),
    ...subjectAnalytics(students, def.code, semNum),
  }))

  const sgpas        = students.map(s => s.semesters.find(x => x.semesterNumber === semNum)?.sgpa ?? 0)
  const deptAvgSGPA  = parseFloat((sgpas.reduce((a, b) => a + b, 0) / (sgpas.length || 1)).toFixed(2))
  const totalPass    = subjectData.reduce((a, d) => a + d.passes, 0)
  const totalStudies = subjectData.reduce((a, d) => a + d.total, 0)

  return {
    subjectData,
    deptAvgSGPA,
    totalStudents:      students.length,
    overallPassPercent: totalStudies ? parseFloat(((totalPass / totalStudies) * 100).toFixed(1)) : 0,
    weakSubjects:       subjectData.filter(s => s.failPercent > 20),
  }
}

// ── Top performers ───────────────────────────────────────────

export function topStudents(students: Student[], n = 3) {
  return [...students].sort((a, b) => b.cgpa - a.cgpa).slice(0, n)
}

export function topInSubject(students: Student[], code: string, semNum: number, n = 3) {
  return students
    .map(s => {
      const sub = s.semesters.find(x => x.semesterNumber === semNum)?.subjects.find(x => x.code === code)
      return { id: s.id, name: s.name, regNo: s.regNo, marks: sub?.totalMarks ?? 0, grade: sub?.grade ?? 'F' }
    })
    .sort((a, b) => b.marks - a.marks)
    .slice(0, n)
}

// ── CSV export ───────────────────────────────────────────────

export function exportCSV(students: Student[], semNum: number): string {
  const headers = [
    'Reg No', 'Name', 'CGPA',
    ...SUBJECTS.flatMap(s => [`${s.code} Grade`, `${s.code} Marks`, `${s.code} Att%`]),
    'SGPA', 'Rank',
  ]
  const rows = students.map(s => {
    const sem = s.semesters.find(x => x.semesterNumber === semNum)
    return [
      s.regNo, s.name, s.cgpa,
      ...SUBJECTS.flatMap(def => {
        const sub = sem?.subjects.find(x => x.code === def.code)
        return [sub?.grade ?? '', sub?.totalMarks ?? '', sub?.attendance ?? '']
      }),
      sem?.sgpa ?? '',
      s.rankBySem?.[semNum] ?? '',
    ]
  })
  return [headers, ...rows].map(r => r.join(',')).join('\n')
}
