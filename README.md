# 📘 Academic Performance Intelligence Platform (APIP)
**Version:** v1.0.0  

A browser-based **role-based academic analytics dashboard** built with **React 18, TypeScript, and Zustand**.  
The platform transforms static academic results into **actionable decision intelligence** for Students, Faculty, and HODs.

The system is designed incrementally with a strong focus on **clean architecture, deterministic analytics, real-time recomputation, and SaaS-grade UX polish**.

---

🌐 Live Demo: https://apip-dashboard.vercel.app/

---

## 🎯 Core Product Philosophy:

This is **not** a marks viewer.

APIP is built to answer role-specific decision questions:

| Role      | Primary Question |
|-----------|-----------------|
| Student   | Where am I underperforming and how can I improve? |
| Faculty   | How is my subject performing across the class? |
| HOD       | Which subjects or faculty require intervention? |

All intelligence is computed **client-side** using a pure TypeScript analytics engine.

---

## 📊 Current Platform Features

- Role-based authentication system:
  - Student login via Registration Number
  - Faculty login via scoped institutional email
  - HOD administrative login
- Live GPA recomputation engine
- SGPA / CGPA calculation (credit-weighted)
- Automatic fail logic for attendance < 75%
- Real-time rank recalculation
- Subject-level grade distribution analytics
- Performance heatmap (50 × 5 optimized grid)
- Faculty mark editing with instant analytics recompute
- CSV export (client-side Blob API)
- Strict route-level and data-level permission enforcement
- Light / Dark theme persistence
- Smooth sidebar collapse animation (60fps)
- Skeleton loading states

---

## 🧠 Architecture Highlights

- Pure TypeScript analytics engine (`analytics.ts`)
- Deterministic grade computation rules
- Zustand-powered global state management
- Store-driven recomputation lifecycle
- Clean separation of:
  - Data
  - State
  - Analytics
  - UI
- Human-maintainable 8-file architecture
- No backend dependencies
- Fully client-side deployment

---

## 🧩 Project Structure

```bash
src/
├── main.tsx
├── App.tsx
├── store.ts
├── analytics.ts
├── data.ts
├── components.tsx
├── dashboards.tsx
└── styles.css
```

---

## 🔐 Demo Credentials
### 🏢 HOD
```
Email: btechcsehod@vit.ac.in
Password: hodpass
```
### 👨‍🏫 Faculty
```
Email format: <fullname lowercase>@vitfaculty.ac.in
Example: rajeshkumar@vitfaculty.ac.in
Password: any 5+ characters
```
### 🎓 Student
```
Login using Registration Number (e.g., 21BCE1001)
Password: any 5+ characters
```

---

## ⚡ Performance Considerations

- Memoized analytics consumers

- No layout shift during navigation

- Optimized heatmap rendering (250 cells)

- No unnecessary re-renders

- Zero console warnings

- Interaction latency under 100ms

---

## 🚀 Run Locally
```bash
npm install
npm run dev
```
Build for production:
```
npm run build
npm run preview
```

---

## 📦 Deployment

Designed for zero-config deployment on:

- Vercel

- Netlify

- Any static hosting provider

Fully client-side. Works offline after first load.

---

## 📄 License

```
MIT License
```

---

