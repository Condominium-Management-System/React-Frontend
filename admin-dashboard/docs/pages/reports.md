# Maintenance Reports Page

## Purpose
Enables Super Administrators to manage resident maintenance and repair requests, inspect report details, update report statuses (`reported`, `assigned`, `in_progress`, `resolved`, `closed`), log resolution notes, and communicate via report responses.

## Route
`/reports`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Report Listing Table**: Displays report title, description preview, category badge, priority tag (`low`, `medium`, `high`, `emergency`), status badge, reporter details (block & room), submission date, and *View Details* action trigger.
- **Multi-Criteria Filtering & Search**: Text search by title or description, status dropdown filter, category dropdown filter, and priority dropdown filter.
- **Report Details & Activity Modal**: Comprehensive detail view displaying ticket description, photo attachments, reporter profile info, status update form with resolution notes, and response discussion thread with admin message submission form.
- **Pagination**: Server-side pagination controls.

## Components Used
- `src/components/report/ReportFilters.tsx` — Search and category/priority/status filter controls.
- `src/components/report/ReportTable.tsx` — Report listing table with pagination.
- `src/components/report/ReportDetailsModal.tsx` — Detail inspection, status update, and response thread modal.

## API Calls
- `getAdminReportsApi(params)` from `src/services/api/reportApi.ts` (`GET /api/reports/admin/all`).
- `getReportByIdApi(id)` from `src/services/api/reportApi.ts` (`GET /api/reports/:id`).
- `updateReportStatusApi(id, payload)` from `src/services/api/reportApi.ts` (`PUT /api/reports/:id/status`).
- `addReportResponseApi(id, payload)` from `src/services/api/reportApi.ts` (`POST /api/reports/:id/response`).

## Data Flow
```
Reports.tsx mounts -> Executes getAdminReportsApi()
                            │
                            ▼
Populates ReportTable.tsx -> User clicks "View Details"
                            │
                            ▼
Opens ReportDetailsModal.tsx -> Calls getReportByIdApi()
                            │
                            ▼
Super Admin updates status (updateReportStatusApi) or sends message (addReportResponseApi)
                            │
                            ▼
Modal updates state & triggers reload of main report list
```

## Important Role Rules
- Accessible exclusively by Super Admins. Route is protected and hidden from `condo_admin` navigation.

## Current Limitations
- None.
