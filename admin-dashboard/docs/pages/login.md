# Login Page

## Purpose
Authenticates administrative users (Super Admins and Condo Admins) entering the HomeAxis web console.

## Route
`/login`

## Who Can Access It
Public (unauthenticated users). Authenticated users are automatically redirected to `/dashboard`.

## Main Features
- Email and password input fields.
- Password visibility toggle (Show/Hide).
- *Remember Me* checkbox option (toggles session storage between `localStorage` and `sessionStorage`).
- Form validation and inline error message display.
- Form submission loading state indicator.

## Components Used
- Internal form elements within `src/pages/Login/Login.tsx`.

## API Calls
- `loginApi(credentials)` from `src/services/api/authApi.ts` (`POST /api/auth/login`).

## Data Flow
```
User enters credentials & submits form
                 │
                 ▼
  Login.tsx calls AuthContext.login()
                 │
                 ▼
  authApi.ts executes POST /api/auth/login
                 │
                 ▼
  On success: Session saved to storage, AuthContext updated
                 │
                 ▼
  User navigated to /dashboard
```

## Important Role Rules
- If credentials belong to a non-admin account (e.g. `resident`), login succeeds at the API level but `<ProtectedRoute />` intercepts the user post-login and displays an Access Denied barrier.

## Current Limitations
- None.
