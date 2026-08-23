# Page: Super Admin Reports (`/super-admin/reports`)

## 1. Purpose
System-wide maintenance ticket monitoring, assigning responsibilities, updating ticket statuses, and reviewing communications.

## 2. Route & Access
- Path: `/super-admin/reports`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- Category & status filter tabs.
- Maintenance ticket table with priority badges (`low`, `medium`, `high`, `emergency`).
- Ticket details dialog with response conversation thread.

## 4. API Calls
- `api.reports.getAdminAll(params)`: `GET /reports/admin/all`
- `api.reports.updateStatus(id, data)`: `PUT /reports/:id/status`
- `api.reports.assign(id, data)`: `PUT /reports/:id/assign`
- `api.reports.addResponse(id, data)`: `POST /reports/:id/response`

## 5. Important Files
- `src/pages/super-admin/Reports.jsx`
- [`src/services/reportService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/reportService.js)
