# HomeAxis Admin Console - Technical Documentation

Welcome to the technical documentation for the **HomeAxis Admin Console** (`admin-dashboard`), the web administration portal for the HomeAxis Condominium Management System (CMS).

## Project Overview

The Admin Console is a single-page web application (SPA) designed for **Super Administrators** and **Condominium Property Administrators**. It enables property management, user role administration, financial payment auditing, and real-time analytics.

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: Native React Context (`AuthContext`) & Page Coordinator State

---

## Documentation Navigation

### 🏗️ Architecture
- [Folder Structure](architecture/folder-structure.md) — Detailed breakdown of source directories and file organization.
- [Application Architecture](architecture/application-architecture.md) — Page Coordinator pattern, component design, and data flow.
- [Authentication Flow](architecture/authentication-flow.md) — Login process, JWT session handling, and automatic token refresh.
- [Role-Based Access Control](architecture/role-based-access.md) — Permissions and boundaries for `super_admin`, `condo_admin`, and `resident`.

---

### 📄 Pages
- [Login Page](pages/login.md) (`/login`)
- [Dashboard](pages/dashboard.md) (`/dashboard`)
- [Condominium Management](pages/condominium-management.md) (`/condos`)
- [User Management](pages/user-management.md) (`/users`)
- [Payment Management](pages/payment-management.md) (`/payments`)
- [Property Layout](pages/property-layout.md) (`/blocks-rooms`)
- [Profile Settings](pages/profile.md) (`/profile`)

---

### 🔌 API Service Layer
- [API Layer Overview](api/overview.md) — Shared HTTP client (`httpClient.ts`) and fetch interceptor logic.
- [Authentication API](api/auth-api.md) — Login, logout, and profile endpoints.
- [User API](api/user-api.md) — User querying, creation, updating, role assignment, and deletion.
- [Condo API](api/condo-api.md) — Condominium CRUD endpoints.
- [Payment API](api/payment-api.md) — Payment statistics, query filters, invoice details, and approval/rejection.
- [Property API](api/property-api.md) — Property block and room unit CRUD endpoints.
- [Dashboard API](api/dashboard-api.md) — Analytics summary endpoints.

---

### 📊 Features Matrix
- [Implemented Features](features/implemented-features.md) — Checklist of fully working functionality.
- [Remaining & Missing Features](features/remaining-features.md) — Status of non-implemented or planned modules.
