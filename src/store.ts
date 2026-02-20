// ═══════════════════════════════════════════════════════════
// store.ts — Single Zustand store for all application state.
// Auth, navigation, theme, students, and mark edits.
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Student, User } from './data'
import { INITIAL_STUDENTS, FACULTY_DATA, HOD, DEFAULT_VIEW } from './data'
import { applySubjectUpdate } from './analytics'

const TTL = 8 * 60 * 60 * 1000  // 8 hours

interface Store {
  // ── Auth ──────────────────────────────────────────────
  user:    User | null
  login:   (email: string, pass: string) => { success: boolean; message?: string }
  logout:  () => void

  // ── Navigation & UI ────────────────────────────────────
  view:             string
  semester:         number
  theme:            'dark' | 'light'
  sidebarCollapsed: boolean
  setView:          (v: string) => void
  setSemester:      (n: number) => void
  toggleTheme:      () => void
  toggleSidebar:    () => void

  // ── Data ──────────────────────────────────────────────
  students:      Student[]
  updateSubject: (studentId: string, semNum: number, code: string, field: 'internalMarks' | 'externalMarks' | 'attendance', val: number) => void
  resetStudents: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({

      // ── Auth ────────────────────────────────────────────
      user: null,

      login(email, pass) {
        const e = email.trim().toLowerCase()
        const p = pass.trim()
        const expires = Date.now() + TTL

        // HOD: exact email + exact password
        if (e === HOD.email && p === HOD.password) {
          set({ user: { role: 'hod', id: 'hod', name: 'Head of Department', email: e, expires }, view: DEFAULT_VIEW.hod })
          return { success: true }
        }

        // Faculty: <fullname-no-spaces>@vitfaculty.ac.in + password length >= 5
        if (e.endsWith('@vitfaculty.ac.in') && p.length >= 5) {
          const nameSlug = e.split('@')[0]
          const faculty  = FACULTY_DATA.find(f =>
            f.name.toLowerCase().replace(/\s+/g, '') === nameSlug
          )
          if (faculty) {
            set({
              user: { role: 'faculty', id: faculty.id, name: faculty.name, email: e, expires, subjectCode: faculty.subjectCode, subjectName: faculty.subjectName },
              view: DEFAULT_VIEW.faculty,
            })
            return { success: true }
          }
          return { success: false, message: 'No faculty found for this email.' }
        }

        // Student: registration number (no @) or email, password length >= 5
        if (p.length < 5) return { success: false, message: 'Password must be at least 5 characters.' }
        const isRegNo = !e.includes('@')
        const student = isRegNo
          ? get().students.find(s => s.regNo.toLowerCase() === e)
          : get().students.find(s => s.email === e)
        if (student) {
          set({ user: { role: 'student', id: student.id, name: student.name, email: student.email, expires, regNo: student.regNo }, view: DEFAULT_VIEW.student })
          return { success: true }
        }

        return { success: false, message: 'Invalid credentials.' }
      },

      logout: () => set({ user: null }),

      // ── Navigation & UI ──────────────────────────────────
      view:             'student-dashboard',
      semester:         1,
      theme:            'dark',
      sidebarCollapsed: false,

      setView:       (view)    => set({ view }),
      setSemester:   (semester) => set({ semester }),
      toggleSidebar: ()        => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleTheme() {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        set({ theme: next })
      },

      // ── Data ────────────────────────────────────────────
      students: INITIAL_STUDENTS,

      updateSubject(studentId, semNum, code, field, val) {
        set({ students: applySubjectUpdate(get().students, studentId, semNum, code, field, val) })
      },

      resetStudents: () => set({ students: INITIAL_STUDENTS }),
    }),
    {
      name: 'apip',
      // Only persist these keys — students state would be too large to re-seed on every visit
      partialize: state => ({
        user:             state.user,
        students:         state.students,
        theme:            state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      // Clear expired session on rehydration
      onRehydrateStorage: () => state => {
        if (state?.user && state.user.expires < Date.now()) {
          state.user = null
        }
        // Re-apply theme to DOM
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)
