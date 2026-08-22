# Application Architecture

The HomeAxis Admin Console is built as a clean, single-page web application (SPA) following modern React design patterns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    React Router                         │
│                    AppRoutes.tsx                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   ProtectedRoute                        │
│             Role Checking & Access Guard                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   AdminLayout                           │
│                (Header + Sidebar)                       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Page Coordinators                       │
│  UserManagement / PaymentManagement / PropertyLayout... │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Domain Components      │  │    Domain API Services   │
│ UserTable / PaymentStats │  │ userApi.ts / condoApi... │
└──────────────────────────┘  └─────────────┬────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │    Shared HTTP Client    │
                              │      httpClient.ts       │
                              └──────────────────────────┘
```

## Key Design Patterns

### 1. Page Coordinator Pattern
Each main route renders a Page Coordinator file (`src/pages/<Page>/<Page>.tsx`).
- **Responsibility**: Manages data fetching, top-level state (search parameters, active page number, modal open/close states, error handling), and passes props down to presentation components.
- **Benefits**: Prevents presentation components from making independent data calls or managing duplicated async state.

### 2. Single Responsibility Principle (SRP) Component Design
Components inside `src/components/` do not handle page routing or API data fetching. They focus purely on rendering UI elements:
- **`*Filters.tsx`**: Renders search inputs, filter selectors, and action trigger buttons.
- **`*Table.tsx`**: Renders data rows, status badges, pagination controls, and action triggers.
- **`*Stats.tsx`**: Renders analytic stat card grids.
- **`*Modal.tsx` / `*Dialog.tsx`**: Renders form dialogs for single domain operations (Create, Edit, Delete).

### 3. Decoupled Modular API Layer
API functions are isolated from React components inside `src/services/api/`:
- Domain services (`authApi.ts`, `userApi.ts`, `condoApi.ts`, `paymentApi.ts`, `propertyApi.ts`, `dashboardApi.ts`) define async functions that return typed promises.
- All domain services delegate HTTP calls to `httpClient.ts` (`fetchWithAuth`).

### 4. Unidirectional Data Flow
1. **Fetch**: Page Coordinator calls Domain API on mount or filter change.
2. **Store**: Page Coordinator updates local state with returned data.
3. **Render**: Presentation components receive data via props and render.
4. **Action**: User interacts with presentation component (e.g., submits modal form).
5. **Update**: Presentation component invokes parent callback -> Page Coordinator calls Domain API -> Page updates local state.
