# Folder Structure & Directory Responsibilities

This document describes the actual directory structure of the **React Frontend** (`react/`), explaining the role of each directory, key files contained within, and how different parts of the application connect.

---

## 1. Directory Tree Overview

```
react/
├── docs/                        # Complete modular documentation suite
│   ├── architecture/
│   ├── technologies/
│   ├── services/
│   ├── components/
│   ├── features/
│   ├── pages/
│   └── learning/
│
├── public/                      # Static assets served directly by the browser
│   ├── favicon.svg
│   ├── index.html               # Main HTML entry template containing <div id="root">
│   ├── manifest.json            # PWA / web application metadata
│   └── robots.txt
│
├── src/                         # Application source code
│   ├── api/                     # Centralized Axios instance & API endpoint definitions
│   │   └── axiosConfig.js       # Axios client, request/response interceptors & endpoint map
│   │
│   ├── components/              # Reusable and feature-specific React components
│   │   ├── common/              # Shared UI components across all admin roles
│   │   │   ├── DataTable.jsx    # Placeholder component (empty)
│   │   │   ├── Header.jsx       # Placeholder component (empty)
│   │   │   ├── Sidebar.jsx      # Dynamic navigation sidebar for Super Admin & Condo Admin
│   │   │   ├── StatCard.jsx     # Reusable colored KPI metric card
│   │   │   └── StatusBadge.jsx  # Placeholder component (empty)
│   │   └── user/                # User management dialogs
│   │       ├── EditUserModal.jsx        # Modal dialog to edit user details and role
│   │       └── RegisterUserModal.jsx    # Modal dialog to register a new user in the system
│   │
│   ├── context/                 # Application Context Providers
│   │   └── AuthContext.jsx      # React Context holding user state, tokens & login/logout logic
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useApi.js            # Standardized API fetching hook with auto-fetch & toasts
│   │
│   ├── layouts/                 # Page layout shells wrapping routes via React Router <Outlet />
│   │   ├── CondoAdminLayout.jsx # Layout shell with header & Condo Admin sidebar
│   │   └── SuperAdminLayout.jsx # Layout shell with header & Super Admin sidebar
│   │
│   ├── pages/                   # Route-level page components
│   │   ├── auth/                # Authentication screens
│   │   │   ├── Login.css        # Custom CSS styling for the login card & inputs
│   │   │   └── Login.jsx        # Administrator login page
│   │   │
│   │   ├── condo-admin/         # Pages accessible by Condo Administrators
│   │   │   ├── Announcements.jsx# Condo-specific announcement creation & feeds
│   │   │   ├── Dashboard.jsx    # Local property KPI metrics, occupancy & revenue
│   │   │   ├── EqubManagement.jsx # Local Equb savings circles management
│   │   │   ├── IddirManagement.jsx # Local community Iddir fund management
│   │   │   ├── LostFound.jsx    # Lost & found item logging, claiming & verification
│   │   │   ├── Payments.jsx     # Resident payment slip auditing & status toggles
│   │   │   ├── Reports.jsx      # Resident maintenance ticket tracking & responses
│   │   │   └── Residents.jsx    # Resident directory, block/room assignments & details
│   │   │
│   │   └── super-admin/         # Pages accessible by Super Administrators
│   │       ├── Announcements.jsx# Global system-wide announcements
│   │       ├── Condos.jsx       # Condominium registration, status toggles & directories
│   │       ├── Dashboard.jsx    # System-wide analytics, revenue charts & condo metrics
│   │       ├── EqubIddirManagement.jsx # Joint overview of Equbs and Iddirs across all condos
│   │       ├── Payments.jsx     # Global financial auditing & transaction queries
│   │       ├── Promotions.jsx   # Business promotions, review, approval & analytics
│   │       ├── Reports.jsx      # System-wide maintenance request overview
│   │       └── Users.jsx        # Master system user accounts, verification & role management
│   │
│   ├── routes/                  # Routing system
│   │   ├── AppRoutes.css        # Styles for the layout grid and container
│   │   └── AppRoutes.jsx        # Role-based route definitions and redirects
│   │
│   ├── services/                # Domain-specific API service wrappers
│   │   ├── announcementService.js # Announcement queries, stats calculation & mutations
│   │   ├── crudService.js       # Generic CRUD factory & specific user/report services
│   │   ├── lostFoundService.js  # Lost & found CRUD, claim verification & stats
│   │   ├── promotionService.js  # Promotion CRUD, review actions & revenue stats
│   │   └── reportService.js     # Maintenance ticket CRUD & status workflows
│   │
│   ├── App.css                  # Global application styling rules
│   ├── App.js                   # Root component wrapping ThemeProvider, AuthProvider & ToastContainer
│   ├── App.test.js              # Basic test file
│   ├── index.css                # Base stylesheet
│   ├── index.js                 # React DOM client entry point (`createRoot`)
│   ├── reportWebVitals.js       # Web Vitals performance reporting
│   └── setupTests.js            # Jest test setup
│
├── .env                         # Environment variables (`REACT_APP_API_URL`)
├── .gitignore                   # Git ignore patterns
├── package.json                 # Project dependencies, scripts & metadata
├── package-lock.json            # Exact dependency lockfile
└── README.md                    # Project README
```

---

## 2. Directory Responsibilities & Connections

### `src/api/`
- **Purpose**: Defines the HTTP client and endpoint inventory.
- **Key File**: [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js) exports an Axios instance configured with `baseURL`, a request interceptor that adds the `Authorization: Bearer <token>` header, a response interceptor handling `401 Unauthorized` by clearing storage and redirecting to `/login`, and an `api` dictionary organizing all endpoints by domain.

### `src/context/`
- **Purpose**: Global state management.
- **Key File**: [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx) provides user session data, login/logout functions, and convenience role flags (`isSuperAdmin`, `isCondoAdmin`, `isResident`, `isGuard`).

### `src/hooks/`
- **Purpose**: Reusable stateful logic.
- **Key File**: [`src/hooks/useApi.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/hooks/useApi.js) provides a generic asynchronous request wrapper with automatic error toast notifications.

### `src/layouts/`
- **Purpose**: Master visual frames for authenticated users.
- **Key Files**: [`SuperAdminLayout.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/layouts/SuperAdminLayout.jsx) and [`CondoAdminLayout.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/layouts/CondoAdminLayout.jsx) render the sidebar, top header with user avatar, and a nested `<Outlet />` for child routes.

### `src/pages/`
- **Purpose**: Screen components bound to URL routes.
- **Key Files**: Split into `auth/`, `super-admin/`, and `condo-admin/` matching the user's role.

### `src/routes/`
- **Purpose**: Route configuration.
- **Key File**: [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx) inspects the authenticated user's role and conditionally renders either Super Admin or Condo Admin route branches.
