// ═══════════════════════════════════════════════════════════
// dashboards.tsx — All pages: Login, Student, Faculty, HOD
// Each dashboard is a self-contained component.
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  TrendingUp, Activity, Award, Percent, AlertTriangle,
  BarChart2, CheckCircle, XCircle, Star, Users,
  Save, RotateCcw, Download, BookOpen, Shield, GraduationCap, ChevronRight,
  Eye, EyeOff,
} from 'lucide-react'
import { useStore } from './store'
import {
  KPICard, GradeBadge, RankBadge, ProgressBar, AppShell,
  SubjectBarChart, SGPATrendChart, GradeDonutChart,
  StackedGradeChart, SubjectCompChart, Heatmap,
} from './components'
import { computeRanks, subjectAnalytics, hodOverview, topStudents, topInSubject, exportCSV } from './analytics'
import { SUBJECTS, FACULTY_DATA } from './data'

// ── Shared layout helpers ────────────────────────────────────

function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="card" style={style}>{children}</div>
}

function CardHeader({ title }: { title: string }) {
  return (
    <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
      <span className="section-title" style={{ marginBottom: 0 }}>{title}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ══════════════════════════════════════════════════════════════

const QUICK = [
  { role: 'hod',     email: 'btechcsehod@vit.ac.in',       pass: 'hodpass',     label: 'HOD',     sub: 'Department administrator',      icon: Shield,        color: 'var(--accent)' },
  { role: 'faculty', email: 'rajeshkumar@vitfaculty.ac.in', pass: 'faculty123',  label: 'Faculty', sub: 'Rajesh Kumar · Data Structures', icon: BookOpen,      color: '#8b5cf6' },
  { role: 'student', email: '21BCE1001',                    pass: '10011',       label: 'Student', sub: '21BCE1001 · B.Tech CSE',         icon: GraduationCap, color: 'var(--info)' },
]

export function LoginPage() {
  const login = useStore(s => s.login)
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = useCallback(async (e?: React.FormEvent, qEmail?: string, qPass?: string) => {
    e?.preventDefault()
    const em = qEmail ?? email
    const pw = qPass  ?? pass
    if (!em || !pw) { setError('Email and password are required.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 280))
    const res = login(em, pw)
    if (!res.success) { setError(res.message ?? 'Login failed.'); setLoading(false) }
  }, [email, pass, login])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-secondary)' }}>

      {/* Left: product info */}
      <div style={{ width: 320, flexShrink: 0, background: 'var(--bg-primary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '36px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <GraduationCap size={16} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>VIT Analytics</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.02em' }}>Academic Performance Intelligence</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>Role-based analytics for students, faculty, and department administrators.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {['Live grade and GPA computation', 'Faculty mark editing with recompute', 'Performance heatmap (50 × 5)', 'Weak subject detection and alerts', 'CSV export for HOD'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>VIT University · B.Tech CSE · Batch 2021–2025</div>
      </div>

      {/* Right: form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.01em' }}>Sign in to continue</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>Use a role button for instant access, or enter credentials.</p>

          {/* Quick access */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick access for demo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {QUICK.map(q => (
                <button key={q.role} onClick={() => handleLogin(undefined, q.email, q.pass)} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'border-color 150ms, background 150ms', width: '100%' }}
                  onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--border-strong)'); (e.currentTarget.style.background = 'var(--bg-hover)') }}
                  onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)');        (e.currentTarget.style.background = 'var(--bg-primary)') }}>
                  <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <q.icon size={12} color={q.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: 'var(--accent)' }}>{q.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{q.sub}</div>
                  </div>
                  <ChevronRight size={12} color="var(--text-muted)" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or sign in manually</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</label>
              <input className="input" type="text" placeholder="email or registration number" value={email} onChange={e => setEmail(e.target.value)} style={{ fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} style={{ paddingRight: 34, fontSize: 13 }} />
                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {show ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            {error && <div style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6, padding: '7px 11px', marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 34, fontSize: 13 }}>
              {loading ? <>
                <span style={{ display: 'inline-block', width: 11, height: 11, border: '1.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Signing in…
              </> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  STUDENT DASHBOARDS
// ══════════════════════════════════════════════════════════════

export function StudentDashboard() {
  const { user, students, semester } = useStore()
  const student  = useMemo(() => students.find(s => s.id === user?.id), [students, user?.id])
  const sem      = useMemo(() => student?.semesters.find(s => s.semesterNumber === semester), [student, semester])
  const ranks    = useMemo(() => computeRanks(students, semester), [students, semester])
  const myRank   = ranks.find(r => r.id === user?.id)?.rank ?? 0
  const weakSubs = sem?.subjects.filter(s => s.totalMarks < 60 || !s.eligible) ?? []
  const avgAtt   = sem ? parseFloat((sem.subjects.reduce((a, s) => a + s.attendance, 0) / sem.subjects.length).toFixed(1)) : 0

  if (!student || !sem) return <div className="workspace"><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data.</p></div>

  return (
    <div className="workspace page-enter">
      <PageHeader
        title={student.name}
        subtitle={`${student.regNo} · Semester ${semester} · B.Tech CSE`}
        right={<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span className="badge badge-role-student">Student</span><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rank <strong style={{ color: 'var(--text-primary)' }}>#{myRank}</strong> of {students.length}</span></div>}
      />

      <div className="kpi-row kpi-row-4">
        <KPICard title="SGPA"           value={sem.sgpa}     color="indigo"  icon={TrendingUp} decimals={2} subtitle="This semester" />
        <KPICard title="CGPA"           value={student.cgpa} color="blue"    icon={Activity}   decimals={2} subtitle="Cumulative" />
        <KPICard title="Class Rank"     value={myRank}       color="amber"   icon={Award}      suffix={`/${students.length}`} />
        <KPICard title="Avg Attendance" value={avgAtt}       color="emerald" icon={Percent}    decimals={1} suffix="%" subtitle="Across subjects" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 12 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Subject Performance — Semester {semester}</div>
          <SubjectBarChart subjects={sem.subjects} />
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">SGPA Trend</div>
          <SGPATrendChart semesters={student.semesters} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader title={`Subject Grades · Sem ${semester}`} />
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th style={{ textAlign: 'right' }}>Int</th>
                <th style={{ textAlign: 'right' }}>Ext</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Att%</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {sem.subjects.map(s => (
                <tr key={s.code}>
                  <td><div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.code}</div></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.internalMarks}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.externalMarks}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.totalMarks}</td>
                  <td style={{ textAlign: 'right' }}><span style={{ color: s.attendance < 75 ? 'var(--danger)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.attendance}%</span></td>
                  <td><GradeBadge grade={s.grade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>SGPA <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{sem.sgpa}</strong></span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>CGPA <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{student.cgpa}</strong></span>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {weakSubs.length > 0 && (
            <Card style={{ padding: '13px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={12} color="var(--warning)" strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)' }}>Needs Improvement</span>
              </div>
              {weakSubs.map(s => (
                <div key={s.code} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.code}</span>
                    <span style={{ fontSize: 12, color: s.eligible ? 'var(--text-muted)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
                      {s.eligible ? `${s.totalMarks}/100` : `Att: ${s.attendance}%`}
                    </span>
                  </div>
                  <ProgressBar value={s.eligible ? s.totalMarks : s.attendance} max={100} color={s.eligible ? 'var(--warning)' : 'var(--danger)'} />
                </div>
              ))}
            </Card>
          )}
          <Card style={{ padding: '13px 15px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Subject Overview</div>
            {sem.subjects.map(s => (
              <div key={s.code} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.code}</span>
                  <span style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{s.totalMarks}%</span>
                </div>
                <ProgressBar value={s.totalMarks} color={s.grade === 'F' ? 'var(--danger)' : s.grade === 'C' ? 'var(--warning)' : 'var(--success)'} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

export function StudentSubjects() {
  const { user, students, semester } = useStore()
  const student = useMemo(() => students.find(s => s.id === user?.id), [students, user?.id])
  const sem     = student?.semesters.find(s => s.semesterNumber === semester)

  if (!student || !sem) return <div className="workspace"><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data.</p></div>

  return (
    <div className="workspace page-enter">
      <PageHeader title="Subject Breakdown" subtitle={`${student.regNo} · Semester ${semester}`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sem.subjects.map(s => (
          <Card key={s.code} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.code}</div>
              </div>
              <GradeBadge grade={s.grade} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Internal',   value: `${s.internalMarks}/40`, color: 'var(--text-primary)' },
                { label: 'External',   value: `${s.externalMarks}/60`, color: 'var(--text-primary)' },
                { label: 'Total',      value: `${s.totalMarks}/100`,   color: s.totalMarks < 45 ? 'var(--danger)' : 'var(--text-primary)' },
                { label: 'Attendance', value: `${s.attendance}%`,       color: s.attendance < 75 ? 'var(--danger)' : 'var(--success)' },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{m.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <ProgressBar value={s.totalMarks} color={s.grade === 'F' ? 'var(--danger)' : s.grade === 'C' ? 'var(--warning)' : 'var(--success)'} />
            {!s.eligible && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertTriangle size={11} strokeWidth={1.5} />
                Attendance below 75% — automatic F grade applied.
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export function StudentRank() {
  const { user, students, semester } = useStore()
  const ranks = useMemo(() => computeRanks(students, semester), [students, semester])

  return (
    <div className="workspace page-enter">
      <PageHeader title="Class Ranking" subtitle={`Semester ${semester} · ${students.length} students`} />
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <table className="data-table row-highlight">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Student</th>
                <th style={{ fontFamily: 'var(--font-mono)', textTransform: 'none' }}>Reg No</th>
                <th style={{ textAlign: 'right' }}>SGPA</th>
                <th style={{ textAlign: 'right' }}>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map(r => {
                const student = students.find(s => s.id === r.id)!
                const isSelf  = r.id === user?.id
                return (
                  <tr key={r.id} className={isSelf ? 'highlighted' : ''}>
                    <td><RankBadge rank={r.rank} /></td>
                    <td>
                      <div style={{ fontWeight: isSelf ? 600 : 400, fontSize: 13 }}>{r.name}</div>
                      {isSelf && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 500, marginTop: 1 }}>You</div>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{r.regNo}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{r.sgpa}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--text-secondary)' }}>{student?.cgpa}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  FACULTY DASHBOARDS
// ══════════════════════════════════════════════════════════════

export function FacultyDashboard() {
  const { user, students, semester } = useStore()
  const code      = user?.subjectCode ?? ''
  const analytics = useMemo(() => subjectAnalytics(students, code, semester), [students, code, semester])
  const toppers   = useMemo(() => topInSubject(students, code, semester, 3), [students, code, semester])

  return (
    <div className="workspace page-enter">
      <PageHeader
        title={user?.subjectName ?? 'Subject Dashboard'}
        subtitle={`${code} · Semester ${semester}`}
        right={<span className="badge badge-role-faculty">Faculty</span>}
      />

      <div className="kpi-row kpi-row-4">
        <KPICard title="Class Average" value={analytics.avg}         color="indigo"  icon={BarChart2}   decimals={1} suffix="/100" />
        <KPICard title="Pass Rate"     value={analytics.passPercent} color="emerald" icon={CheckCircle} decimals={1} suffix="%" />
        <KPICard title="Fail Count"    value={analytics.fails}       color="red"     icon={XCircle}     subtitle={`${analytics.failPercent}% fail rate`} />
        <KPICard title="Top Score"     value={analytics.topScore}    color="amber"   icon={Award}       suffix="/100" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Grade Distribution</div>
          <GradeDonutChart distrib={analytics.gradeDistrib} />
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Pass vs Fail</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {[
              { label: 'Pass', value: analytics.passes, pct: analytics.passPercent, color: 'var(--success)' },
              { label: 'Fail', value: analytics.fails,  pct: analytics.failPercent, color: 'var(--danger)'  },
            ].map(p => (
              <div key={p.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: p.color }}>{p.label}</span>
                  <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}><strong>{p.value}</strong><span style={{ color: 'var(--text-muted)' }}> ({p.pct}%)</span></span>
                </div>
                <ProgressBar value={p.pct} color={p.color} />
              </div>
            ))}
            <div style={{ paddingTop: 4, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Total students</span>
              <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{analytics.total}</strong>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: '14px 16px' }}>
        <div className="section-title">Top Performers</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {toppers.map((t, i) => (
            <div key={t.id} style={{ flex: 1, padding: 13, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <div style={{ marginBottom: 9 }}><RankBadge rank={i + 1} /></div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 9 }}>{t.regNo}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{t.marks}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 7 }}>out of 100</div>
              <GradeBadge grade={t.grade} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function FacultyEditMarks() {
  const { user, students, semester, updateSubject } = useStore()
  const code  = user?.subjectCode ?? ''
  const [edits,  setEdits]  = useState<Record<string, number>>({})
  const [saved,  setSaved]  = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students.filter(s => s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q))
  }, [students, search])

  const getVal = useCallback((studentId: string, field: string) => {
    const key = `${studentId}_${field}`
    if (key in edits) return edits[key]
    const s   = students.find(x => x.id === studentId)
    const sem = s?.semesters.find(x => x.semesterNumber === semester)
    const sub = sem?.subjects.find(x => x.code === code)
    return field === 'internalMarks' ? sub?.internalMarks : field === 'externalMarks' ? sub?.externalMarks : sub?.attendance
  }, [students, semester, code, edits])

  const handleEdit = useCallback((studentId: string, field: string, raw: string) => {
    const max = field === 'internalMarks' ? 40 : field === 'externalMarks' ? 60 : 100
    const val = Math.min(Math.max(parseInt(raw) || 0, 0), max)
    setEdits(prev => ({ ...prev, [`${studentId}_${field}`]: val }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    Object.entries(edits).forEach(([key, val]) => {
      const [studentId, ...parts] = key.split('_')
      const field = parts.join('_') as 'internalMarks' | 'externalMarks' | 'attendance'
      updateSubject(studentId, semester, code, field, val)
    })
    setEdits({})
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [edits, updateSubject, semester, code])

  const editCount = Object.keys(edits).length

  return (
    <div className="workspace page-enter">
      <PageHeader
        title="Edit Marks"
        subtitle={`${user?.subjectName ?? code} · ${code} · Sem ${semester}`}
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {editCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--accent)' }}><span className="dot-unsaved" />{editCount} unsaved</div>}
            {saved && <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>Saved</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => { setEdits({}); setSaved(false) }} disabled={editCount === 0}><RotateCcw size={11} strokeWidth={1.5} /> Reset</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={editCount === 0}><Save size={11} strokeWidth={1.5} /> Save changes</button>
          </div>
        }
      />

      <div style={{ marginBottom: 12 }}>
        <div className="search-box" style={{ display: 'inline-flex' }}>
          <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200, fontSize: 13 }} />
        </div>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th style={{ fontFamily: 'var(--font-mono)', textTransform: 'none' }}>Reg No</th>
                <th style={{ textAlign: 'center' }}>Internal /40</th>
                <th style={{ textAlign: 'center' }}>External /60</th>
                <th style={{ textAlign: 'center' }}>Attendance %</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => {
                const sem = student.semesters.find(x => x.semesterNumber === semester)
                const sub = sem?.subjects.find(x => x.code === code)
                if (!sub) return null
                const intVal = getVal(student.id, 'internalMarks') ?? 0
                const extVal = getVal(student.id, 'externalMarks') ?? 0
                const attVal = getVal(student.id, 'attendance')    ?? 0
                const previewTotal = (intVal as number) + (extVal as number)
                return (
                  <tr key={student.id}>
                    <td><div style={{ fontWeight: 500, fontSize: 13 }}>{student.name}</div></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{student.regNo}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input className="editable-input" type="number" min={0} max={40} value={intVal as number} onChange={e => handleEdit(student.id, 'internalMarks', e.target.value)} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input className="editable-input" type="number" min={0} max={60} value={extVal as number} onChange={e => handleEdit(student.id, 'externalMarks', e.target.value)} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input className={`editable-input${(attVal as number) < 75 ? ' danger' : ''}`} type="number" min={0} max={100} value={attVal as number} onChange={e => handleEdit(student.id, 'attendance', e.target.value)} />
                    </td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{previewTotal}</td>
                    <td><GradeBadge grade={sub.grade} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HOD DASHBOARDS
// ══════════════════════════════════════════════════════════════

export function HODOverview() {
  const { students, semester } = useStore()
  const overview = useMemo(() => hodOverview(students, semester), [students, semester])
  const top3     = useMemo(() => topStudents(students, 3), [students])

  return (
    <div className="workspace page-enter">
      <PageHeader title="Department Overview" subtitle={`B.Tech CSE · Batch 2021–2025 · Semester ${semester}`} />

      <div className="kpi-row kpi-row-5">
        <KPICard title="Students"       value={overview.totalStudents}        color="indigo"  icon={Users}         />
        <KPICard title="Dept Avg SGPA"  value={overview.deptAvgSGPA}          color="blue"    icon={TrendingUp}    decimals={2} />
        <KPICard title="Pass Rate"      value={overview.overallPassPercent}   color="emerald" icon={CheckCircle}   decimals={1} suffix="%" />
        <KPICard title="At-Risk Subjects" value={overview.weakSubjects.length} color={overview.weakSubjects.length > 0 ? 'red' : 'emerald'} icon={AlertTriangle} />
        <KPICard title="Top CGPA"       value={top3[0]?.cgpa ?? 0}           color="amber"   icon={Star}          decimals={2} subtitle={top3[0]?.name} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 12 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Subject Comparison — Avg / Pass% / Fail%</div>
          <SubjectCompChart data={overview.subjectData} />
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Department Toppers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {top3.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <RankBadge rank={i + 1} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.regNo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>{t.cgpa}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>CGPA</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <CardHeader title={`Faculty Performance · Sem ${semester}`} />
        <table className="data-table">
          <thead>
            <tr>
              <th>Faculty</th><th>Subject</th>
              <th style={{ textAlign: 'right' }}>Avg</th>
              <th style={{ textAlign: 'right' }}>Pass%</th>
              <th style={{ textAlign: 'right' }}>Fail%</th>
              <th style={{ textAlign: 'right' }}>Top</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {overview.subjectData.map(s => {
              const f = FACULTY_DATA.find(x => x.subjectCode === s.code)
              return (
                <tr key={s.code}>
                  <td><div style={{ fontWeight: 500, fontSize: 13 }}>{f?.name ?? '—'}</div></td>
                  <td><div style={{ fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.code}</div></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{s.avg}</td>
                  <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--success)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.passPercent}%</span></td>
                  <td style={{ textAlign: 'right' }}><span style={{ color: s.failPercent > 30 ? 'var(--danger)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.failPercent}%</span></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.topScore}</td>
                  <td style={{ minWidth: 100 }}><ProgressBar value={s.passPercent} color="var(--success)" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function HODStudents() {
  const { students, semester } = useStore()
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState<{ field: string; dir: 1 | -1 }>({ field: 'rank', dir: 1 })

  const rows = useMemo(() => {
    const q    = search.toLowerCase()
    const base = students
      .map(s => ({
        ...s,
        sgpa: s.semesters.find(x => x.semesterNumber === semester)?.sgpa ?? 0,
        rank: s.rankBySem?.[semester] ?? 0,
        weak: s.semesters.find(x => x.semesterNumber === semester)?.subjects.filter(sub => sub.totalMarks < 60 || !sub.eligible).length ?? 0,
      }))
      .filter(s => s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q))
    return [...base].sort((a, b) => {
      const av = (a as any)[sort.field] ?? 0
      const bv = (b as any)[sort.field] ?? 0
      return typeof av === 'string' ? av.localeCompare(bv) * sort.dir : (av - bv) * sort.dir
    })
  }, [students, semester, search, sort])

  const toggleSort = (field: string) => setSort(s => ({ field, dir: s.field === field ? (-s.dir as 1 | -1) : 1 }))
  const SortTh = ({ label, field }: { label: string; field: string }) => (
    <th onClick={() => toggleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      {label}{sort.field === field ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <div className="workspace page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16 }}>
        <div>
          <div className="page-title">All Students</div>
          <div className="page-subtitle">Semester {semester} · {students.length} students</div>
        </div>
        <div className="search-box">
          <input placeholder="Name or reg no…" value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13 }} />
        </div>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <table className="data-table row-highlight">
            <thead>
              <tr>
                <SortTh label="Rank"    field="rank" />
                <SortTh label="Student" field="name" />
                <th>Reg No</th>
                <SortTh label="SGPA" field="sgpa" />
                <SortTh label="CGPA" field="cgpa" />
                <th style={{ textAlign: 'right' }}>Weak</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><RankBadge rank={r.rank} /></td>
                  <td><div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{r.regNo}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{r.sgpa}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--text-secondary)' }}>{r.cgpa}</td>
                  <td style={{ textAlign: 'right' }}>
                    {r.weak > 0 && <span style={{ fontSize: 12, color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>{r.weak}</span>}
                  </td>
                  <td>
                    <span className={`badge ${r.cgpa >= 7 ? 'badge-status-pass' : r.cgpa >= 5 ? 'badge-status-warning' : 'badge-status-critical'}`}>
                      {r.cgpa >= 7 ? 'Good' : r.cgpa >= 5 ? 'At Risk' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function HODSubjects() {
  const { students, semester } = useStore()
  const [selected, setSelected] = useState(SUBJECTS[0].code)
  const analytics = useMemo(() => subjectAnalytics(students, selected, semester), [students, selected, semester])
  const top5      = useMemo(() => topInSubject(students, selected, semester, 5), [students, selected, semester])
  const subjectDef = SUBJECTS.find(s => s.code === selected)!

  return (
    <div className="workspace page-enter">
      <PageHeader title="Subject Analytics" subtitle={`Semester ${semester}`} />

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: 4 }}>
        {SUBJECTS.map(s => (
          <button key={s.code} onClick={() => setSelected(s.code)}
            style={{ padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: selected === s.code ? 600 : 400, background: selected === s.code ? 'var(--bg-hover)' : 'transparent', color: selected === s.code ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'background 150ms, color 150ms' }}>
            {s.name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{subjectDef.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected} · {FACULTY_DATA.find(f => f.subjectCode === selected)?.name}</div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 12 }}>
        {[
          { title: 'Class Avg', value: analytics.avg,         color: 'indigo',  suffix: '/100', decimals: 1 },
          { title: 'Pass Rate', value: analytics.passPercent, color: 'emerald', suffix: '%',    decimals: 1 },
          { title: 'Fail Rate', value: analytics.failPercent, color: 'red',     suffix: '%',    decimals: 1 },
          { title: 'Top Score', value: analytics.topScore,    color: 'amber',   suffix: '/100'              },
          { title: 'Avg Att%',  value: analytics.attendanceAvg, color: 'blue',  suffix: '%',    decimals: 1 },
        ].map(k => <KPICard key={k.title} title={k.title} value={k.value} color={k.color} suffix={k.suffix ?? ''} decimals={k.decimals ?? 0} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Grade Distribution</div>
          <GradeDonutChart distrib={analytics.gradeDistrib} />
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div className="section-title">Top 5 Performers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {top5.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', width: 14 }}>#{i + 1}</span>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 600 }}>{t.marks}</span>
                <GradeBadge grade={t.grade} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <CardHeader title="Full Marks Table" />
        <div style={{ overflowY: 'auto', maxHeight: 300 }}>
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Reg No</th><th style={{ textAlign: 'right' }}>Int</th><th style={{ textAlign: 'right' }}>Ext</th><th style={{ textAlign: 'right' }}>Total</th><th style={{ textAlign: 'right' }}>Att%</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {analytics.records.sort((a, b) => b.totalMarks - a.totalMarks).map(r => (
                <tr key={r.studentId}>
                  <td style={{ fontSize: 13 }}>{r.studentName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{r.regNo}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{r.internalMarks}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{r.externalMarks}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{r.totalMarks}</td>
                  <td style={{ textAlign: 'right' }}><span style={{ color: r.attendance < 75 ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{r.attendance}%</span></td>
                  <td><GradeBadge grade={r.grade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function HODAnalytics() {
  const { students, semester } = useStore()
  const overview = useMemo(() => hodOverview(students, semester), [students, semester])

  const handleExport = () => {
    const csv  = exportCSV(students, semester)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `vit_sem${semester}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="workspace page-enter">
      <PageHeader
        title="Deep Analytics"
        subtitle={`Semester ${semester} · ${students.length} students · ${SUBJECTS.length} subjects`}
        right={<button className="btn btn-ghost btn-sm" onClick={handleExport}><Download size={12} strokeWidth={1.5} /> Export CSV</button>}
      />

      <Card style={{ padding: '14px 16px', marginBottom: 12 }}>
        <div className="section-title">Grade Distribution by Subject</div>
        <StackedGradeChart data={overview.subjectData} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
        {overview.subjectData.map(s => (
          <Card key={s.code} style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{s.code}</div>
            {[{ label: 'Avg', value: s.avg, color: 'var(--text-primary)' }, { label: 'Pass', value: `${s.passPercent}%`, color: 'var(--success)' }, { label: 'Fail', value: `${s.failPercent}%`, color: s.failPercent > 30 ? 'var(--danger)' : 'var(--text-muted)' }].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Performance Heatmap — All Students × All Subjects</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ color: '#00af9b', label: 'S/A+' }, { color: '#6366f1', label: 'A/B+' }, { color: '#f59e0b', label: 'B/C' }, { color: '#ef4444', label: 'F' }].map(g => (
              <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: g.color }} />{g.label}
              </div>
            ))}
          </div>
        </div>
        <Heatmap students={students} subjects={SUBJECTS} semNum={semester} />
      </Card>
    </div>
  )
}

export function HODComparisons() {
  const { students, semester } = useStore()
  const compData = useMemo(() => SUBJECTS.map(def => {
    const a = subjectAnalytics(students, def.code, semester)
    return { code: def.code, name: def.name, short: def.name.split(' ').slice(0, 2).join(' '), ...a }
  }), [students, semester])

  return (
    <div className="workspace page-enter">
      <PageHeader title="Subject Comparisons" subtitle={`Semester ${semester}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
        {compData.map(s => (
          <Card key={s.code} style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{s.code}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>{s.avg}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>class average</div>
            {[{ label: 'Pass', v: `${s.passPercent}%`, c: 'var(--success)' }, { label: 'Fail', v: `${s.failPercent}%`, c: s.failPercent > 30 ? 'var(--danger)' : 'var(--text-muted)' }, { label: 'Top', v: `${s.topScore}`, c: 'var(--text-primary)' }].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                <strong style={{ color: m.c, fontVariantNumeric: 'tabular-nums' }}>{m.v}</strong>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card style={{ padding: '14px 16px', marginBottom: 12 }}>
        <div className="section-title">Average Score Comparison</div>
        <SubjectCompChart data={compData} />
      </Card>

      <Card style={{ overflow: 'hidden' }}>
        <CardHeader title="Side-by-Side Comparison Table" />
        <table className="data-table">
          <thead>
            <tr><th>Subject</th><th style={{ textAlign: 'right' }}>Avg</th><th style={{ textAlign: 'right' }}>Top</th><th style={{ textAlign: 'right' }}>Pass%</th><th style={{ textAlign: 'right' }}>Fail%</th><th style={{ textAlign: 'right' }}>Att Avg%</th><th>Grade Spread</th></tr>
          </thead>
          <tbody>
            {compData.map(s => (
              <tr key={s.code}>
                <td><div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.code}</div></td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{s.avg}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.topScore}</td>
                <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--success)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.passPercent}%</span></td>
                <td style={{ textAlign: 'right' }}><span style={{ color: s.failPercent > 25 ? 'var(--danger)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.failPercent}%</span></td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--text-secondary)' }}>{s.attendanceAvg}%</td>
                <td style={{ minWidth: 120 }}><ProgressBar value={s.passPercent} color="var(--success)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function HODAlerts() {
  const { students, semester } = useStore()
  const overview = useMemo(() => hodOverview(students, semester), [students, semester])

  const atRisk        = students.filter(s => s.cgpa < 5)
  const attDefaulters = students.filter(s => s.semesters.find(x => x.semesterNumber === semester)?.subjects.some(sub => !sub.eligible))

  return (
    <div className="workspace page-enter">
      <PageHeader title="Alerts & Risks" subtitle={`Semester ${semester} · Real-time risk assessment`} />

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
        {[
          { title: 'At-Risk Students', value: atRisk.length,                     color: atRisk.length > 0 ? 'red' : 'emerald'  },
          { title: 'Att. Defaulters',  value: attDefaulters.length,              color: attDefaulters.length > 0 ? 'red' : 'emerald' },
          { title: 'Critical Subjects', value: overview.weakSubjects.length,     color: overview.weakSubjects.length > 0 ? 'red' : 'emerald' },
          { title: 'Overall Pass%',    value: overview.overallPassPercent,       color: 'emerald', suffix: '%', decimals: 1 },
        ].map(k => <KPICard key={k.title} {...k} suffix={k.suffix ?? ''} decimals={k.decimals ?? 0} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* At-risk students */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader title={`At-Risk Students (CGPA < 5.0) — ${atRisk.length}`} />
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {atRisk.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No at-risk students. 🎉</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Reg No</th><th style={{ textAlign: 'right' }}>CGPA</th><th style={{ textAlign: 'right' }}>Weak Subs</th></tr></thead>
                <tbody>
                  {atRisk.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{s.regNo}</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{s.cgpa}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--warning)' }}>{s.weakSubjects.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Attendance defaulters */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader title={`Attendance Defaulters — ${attDefaulters.length}`} />
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {attDefaulters.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No attendance defaulters. 🎉</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Reg No</th><th>Ineligible Subjects</th></tr></thead>
                <tbody>
                  {attDefaulters.map(s => {
                    const ineligible = s.semesters.find(x => x.semesterNumber === semester)?.subjects.filter(sub => !sub.eligible) ?? []
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{s.regNo}</td>
                        <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{ineligible.map(sub => <span key={sub.code} className="badge badge-f">{sub.code}</span>)}</div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Critical subjects */}
      {overview.weakSubjects.length > 0 && (
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <AlertTriangle size={13} color="var(--danger)" strokeWidth={1.5} />
            <span className="section-title" style={{ marginBottom: 0, color: 'var(--danger)' }}>Critical Subjects (Fail rate &gt; 20%)</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {overview.weakSubjects.map(s => (
              <div key={s.code} style={{ flex: 1, padding: '12px 14px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{s.code}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{s.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 2 }}>{s.failPercent}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>fail rate · {s.fails} students</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  APP ROUTER — View switcher
// ══════════════════════════════════════════════════════════════

export function AppRouter() {
  const { view, user } = useStore()

  // Guard: students can only see student views
  if (user?.role === 'student' && !view.startsWith('student')) return <StudentDashboard />
  if (user?.role === 'faculty' && !view.startsWith('faculty')) return <FacultyDashboard />

  switch (view) {
    // Student
    case 'student-dashboard': return <StudentDashboard />
    case 'student-subjects':  return <StudentSubjects />
    case 'student-rank':      return <StudentRank />
    // Faculty
    case 'faculty-dashboard': return <FacultyDashboard />
    case 'faculty-edit':      return <FacultyEditMarks />
    // HOD
    case 'hod-overview':      return <HODOverview />
    case 'hod-students':      return <HODStudents />
    case 'hod-subjects':      return <HODSubjects />
    case 'hod-analytics':     return <HODAnalytics />
    case 'hod-comparisons':   return <HODComparisons />
    case 'hod-alerts':        return <HODAlerts />
    default:                  return <HODOverview />
  }
}
