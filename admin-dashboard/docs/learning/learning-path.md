# Recommended Learning Path

If you are a developer taking over this codebase, follow this structured roadmap to understand the application quickly and effectively.

---

## 🗺️ Step-by-Step Study Guide

```
Step 1: Entry Point & Config
  └─ package.json & src/index.js & src/App.js
        ↓
Step 2: Authentication & Context
  └─ src/context/AuthContext.jsx & src/pages/auth/Login.jsx
        ↓
Step 3: Routing & Access Isolation
  └─ src/routes/AppRoutes.jsx & src/layouts/
        ↓
Step 4: API Layer & Interceptors
  └─ src/api/axiosConfig.js & src/hooks/useApi.js
        ↓
Step 5: Master A Simple CRUD Page
  └─ src/pages/super-admin/Condos.jsx
        ↓
Step 6: Study Complex UI Dialogs & Forms
  └─ src/components/user/RegisterUserModal.jsx & EditUserModal.jsx
        ↓
Step 7: Analytics & Data Aggregation
  └─ src/pages/super-admin/Dashboard.jsx (Recharts + Promise.all)
        ↓
Step 8: Domain Services
  └─ src/services/announcementService.js, lostFoundService.js, promotionService.js
        ↓
Step 9: Deep Dive Into Scoped Administration
  └─ src/pages/condo-admin/Residents.jsx & LostFound.jsx
```

---

## 📋 Detailed Step Checklist

### 1. Step 1: Entry Point & Styling
- Open [`src/index.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/index.js) and [`src/App.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/App.js).
- Notice the Material UI `createTheme` setup with gold brand color `#D3AD32`.
- Notice how `ThemeProvider`, `BrowserRouter`, `AuthProvider`, and `ToastContainer` wrap `AppRoutes`.

### 2. Step 2: Authentication
- Open [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx).
- Understand how `login()` saves the token and user object to `localStorage`.
- Open [`src/pages/auth/Login.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.jsx) to see form submission and post-login navigation.

### 3. Step 3: Routing Architecture
- Open [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx).
- Trace how `user.role` splits the route tree between `SuperAdminLayout` and `CondoAdminLayout`.

### 4. Step 4: API & Interceptors
- Open [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js).
- Inspect how `axiosInstance.interceptors.request` injects the `Bearer` token.
- Inspect how `axiosInstance.interceptors.response` handles `401` errors by logging out and redirecting to `/login`.

### 5. Step 5: Study `Condos.jsx` (Gold Standard CRUD Example)
- Open [`src/pages/super-admin/Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx).
- Study how `fetchCondos()` sets state, how `searchTerm` and `filterType` filter data in memory, and how pagination operates.
