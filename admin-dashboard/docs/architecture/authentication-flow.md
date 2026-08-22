# Authentication Flow

This document details the authentication and token lifecycle implemented in the HomeAxis Admin Console.

## Login Sequence

1. User submits email and password on `/login`.
2. `Login.tsx` calls `login(credentials, rememberMe)` provided by `AuthContext`.
3. `loginApi` in `src/services/api/authApi.ts` issues `POST /api/auth/login`.
4. Backend returns `accessToken`, `refreshToken`, and user profile payload.
5. `saveStoredSession` saves session data:
   - If `rememberMe === true`: Saved to `localStorage`.
   - If `rememberMe === false`: Saved to `sessionStorage`.
6. `AuthContext` updates internal state (`user`, `accessToken`, `isAuthenticated = true`).
7. User is navigated to `/dashboard`.

## Session Restoration

On application startup:
1. `AuthProvider` in `src/context/AuthContext.tsx` invokes `getStoredSession()`.
2. If session exists in `localStorage` or `sessionStorage` with valid `accessToken` and `user`, state is restored automatically.
3. `isLoading` is set to `false`, allowing guarded routes to render without redirecting to `/login`.

## Automatic Token Refresh (401 Interceptor)

The shared HTTP wrapper `fetchWithAuth` in `src/services/api/httpClient.ts` automatically manages token refresh:

```
Outgoing API Request (fetchWithAuth)
          │
          ▼
Attach 'Authorization: Bearer <accessToken>'
          │
          ▼
    Execute fetch
          │
    ┌─────┴─────┐
    │  Status?  │
    └─────┬─────┘
          │
     401 Unauthorized (and refreshToken exists)
          │
          ▼
   Is refresh in progress?
   ├── No: Trigger refreshTokenApi(session.refreshToken)
   └── Yes: Wait on existing refreshingPromise
          │
          ▼
   On New Token:
   Update stored session with new accessToken
   Retry original request with new token header
          │
          ▼
   On Refresh Failure:
   Clear session storage (clearStoredSession)
   Redirect window to /login
```

To prevent race conditions when multiple API calls receive `401` simultaneously, `httpClient.ts` maintains a module-level variable `refreshingPromise`. Concurrent requests await the same refresh promise rather than issuing duplicate refresh calls.

## Logout Flow

1. User clicks **Logout Console** button in `Sidebar.tsx`.
2. `logout()` in `AuthContext` executes `logoutApi()` (`POST /api/auth/logout`) passing the refresh token.
3. Session storage is cleared locally (`clearStoredSession()`) regardless of network success.
4. User is redirected to `/login`.

## Code Locations
- **Session & Token Storage Helpers**: `src/services/api/httpClient.ts` (`getStoredSession`, `saveStoredSession`, `clearStoredSession`)
- **HTTP Wrapper & 401 Interceptor**: `src/services/api/httpClient.ts` (`fetchWithAuth`)
- **Auth Service APIs**: `src/services/api/authApi.ts` (`loginApi`, `logoutApi`, `getProfileApi`, `updateProfileApi`)
- **Auth Context & Provider**: `src/context/AuthContext.tsx`
