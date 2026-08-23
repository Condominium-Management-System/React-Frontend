# API Services & HTTP Architecture

This document describes the API client configuration, interceptors, and service wrappers in the React frontend.

---

## 1. Centralized Axios Client (`axiosConfig.js`)

Implemented in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js):

### Configuration:
- `baseURL`: `https://backend-a3xi.onrender.com/api`
- `timeout`: `30000ms` (30 seconds)
- `headers`: `'Content-Type': 'application/json'`

### Interceptors:
1. **Request Interceptor**:
   - Reads `localStorage.getItem('accessToken')`.
   - If present, attaches `config.headers.Authorization = 'Bearer ' + token`.
   - Logs outgoing request method, URL, and payload.
2. **Response Interceptor**:
   - Logs incoming response status, URL, and payload.
   - On `401 Unauthorized`: Wipes `accessToken` and `user` from `localStorage` and triggers hard redirect via `window.location.href = '/login'`.

---

## 2. Structured `api` Dictionary Catalog

The `api` object in `axiosConfig.js` groups all REST endpoints into domains:

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **auth** | `login(data)` | `POST /auth/login` | Authenticates administrator with email and password. |
| | `logout()` | `POST /auth/logout` | Informs backend of logout. |
| | `me()` | `GET /auth/me` | Fetches current user profile. |
| **condos** | `getAll()` | `GET /condos` | Returns list of all registered condominiums. |
| | `getById(id)` | `GET /condos/:id` | Returns single condominium details. |
| | `create(data)` | `POST /condos` | Creates a new condominium. |
| | `update(id, data)` | `PATCH /condos/:id` | Updates condominium properties. |
| | `toggleStatus(id)` | `PATCH /condos/:id/status` | Toggles active/inactive status. |
| | `delete(id)` | `DELETE /condos/:id` | Deletes a condominium. |
| **users** | `getAll(condoId?)` | `GET /admin/users` or `/admin/users/:condoId` | Fetches system users. |
| | `getById(id)` | `GET /admin/users/:id` | Fetches single user. |
| | `verify(condoId, userId)` | `PATCH /admin/users/:condoId/:userId/verify` | Verifies a user account. |
| | `update(condoId, userId, data)` | `PATCH /users/:condoId/:userId` | Updates user details and role. |
| | `delete(condoId, userId)` | `DELETE /users/:condoId/:userId` | Deletes a user. |
| **reports**| `getMy()` | `GET /reports/my` | Fetches resident's reports. |
| | `getAdminAll(params)` | `GET /reports/admin/all` | Fetches paginated reports for admin. |
| | `getById(id)` | `GET /reports/:id` | Fetches report details. |
| | `create(data)` | `POST /reports` | Submits maintenance report. |
| | `update(id, data)` | `PUT /reports/:id` | Updates report. |
| | `delete(id)` | `DELETE /reports/:id` | Deletes report. |
| | `assign(id, data)` | `PUT /reports/:id/assign` | Assigns technician/admin to report. |
| | `updateStatus(id, data)` | `PUT /reports/:id/status` | Updates status (`pending`, `in_progress`, `resolved`). |
| | `addResponse(id, data)` | `POST /reports/:id/response` | Appends response message. |
| **payments**| `getAll(params)` | `GET /payments` | Fetches filtered payment records. |
| | `getStatistics()` | `GET /payments/statistics` | Fetches total volume and payment counts. |
| | `approve(id, data)` | `PATCH /payments/:id/approve` | Approves payment receipt. |
| | `reject(id, data)` | `PATCH /payments/:id/reject` | Rejects payment with reason. |
| **lostFound**| `getAll(params)` | `GET /lost-found` | Lists lost and found notices. |
| | `create(data)` | `POST /lost-found` | Creates lost or found notice. |
| | `claim(id, data)` | `POST /lost-found/:id/claim` | Submits claim request. |
| | `verifyClaim(id)` | `PUT /lost-found/:id/verify-claim` | Verifies resident ownership claim. |
| **promotions**| `getAll(params)` | `GET /promotions` | Lists business promotions. |
| | `create(data)` | `POST /promotions` | Submits new promotion campaign. |
| | `review(id, data)` | `PUT /promotions/:id/review` | Approves or rejects promotion. |
| **announcements**| `getAll(params)`| `GET /announcements` | Fetches property announcements. |
| | `create(data)` | `POST /announcements` | Publishes new broadcast. |
| **equbs** | `getAll(condoId)` | `GET /equbs/:condoId/equbs` | Lists Equbs for a condo. |
| | `create(condoId, data)` | `POST /equbs/:condoId/equbs` | Creates a new Equb circle. |
| **iddirs**| `getAll(condoId)` | `GET /iddirs/:condoId/iddirs` | Lists Iddirs for a condo. |
| | `create(condoId, data)` | `POST /iddirs/:condoId/iddirs` | Creates a new Iddir fund. |

---

## 3. Dedicated Service Modules

Located under `src/services/`:
- [`announcementService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/announcementService.js): Sanitizes query parameters and calculates stats (total, pinned, active, expired, by type).
- [`lostFoundService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/lostFoundService.js): Wraps CRUD, claiming, verification, and compute stats.
- [`promotionService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/promotionService.js): Handles FormData payloads for promo banners, review actions, and calculates revenue.
- [`crudService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/crudService.js): Contains a generic `createCrudService(basePath)` factory and specific user/report service instances.
