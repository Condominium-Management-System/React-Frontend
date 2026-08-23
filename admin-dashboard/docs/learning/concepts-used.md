# Core Concepts Used in this Codebase

This guide organizes the technical concepts used across the React frontend from **Beginner** to **Advanced**, pointing directly to source files where you can study them.

---

## 🟢 1. Beginner Concepts

### A. Functional Components & JSX
- **What it is**: Modern React components written as JavaScript functions returning JSX templates.
- **Where to study it**:
  - [`src/components/common/StatCard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/StatCard.jsx) — A concise, clean functional component receiving props and returning styled JSX.

### B. Props & Component Reusability
- **What it is**: Passing data and callbacks from parent to child components.
- **Where to study it**:
  - [`src/components/common/Sidebar.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/Sidebar.jsx) — Receives `isSuperAdmin` boolean and `onLogout` callback function.

### C. State with `useState`
- **What it is**: React's primary hook for tracking component-level data that changes over time.
- **Where to study it**:
  - [`src/pages/auth/Login.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.jsx) — Tracks `email`, `password`, `loading`, and `error` state.

### D. Side-Effects with `useEffect`
- **What it is**: Triggering asynchronous data fetching or subscriptions when a component mounts.
- **Where to study it**:
  - [`src/pages/super-admin/Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx) — Fetches condominium data on initial component mount via `useEffect(() => { fetchCondos(); }, [])`.

---

## 🟡 2. Intermediate Concepts

### A. Global State via React Context API
- **What it is**: Sharing state across the entire component tree without prop-drilling.
- **Where to study it**:
  - [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx) — Creates `AuthContext`, wraps children with `<AuthContext.Provider>`, and provides custom consumer hook `useAuth()`.

### B. Custom React Hooks
- **What it is**: Extracting reusable stateful logic into custom hook functions.
- **Where to study it**:
  - [`src/hooks/useApi.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/hooks/useApi.js) — Encapsulates loading states, error handling, toast alerts, and automatic/manual execution.

### C. Nested Layouts & Outlet Routing (React Router v6)
- **What it is**: Wrapping sub-pages within a shared UI frame (Sidebar + Header) using `<Outlet />`.
- **Where to study it**:
  - [`src/layouts/SuperAdminLayout.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/layouts/SuperAdminLayout.jsx) & [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx).

### D. Centralized HTTP Interceptors (Axios)
- **What it is**: Intercepting every HTTP request to inject JWT authorization tokens, and intercepting responses to catch 401 Unauthorized errors for automatic logout.
- **Where to study it**:
  - [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js).

---

## 🔴 3. Advanced Concepts

### A. Role-Branch Dynamic Routing
- **What it is**: Conditionally rendering completely different route trees based on the user's role, ensuring total isolation between Super Admin and Condo Admin panels.
- **Where to study it**:
  - [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx#L60-L98).

### B. Styled Components with Emotion & Material UI
- **What it is**: Creating customizable, theme-aware CSS-in-JS components.
- **Where to study it**:
  - [`src/pages/super-admin/Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx#L53-L140) — Uses `styled(TableContainer)`, `styled(Card)`, and `styled(Chip)` with dynamic prop-based styling.

### C. Multi-Service Parallel Data Aggregation
- **What it is**: Using `Promise.all` to fetch data from multiple independent endpoints concurrently to build consolidated KPI dashboards.
- **Where to study it**:
  - [`src/pages/super-admin/Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Dashboard.jsx#L105-L127).
