# Page: Super Admin Dashboard (`/super-admin/dashboard`)

## 1. Purpose
Provides high-level system metrics, revenue performance graphs, payment method distributions, and summary statistics across all registered condominiums.

## 2. Route & Access
- Path: `/super-admin/dashboard`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Main Components & Visuals
- 4 Primary `StatsCard` KPI cards (Total Condos, Total Users, Total Revenue, Total Reports).
- Recharts `AreaChart` with gradient fill showing monthly revenue performance.
- Recharts `PieChart` breaking down payment channels (Bank Transfer, Telebirr, CBE Birr).
- Quick Stats summary banner.

## 4. State
- `stats`: Object `{ totalCondos, totalUsers, totalRevenue, totalReports, totalPayments }`
- `loading`: Boolean
- `error`: String or null

## 5. API Calls
- Parallel requests:
  - `api.condos.getAll()`
  - `api.users.getAll()`
  - `api.payments.getStatistics()`

## 6. Important Files
- [`src/pages/super-admin/Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Dashboard.jsx)
