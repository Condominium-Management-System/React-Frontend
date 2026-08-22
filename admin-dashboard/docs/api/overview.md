# API Layer Overview

The API service layer is located inside `src/services/api/` and provides a clean separation between HTTP network requests and React presentation components.

## Architecture

```
React Component / Page Coordinator
                │
                ▼
      Domain API Service File
   (authApi / userApi / condoApi / paymentApi / propertyApi / dashboardApi)
                │
                ▼
       Shared HTTP Client
         (httpClient.ts)
                │
                ▼
       Backend REST API
```

## Shared HTTP Client (`httpClient.ts`)

All domain API service files import network execution functions from `src/services/api/httpClient.ts`.

### Core Responsibilities
- **Base URL Resolution**: Resolves API base URL dynamically from `import.meta.env.VITE_API_BASE_URL` (defaults to `http://localhost:3000` if unset).
- **Session Storage Helpers**: `getStoredSession()`, `saveStoredSession()`, `clearStoredSession()`.
- **`fetchWithAuth(endpoint, options)` Wrapper**:
  - Automatically sets default `Content-Type: application/json` (unless body is `FormData`).
  - Automatically attaches `Authorization: Bearer <accessToken>`.
  - **401 Unauthorized Interceptor**: Intercepts `401` status responses, transparently triggers `POST /api/auth/refresh-token`, updates stored access token, and retries original request.
  - Keeps a single `refreshingPromise` to prevent duplicate concurrent refresh calls.

## Summary of Domain API Files

| File | Responsibilities | Endpoints Handled |
|:---|:---|:---|
| `authApi.ts` | Login, logout, profile loading & updating | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me` |
| `userApi.ts` | User listing, registration, update, role assignment, deletion | `GET /api/admin/users`, `GET /api/users/:condoId`, `POST /api/auth/register`, `PATCH /api/users/:condoId/:userId`, `PATCH /api/users/:condoId/:userId/role`, `DELETE /api/users/:condoId/:userId` |
| `condoApi.ts` | Condominium CRUD operations | `GET /api/condos`, `POST /api/condos`, `PATCH /api/condos/:id`, `DELETE /api/condos/:id` |
| `paymentApi.ts` | Payment statistics, querying, invoice detail loading, approvals & rejections | `GET /api/payments/statistics`, `GET /api/payments`, `GET /api/payments/:id`, `PATCH /api/payments/:id/approve`, `PATCH /api/payments/:id/reject` |
| `propertyApi.ts` | Property block & apartment room unit management | `GET /api/blocks/:condoId/blocks`, `POST /api/blocks/:condoId/blocks`, `GET /api/rooms/:condoId`, `POST /api/rooms/:condoId`, `PATCH /api/rooms/:condoId/:roomId/status` |
| `dashboardApi.ts` | Analytics summary metrics | `GET /api/admin/dashboard` |
