# React Frontend Documentation - HomeAxis CMS

Welcome to the comprehensive technical documentation for the **React Frontend** (`react/`) of the HomeAxis Condominium Management System.

---

## 🎯 Project Overview

The React frontend is a Single Page Application (SPA) built using **React 18**, **Material UI (MUI v5)**, **Axios**, and **React Router DOM v6**. It provides dedicated management consoles for:
1. **Super Administrators**: Full system oversight across all condominiums, global user rosters, revenue reports, promotions, announcements, and joint Equb & Iddir community funds.
2. **Condo Administrators**: Scoped site administration for an assigned property code, managing local residents, maintenance requests, payment slip verification, lost & found registries, and property-specific Equbs & Iddirs.

---

## 📚 Documentation Navigation

### 🏗️ Architecture & Core System
- [Folder Structure](architecture/folder-structure.md) — Comprehensive breakdown of directories, responsibilities, and file boundaries.
- [Application Flow](architecture/application-flow.md) — Step-by-step lifecycle from browser bootstrap to page rendering.
- [Routing Architecture](architecture/routing.md) — Role-based routing table, layout nesting, guards, and redirection behavior.
- [State Management](architecture/state-management.md) — Global `AuthContext`, custom `useApi` hook, and local component states.
- [Authentication & Authorization](architecture/authentication.md) — JWT token storage, login/logout mechanisms, and role verification.
- [Data Flow](architecture/data-flow.md) — Visual diagrams tracing API calls, mutations, responses, and re-renders.

### 💻 Technologies & Dependencies
- [Frontend Stack](technologies/frontend-stack.md) — Exact versions, build tools, React scripts, and configuration.
- [Libraries & Packages](technologies/libraries.md) — Material UI, Emotion, Recharts, React-Toastify, Axios, and Icons.

### 🔌 API & Services
- [API Services & Axios Layer](services/api-services.md) — Centralized `axiosConfig.js`, interceptors, and service wrappers.
- [Real-Time & WebSockets Status](services/realtime.md) — Analysis of real-time communication in this frontend.

### 🧩 Components
- [Component Organization](components/component-organization.md) — Component architecture, state ownership, and styling.
- [Layout Components](components/layout-components.md) — `SuperAdminLayout`, `CondoAdminLayout`, `Sidebar`.
- [User Modals](components/user-modals.md) — `RegisterUserModal` and `EditUserModal`.
- [Common Components](components/common-components.md) — `StatCard`, status badges, and tables.

### 🚀 Features Deep-Dives
- [File-Level Feature Mapping Matrix](features/feature-mapping.md) — **Master Table** connecting each feature to its Page, Components, and Service.
- [Authentication Feature](features/authentication.md)
- [Condominium Management](features/condo-management.md)
- [User & Resident Management](features/user-management.md)
- [Payment Tracking & Invoices](features/payment-management.md)
- [Maintenance Reports](features/report-management.md)
- [Announcements](features/announcements.md)
- [Lost & Found](features/lost-and-found.md)
- [Promotions](features/promotions.md)
- [Equb & Iddir Management](features/equb-and-iddir.md)

### 📄 Pages Reference
- [Login Page](pages/login.md) (`/login`)
- **Super Admin Pages:**
  - [Dashboard](pages/super-admin-dashboard.md) (`/super-admin/dashboard`)
  - [Condominiums](pages/super-admin-condos.md) (`/super-admin/condos`)
  - [Users Directory](pages/super-admin-users.md) (`/super-admin/users`)
  - [Payments](pages/super-admin-payments.md) (`/super-admin/payments`)
  - [Reports](pages/super-admin-reports.md) (`/super-admin/reports`)
  - [Announcements](pages/super-admin-announcements.md) (`/super-admin/announcements`)
  - [Promotions](pages/super-admin-promotions.md) (`/super-admin/promotions`)
  - [Equb & Iddir](pages/super-admin-equb-iddir.md) (`/super-admin/equb-iddir`)
- **Condo Admin Pages:**
  - [Dashboard](pages/condo-admin-dashboard.md) (`/condo-admin/dashboard`)
  - [Residents](pages/condo-admin-residents.md) (`/condo-admin/residents`)
  - [Reports](pages/condo-admin-reports.md) (`/condo-admin/reports`)
  - [Payments](pages/condo-admin-payments.md) (`/condo-admin/payments`)
  - [Lost & Found](pages/condo-admin-lost-found.md) (`/condo-admin/lost-found`)
  - [Announcements](pages/condo-admin-announcements.md) (`/condo-admin/announcements`)
  - [Equb Management](pages/condo-admin-equbs.md) (`/condo-admin/equbs`)
  - [Iddir Management](pages/condo-admin-iddirs.md) (`/condo-admin/iddirs`)

### 🎓 Developer Learning Guide
- [Concepts Used in Codebase](learning/concepts-used.md) — Beginner → Intermediate → Advanced guide with code references.
- [Recommended Learning Path](learning/learning-path.md) — Structured step-by-step roadmap for mastering this codebase.
- [Known Issues & Clarifications](learning/known-issues-and-clarifications.md) — Documented code anomalies and unused files.
