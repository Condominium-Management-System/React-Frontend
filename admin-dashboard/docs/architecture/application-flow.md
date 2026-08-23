# Application Flow & Architecture

This document describes how the React frontend works from startup to rendering pages and handling user interactions.

---

## 1. High-Level Flow Diagram

```
Application Startup (index.html)
      ↓
React DOM Root (src/index.js)
      ↓
App Wrapper (src/App.js)
  ├─ ThemeProvider (MUI v5 Gold Palette)
  ├─ CssBaseline (Normalized baseline styles)
  ├─ BrowserRouter (HTML5 History API)
  ├─ AuthProvider (Checks localStorage for session)
  │     ↓
  │   AppRoutes (src/routes/AppRoutes.jsx)
  │     ├── [Unauthenticated] → Login (/login)
  │     ├── [Role = super_admin] → SuperAdminLayout + /super-admin/*
  │     └── [Role = condo_admin] → CondoAdminLayout + /condo-admin/*
  └─ ToastContainer (React-Toastify alert system)
```

---

## 2. Step-by-Step Lifecycle Breakdown

### Phase 1: Bootstrap & Theme Initialization
1. Browser loads [`public/index.html`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/public/index.html).
2. [`src/index.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/index.js) mounts `<App />` using React 18 `createRoot`.
3. [`src/App.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/App.js) creates a custom Material UI theme:
   - Primary Brand Color: `#D3AD32` (Gold)
   - Background default: `#f8f9fa`
   - Typography font family: `'Inter', 'Segoe UI', Roboto, sans-serif`
   - Border radius: `12px`

### Phase 2: Authentication Initialization
1. `<AuthProvider>` in [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx) runs its initialization `useEffect`.
2. Reads `accessToken` and `user` string from browser `localStorage`.
3. If found, parses JSON user data, restores `user` state, and sets boolean flags:
   - `isSuperAdmin = (userData.role === 'super_admin')`
   - `isCondoAdmin = (userData.role === 'condo_admin')`
   - `isResident = (userData.role === 'resident')`
   - `isGuard = (userData.role === 'guard')`
4. Sets `loading = false`.

### Phase 3: Route Resolution & Access Control
[`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx) inspects the auth state:
- If `loading === true`: Renders `<div>Loading...</div>`.
- If `!isAuthenticated`: Renders `<Route path="/login" element={<Login />} />` and redirects all other routes to `/login`.
- If `user.role === 'super_admin'`:
  - Renders `<SuperAdminLayout />` containing sidebar with Super Admin links (Condos, Users, Reports, Payments, Announcements, Promotions, Equb & Iddir).
  - Nesting `<Outlet />` renders matching child route (e.g. `<SuperAdminDashboard />`).
- If `user.role === 'condo_admin'`:
  - Renders `<CondoAdminLayout />` containing sidebar with Condo Admin links (Residents, Reports, Payments, Lost & Found, Announcements, Equbs, Iddirs).
  - Nesting `<Outlet />` renders matching child route (e.g. `<CondoAdminDashboard />`).

### Phase 4: Page Rendering & Data Fetching
1. Page component mounts (e.g., [`Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx)).
2. `useEffect` triggers data fetching function (e.g. `fetchCondos()`).
3. Makes HTTP call via `api.condos.getAll()` defined in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js).
4. Request interceptor injects `Authorization: Bearer <accessToken>`.
5. Axios sends request to `https://backend-a3xi.onrender.com/api/condos`.
6. Response arrives, response interceptor logs data, page updates state (`setCondos(data)`), and renders Material UI table, KPI statistics cards, and charts.

### Phase 5: User Interaction & Mutations
1. User creates, updates, deletes, or toggles status of an entity.
2. Form or action handler calls the corresponding service method (e.g., `api.condos.create(formData)` or `fetch(...)`).
3. Upon success, triggers `toast.success(...)`, closes active dialog, and re-invokes page fetcher to display updated data.
