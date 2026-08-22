# Dashboard Page

## Purpose
Provides an executive analytics overview of key condominium management metrics, financial totals, and property occupancy statistics.

## Route
`/dashboard`

## Who Can Access It
- `super_admin`
- `condo_admin`

## Main Features
- **Summary Metrics Cards**: Total Users, Total Condominiums, Total Payments, Total Transactions, Total Reports, Equb/Iddir member metrics, and Service Fees collected.
- **Property Occupancy Grid**: Visual unit status summary (Total Blocks, Total Rooms, Occupied Rooms, Free Rooms, Reserved Rooms).
- **Manual Refresh**: Button to re-fetch latest metrics.

## Components Used
- `src/components/dashboard/StatCard.tsx` — Renders metric summary cards.
- `src/components/dashboard/PropertyOverview.tsx` — Renders the unit occupancy status grid.

## API Calls
- `getDashboardApi()` from `src/services/api/dashboardApi.ts` (`GET /api/admin/dashboard`).

## Data Flow
```
Dashboard.tsx mounts
         │
         ▼
Calls getDashboardApi()
         │
         ▼
fetchWithAuth executes GET /api/admin/dashboard
         │
         ▼
Backend returns DashboardData object -> Stored in local state
         │
         ▼
Passes metrics as props to <StatCard /> and <PropertyOverview />
```

## Important Role Rules
- Super Admins view system-wide aggregate totals across all registered condominiums.
- Condo Admins view metrics returned for their assigned condominium scope.

## Current Limitations
- None.
