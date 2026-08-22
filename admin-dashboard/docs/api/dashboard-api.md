# Dashboard API (`dashboardApi.ts`)

File Path: `src/services/api/dashboardApi.ts`

Handles executive analytics dashboard metrics retrieval.

---

## Functions

### 1. `getDashboardApi()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/admin/dashboard`
- **Purpose**: Fetches aggregate metrics for users, condos, payments, transactions, blocks, rooms, equbs, iddirs, reports, and service fees.
- **Response**: `DashboardData` object.
- **Used By**: `src/pages/Dashboard/Dashboard.tsx`.
