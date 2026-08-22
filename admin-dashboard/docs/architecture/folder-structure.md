# Folder Structure

This document describes the actual directory organization of the `admin-dashboard` frontend codebase.

```
src/
├── components/          # Presentational UI components (Single Responsibility Principle)
│   ├── auth/            # ProtectedRoute component
│   ├── condo/           # Condo filters, table, and action modals
│   ├── dashboard/       # Stat cards & property overview components
│   ├── layout/          # Admin layout shell (Header, Sidebar, UserProfile)
│   ├── payment/         # Payment stats, filters, table, details & action dialogs
│   ├── profile/         # Profile cards & update modals
│   ├── property/        # Property stats, filters, room table, and unit modals
│   └── user/            # User filters, table, registration & edit modals
├── context/             # Global application state
│   ├── AuthContext.tsx  # Session state provider & startup restore logic
│   ├── AuthContextDefinition.ts # AuthContext interface definition
│   └── useAuth.ts       # Custom hook to access AuthContext
├── pages/               # Page Coordinators (State fetching & modal orchestration)
│   ├── CondoManagement/ # Condominium management page
│   ├── Dashboard/       # System analytics dashboard page
│   ├── Login/           # Login authentication page
│   ├── PaymentManagement/ # Payment management page
│   ├── Profile/         # Admin profile page
│   ├── PropertyLayout/  # Blocks & rooms management page
│   └── UserManagement/  # User administration page
├── routes/              # Routing configuration
│   └── AppRoutes.tsx    # App route map & role guards
├── services/            # Data & API abstraction layer
│   ├── api/             # Modular domain API services
│   │   ├── authApi.ts      # Authentication & profile APIs
│   │   ├── condoApi.ts     # Condominium CRUD APIs
│   │   ├── dashboardApi.ts # Analytics dashboard API
│   │   ├── httpClient.ts   # Shared fetch client with 401 refresh interceptor
│   │   ├── paymentApi.ts   # Payment management APIs
│   │   ├── propertyApi.ts  # Property blocks & rooms APIs
│   │   └── userApi.ts      # User management & role APIs
│   └── types/           # TypeScript interfaces & types
│       ├── auth.ts      # User & session type definitions
│       ├── condo.ts     # Condo entity payload types
│       ├── dashboard.ts # Analytics data response types
│       ├── payment.ts   # Payment invoice & stat types
│       ├── property.ts  # Block & room unit types
│       └── user.ts      # User payload interfaces
└── utils/               # Reusable utility functions
    └── roleHelpers.ts   # Role checking helpers (`isSuperAdmin`, `canAccessWebConsole`)
```

## Folder Responsibilities

- **`src/pages/`**: Serves as Page Coordinators. Pages load data via domain APIs, manage page-level state (loading, errors, pagination, open modals), and pass data down to components.
- **`src/components/`**: Organized by domain. Presentational components handle rendering UI structures (tables, filters, cards, modals) and emit user action callbacks back to pages.
- **`src/services/api/`**: Domain API functions decoupled from React UI. All domain API files import from `httpClient.ts`.
- **`src/services/types/`**: Strict TypeScript interfaces for API requests, responses, and domain entities.
- **`src/context/`**: React Context providing global user authentication state and session persistence across page reloads.
- **`src/routes/`**: Centralized route definitions guarded by `<ProtectedRoute />`.
- **`src/utils/`**: Helper utilities for role evaluation and formatting.
