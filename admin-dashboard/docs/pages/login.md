# Page: Login (`/login`)

## 1. Purpose
The authentication gateway for administrators to access the HomeAxis management system.

## 2. Route
- Path: `/login`
- Access: Public
- Layout: Standalone page container

## 3. State & Hooks
- `email`: string
- `password`: string
- `loading`: boolean
- `error`: string (error message)
- `useAuth()`: provides `login()` function
- `useNavigate()`: redirects user post-login

## 4. API Calls
- `api.auth.login({ email, password })`: `POST /api/auth/login`

## 5. Data Flow
```
User Enters Credentials → Clicks Login
  ↓
login({ email, password }) in AuthContext
  ↓
api.auth.login(credentials) in axiosConfig.js
  ↓
Server responds with token & user JSON
  ↓
Stored in localStorage
  ↓
Navigate to /super-admin/dashboard or /condo-admin/dashboard
```

## 6. Important Files
- [`src/pages/auth/Login.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.jsx)
- [`src/pages/auth/Login.css`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.css)
