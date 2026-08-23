# Feature: Authentication & Role Gatekeeping

## 1. Purpose
Authenticates administrators, guards against unauthorized access, persists sessions across page reloads, and isolates route branches based on user roles (`super_admin` vs `condo_admin`).

---

## 2. User Interaction
1. Administrator navigates to `/login`.
2. Inputs email and password.
3. Clicks **Login**.
4. Upon successful validation, receives a confirmation toast and is redirected to their assigned dashboard.

---

## 3. Main Files Responsible
- **Page**: [`src/pages/auth/Login.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.jsx) & [`src/pages/auth/Login.css`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.css)
- **Context**: [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx)
- **API**: `api.auth.login` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
- **Router**: [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx)

---

## 4. How It Works

```
User submits form
  ↓
Login.jsx calls login({ email, password })
  ↓
AuthContext invokes api.auth.login(credentials)
  ↓
Backend POST /api/auth/login returns { accessToken, user }
  ↓
AuthContext saves tokens to localStorage ('accessToken', 'user')
  ↓
AuthContext updates user state & sets role flags
  ↓
AppRoutes dynamically mounts role branch (SuperAdminLayout or CondoAdminLayout)
```

---

## 5. Error & Loading States
- **Loading**: Disables submit button and shows `"Logging in..."`.
- **Validation / Auth Error**: Sets local `error` state, renders red error banner `❌ <message>`, and triggers `toast.error()`.
- **Network Failure**: Catches exception and alerts `"Network error. Please check if the server is running."`.
