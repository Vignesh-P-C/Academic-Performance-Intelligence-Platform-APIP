# Academic-Performance-Intelligence-Platform-APIP-

📘 Academic Performance Intelligence Platform (APIP)

A role-based academic analytics dashboard built with React 18, TypeScript, and Zustand.
Transforms raw academic results into actionable decision intelligence for Students, Faculty, and HODs with live GPA recomputation, performance heatmaps, and strict role-based data scoping.

🔗 Live Demo

(Add your Vercel link here once deployed)
Example: https://academic-intelligence.vercel.app

🎯 Product Vision

This is not a marks viewer.

APIP is designed as a decision-support platform for academic stakeholders:

Role	Core Question Answered
Student	Where am I underperforming and by how much?
Faculty	How is my subject performing across the class?
HOD	Which subjects or faculty require intervention?

The system converts academic data into structured intelligence using a fully client-side analytics engine.

🧠 Architecture Overview
Frontend Stack

React 18

TypeScript (strict mode)

Vite

TailwindCSS

Zustand (global state management)

Recharts (data visualization)

Framer Motion (animation system)

Design Principles

Role-based permission enforcement

Pure analytics engine (no UI dependencies)

Deterministic recomputation lifecycle

Clean separation of data, state, analytics, and UI

Production-grade SaaS layout structure

🔁 Data Flow & Recompute Lifecycle

Faculty mark edit →
Zustand mutation →
Analytics engine recomputes grades, SGPA, CGPA, ranks →
Derived dashboards update in the same render cycle.

No page refresh. No backend. Fully reactive.

All academic computations follow strict rule enforcement:

Attendance < 75% → Automatic fail

Grade scale mapped to 10-point system

SGPA & CGPA computed via credit-weighted formula

Rank recalculated on every mutation

🔐 Role-Based Access Control
Student

View own performance

SGPA / CGPA tracking

Weak subject detection

Rank history

No edit access

Faculty

Scoped to assigned subject

Edit internal, external, and attendance

Instant recomputation across class

Restricted from other subjects

403 on unauthorized routes

HOD

Department-level overview

Subject comparison analytics

Faculty performance insights

Performance heatmap (50 × 5 grid)

CSV export capability

All access is session-scoped and enforced at route and data level.

📊 Key Features

Live GPA recomputation engine

Performance heatmap (250 optimized cells)

Grade distribution analytics

Weak subject alerts

Subject comparison dashboard

Faculty performance tracking

CSV export (client-side Blob API)

Light/Dark theme persistence

Sidebar collapse animation (60fps)

Skeleton loading states

🧩 Project Structure
src/
├── main.tsx
├── App.tsx
├── store.ts
├── analytics.ts
├── data.ts
├── components.tsx
├── dashboards.tsx
└── styles.css

Minimal, human-maintainable architecture.
No folder explosion. No unnecessary abstraction.

🛠 Demo Credentials
HOD

Email: btechcsehod@vit.ac.in

Password: hodpass

Faculty

Email format: <fullname lowercase>@vitfaculty.ac.in
Example: rajeshkumar@vitfaculty.ac.in

Password: any 5+ characters

Student

Login using Registration Number (e.g., 21BCE1001)
Password: any 5+ characters

⚡ Performance Considerations

Memoized analytics consumers

No layout shift during navigation

Optimized heatmap rendering

No unnecessary re-renders

Zero console warnings

Interaction latency under 100ms

🚀 Running Locally
npm install
npm run dev

To build production:

npm run build
npm run preview
📦 Deployment

Designed for zero-config deployment on:

Vercel

Netlify

Any static hosting provider

Fully client-side. Works offline after first load.

🧪 Engineering Highlights

Pure TypeScript analytics engine

Deterministic grade calculation rules

Strict permission gating

Store-driven recomputation lifecycle

SaaS-style layout & UX polish

📄 License

MIT License — open for educational and demonstration purposes.
