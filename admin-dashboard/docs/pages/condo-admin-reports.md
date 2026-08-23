# Page: Condo Admin Reports (`/condo-admin/reports`)

## 1. Purpose
Handling property maintenance tickets filed by residents of the specific condominium.

## 2. Route & Access
- Path: `/condo-admin/reports`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components & Operations
- Maintenance ticket list with category, status, priority, and resident identifier.
- Status update selector (`pending`, `in_progress`, `resolved`, `rejected`).
- Ticket response message editor.

## 4. API Calls
- `api.reports.getAdminAll(params)`
- `api.reports.updateStatus(id, data)`
- `api.reports.addResponse(id, data)`

## 5. Important Files
- `src/pages/condo-admin/Reports.jsx`
- [`src/services/reportService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/reportService.js)
