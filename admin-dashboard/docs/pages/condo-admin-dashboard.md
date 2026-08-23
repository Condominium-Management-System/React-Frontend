# Page: Condo Admin Dashboard (`/condo-admin/dashboard`)

## 1. Purpose
Provides localized property statistics for a site administrator, including occupancy rate percentage, active residents count, monthly collected revenue, active reports, payments, and announcements.

## 2. Route & Access
- Path: `/condo-admin/dashboard`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- 4 Primary `StatsCard` metric cards (Total Residents, Occupancy Rate %, Total Revenue ETB, Total Reports).
- 3 Secondary `StatsCard` metric cards (Total Payments, Announcements, Condo Code banner).
- Bottom Quick Stats summary ribbon.

## 4. State & Data
- `stats`: Object `{ totalResidents, occupancyRate, totalRevenue, totalReports, totalPayments, totalAnnouncements }`
- `user`: Current logged-in user object.

## 5. API Calls
- Parallel requests:
  - `api.users.getAll()`
  - `api.payments.getStatistics()`
  - `api.reports.getAdminAll({ limit: 1 })`
  - `api.announcements.getAll({ limit: 1 })`

## 6. Important Files
- [`src/pages/condo-admin/Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Dashboard.jsx)
