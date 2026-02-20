// ═══════════════════════════════════════════════════════════
// components.tsx — All shared UI: layout, charts, primitives
// ═══════════════════════════════════════════════════════════

import { memo, useState, useEffect, useRef, type ReactNode } from 'react'
import {
  BarChart, Bar, Cell, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  LayoutDashboard, BookOpen, Users, BarChart2, GitCompare,
  Bell, Edit2, Award, GraduationCap, ChevronsLeft, ChevronsRight,
  Sun, Moon, LogOut, Search,
} from 'lucide-react'
import { useStore } from './store'
import { GRADE_BADGE, GRADE_COLORS, GRADE_ORDER, NAV, VIEW_TITLES, type Subject } from './data'
import { computeRanks } from './analytics'

// ── Animated counter hook ─────────────────────────────────────

export function useCounter(target: number, decimals = 0, duration = 700) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  const raf  = useRef(0)

  useEffect(() => {
    const from  = prev.current
    prev.current = target
    const start = performance.now()
    const tick  = (now: number) => {
      const p    = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((from + (target - from) * ease).toFixed(decimals)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, decimals, duration])

  return val
}

// ── KPI Card ─────────────────────────────────────────────────

const COLOR: Record<string, string> = {
  indigo:  'var(--accent)',
  blue:    'var(--info)',
  emerald: 'var(--success)',
  amber:   'var(--warning)',
  red:     'var(--danger)',
  violet:  '#8b5cf6',
}

interface KPIProps {
  title:    string
  value:    number | string
  color?:   string
  icon?:    React.ElementType
  decimals?: number
  suffix?:  string
  subtitle?: string
}

export const KPICard = memo(function KPICard({ title, value, color = 'indigo', icon: Icon, decimals = 0, suffix = '', subtitle }: KPIProps) {
  const num      = typeof value === 'number' ? value : 0
  const animated = useCounter(num, decimals)
  const display  = typeof value === 'number' ? `${animated}${suffix}` : value

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        {Icon && <Icon size={12} color="var(--text-muted)" strokeWidth={1.5} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: COLOR[color] ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: subtitle ? 3 : 0 }}>
        {display}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
})

// ── Grade & rank badges ───────────────────────────────────────

export function GradeBadge({ grade }: { grade: string }) {
  return <span className={GRADE_BADGE[grade] ?? 'badge badge-f'}>{grade}</span>
}

export function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'rank-badge rank-1' : rank <= 3 ? 'rank-badge rank-3' : 'rank-badge rank-n'
  return <div className={cls}>{rank}</div>
}

// ── Progress bar ──────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const [w, setW] = useState(0)
  const pct = Math.min((value / max) * 100, 100)
  useEffect(() => { const t = setTimeout(() => setW(pct), 50); return () => clearTimeout(t) }, [pct])
  const c = color ?? (pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)')
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${w}%`, background: c }} />
    </div>
  )
}

// ── Chart shared config ───────────────────────────────────────

const AXIS = { axisLine: false, tickLine: false, tick: { fontSize: 11, fontFamily: 'Inter, sans-serif', fill: 'var(--text-muted)' } }
const GRID = { strokeDasharray: '0', stroke: 'var(--border)', strokeOpacity: 1 }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 11px', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
      {label && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, paddingBottom: 4, borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: i > 0 ? 3 : 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: p.color ?? 'var(--accent)', display: 'inline-block' }} />
            {p.name}
          </span>
          <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{typeof p.value === 'number' ? (p.value % 1 ? p.value.toFixed(1) : p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Charts ────────────────────────────────────────────────────

export const SubjectBarChart = memo(function SubjectBarChart({ subjects }: { subjects: Subject[] }) {
  const data = subjects.map(s => ({ name: s.name.split(' ')[0], Total: s.totalMarks, grade: s.grade }))
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} barSize={18} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis domain={[0, 100]} {...AXIS} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <ReferenceLine y={60} stroke="var(--border-strong)" strokeDasharray="4 3" />
        <Bar dataKey="Total" radius={[2, 2, 0, 0]}>
          {data.map((e, i) => (
            <Cell key={i} fill={e.grade === 'F' ? '#ef4444' : e.grade === 'C' ? '#f59e0b' : e.Total >= 81 ? '#00af9b' : '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})

export const SGPATrendChart = memo(function SGPATrendChart({ semesters }: { semesters: { semesterNumber: number; sgpa: number }[] }) {
  const data = semesters.map(s => ({ name: `Sem ${s.semesterNumber}`, SGPA: s.sgpa }))
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis domain={[0, 10]} {...AXIS} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
        <Line type="monotone" dataKey="SGPA" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} animationDuration={600} />
      </LineChart>
    </ResponsiveContainer>
  )
})

export const GradeDonutChart = memo(function GradeDonutChart({ distrib }: { distrib: { grade: string; count: number }[] }) {
  const data = distrib.filter(d => d.count > 0)
  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={74} dataKey="count" paddingAngle={2} animationDuration={600}>
          {data.map((d, i) => <Cell key={i} fill={GRADE_COLORS[d.grade] ?? '#6b7280'} />)}
        </Pie>
        <Tooltip content={({ active, payload }: any) => active && payload?.length ? (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: GRADE_COLORS[payload[0].payload.grade], marginBottom: 2 }}>Grade {payload[0].payload.grade}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{payload[0].value} students</div>
          </div>
        ) : null} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => <span style={{ color: 'var(--text-secondary)' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
})

export const StackedGradeChart = memo(function StackedGradeChart({ data: raw }: { data: { code: string; name?: string; gradeDistrib: { grade: string; count: number }[] }[] }) {
  const data = raw.map(s => {
    const obj: Record<string, string | number> = { name: s.name ?? s.code }
    s.gradeDistrib.forEach(g => { obj[g.grade] = g.count })
    return obj
  })
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} barSize={26} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => <span style={{ color: 'var(--text-secondary)' }}>{v}</span>} />
        {GRADE_ORDER.map(g => <Bar key={g} dataKey={g} stackId="a" fill={GRADE_COLORS[g]} animationDuration={500} />)}
      </BarChart>
    </ResponsiveContainer>
  )
})

export const SubjectCompChart = memo(function SubjectCompChart({ data: raw }: { data: { code: string; name?: string; avg: number; passPercent: number; failPercent: number }[] }) {
  const data = raw.map(s => ({ name: s.name ?? s.code, 'Avg': s.avg, 'Pass%': s.passPercent, 'Fail%': s.failPercent }))
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} barSize={8} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => <span style={{ color: 'var(--text-secondary)' }}>{v}</span>} />
        <Bar dataKey="Avg"   fill="var(--accent)"  radius={[2,2,0,0]} animationDuration={500} />
        <Bar dataKey="Pass%" fill="var(--success)" radius={[2,2,0,0]} animationDuration={550} />
        <Bar dataKey="Fail%" fill="var(--danger)"  radius={[2,2,0,0]} animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  )
})

// ── Heatmap ───────────────────────────────────────────────────

export const Heatmap = memo(function Heatmap({
  students, subjects, semNum,
}: {
  students: { id: string; name: string; semesters: { semesterNumber: number; subjects: { code: string; grade: string; totalMarks: number; attendance: number }[] }[] }[]
  subjects: { code: string }[]
  semNum:   number
}) {
  const [tip, setTip] = useState<{ sid: string; code: string } | null>(null)

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${subjects.length}, 1fr)`, gap: 2, marginBottom: 4 }}>
        <div />
        {subjects.map(s => (
          <div key={s.code} style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.code}</div>
        ))}
      </div>
      <div style={{ maxHeight: 480, overflowY: 'auto' }}>
        {students.map(student => {
          const sem = student.semesters.find(x => x.semesterNumber === semNum)
          return (
            <div key={student.id} style={{ display: 'grid', gridTemplateColumns: `100px repeat(${subjects.length}, 1fr)`, gap: 2, marginBottom: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {student.name.split(' ')[0]}
              </div>
              {subjects.map(sub => {
                const rec    = sem?.subjects.find(x => x.code === sub.code)
                const color  = GRADE_COLORS[rec?.grade ?? ''] ?? '#6b7280'
                const isHov  = tip?.sid === student.id && tip?.code === sub.code
                return (
                  <div key={sub.code} style={{ position: 'relative' }}>
                    <div
                      className="heatmap-cell"
                      style={{ background: color, opacity: isHov ? 1 : 0.65 }}
                      onMouseEnter={() => setTip({ sid: student.id, code: sub.code })}
                      onMouseLeave={() => setTip(null)}
                    />
                    {isHov && rec && (
                      <div style={{ position: 'absolute', bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, whiteSpace: 'nowrap', zIndex: 100, pointerEvents: 'none' }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{student.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                          {sub.code}: <strong style={{ color }}>{rec.grade}</strong> ({rec.totalMarks}/100)
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Att: {rec.attendance}%</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
})

// ── Sidebar ───────────────────────────────────────────────────

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, BookOpen, Users, BarChart2, GitCompare, Bell, Edit2, Award,
}

export function Sidebar() {
  const { user, view, setView, sidebarCollapsed, toggleSidebar } = useStore()
  const role     = user?.role ?? 'student'
  const navItems = NAV[role] ?? []
  const w        = sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'

  return (
    <aside style={{ width: w, minWidth: w, height: '100vh', background: 'var(--bg-primary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 180ms ease, min-width 180ms ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', flexShrink: 0 }}>
        <GraduationCap size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
        {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>VIT Analytics</span>}
      </div>

      {/* User */}
      {!sidebarCollapsed && (
        <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0, textTransform: 'uppercase' }}>
              {user?.name?.[0] ?? '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3, textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const Icon   = ICONS[item.icon] ?? LayoutDashboard
          const active = view === item.view
          return (
            <button key={item.view} className={`nav-item${active ? ' active' : ''}`} onClick={() => setView(item.view)} title={sidebarCollapsed ? item.label : undefined} style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? 7 : '6px 8px', marginBottom: 1 }}>
              <Icon size={14} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span style={{ fontSize: 13 }}>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse */}
      <div style={{ padding: 6, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button className="nav-item" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand' : 'Collapse'} style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? 7 : '6px 8px' }}>
          {sidebarCollapsed ? <ChevronsRight size={13} strokeWidth={1.5} /> : <><ChevronsLeft size={13} strokeWidth={1.5} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}

// ── TopBar ────────────────────────────────────────────────────

export function TopBar() {
  const { view, semester, theme, setSemester, toggleTheme, logout } = useStore()
  const title = VIEW_TITLES[view] ?? 'Dashboard'

  return (
    <header style={{ height: 'var(--topbar-height)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', flexShrink: 0 }}>

      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</div>

      {/* Semester toggle */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        {[1, 2].map(n => (
          <button key={n} onClick={() => setSemester(n)} style={{ padding: '3px 12px', border: 'none', borderRight: n === 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: semester === n ? 600 : 400, background: semester === n ? 'var(--bg-hover)' : 'transparent', color: semester === n ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'background 150ms, color 150ms' }}>
            Sem {n}
          </button>
        ))}
      </div>

      {/* Theme */}
      <button className="btn btn-ghost btn-sm" onClick={toggleTheme} aria-label="Toggle theme" style={{ padding: '3px 7px', borderColor: 'transparent' }}>
        {theme === 'dark' ? <Sun size={13} strokeWidth={1.5} /> : <Moon size={13} strokeWidth={1.5} />}
      </button>

      <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

      <button className="btn btn-ghost btn-sm" onClick={logout} style={{ padding: '3px 8px', gap: 4, color: 'var(--text-muted)', borderColor: 'transparent' }}>
        <LogOut size={12} strokeWidth={1.5} />
        <span style={{ fontSize: 12 }}>Sign out</span>
      </button>
    </header>
  )
}

// ── App shell ─────────────────────────────────────────────────

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
