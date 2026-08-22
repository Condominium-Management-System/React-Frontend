# Report API (`reportApi.ts`)

File Path: `src/services/api/reportApi.ts`

Handles maintenance report querying, report details retrieval, status updates, and response submissions.

---

## Functions

### 1. `getAdminReportsApi(params)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/reports/admin/all?<queryString>`
- **Purpose**: Fetches maintenance reports for admin inspection with search, category, priority, status, and pagination filters.
- **Parameters**: `ReportsQueryParams` (`page`, `limit`, `search`, `status`, `category`, `priority`).
- **Response**: `{ reports: Report[]; total: number; page: number; totalPages: number }`.
- **Used By**: `src/pages/Reports/Reports.tsx`.

### 2. `getReportByIdApi(id)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/reports/:id`
- **Purpose**: Fetches complete report details including reporter information and responses.
- **Parameters**: `id: string`.
- **Response**: `Report` object.
- **Used By**: `src/components/report/ReportDetailsModal.tsx`.

### 3. `updateReportStatusApi(id, payload)`
- **HTTP Method**: `PUT`
- **Endpoint**: `/api/reports/:id/status`
- **Purpose**: Updates report status (`reported`, `assigned`, `in_progress`, `resolved`, `closed`) and optional resolution notes.
- **Request Body**: `UpdateReportStatusPayload` (`status`, `resolutionNotes`).
- **Response**: Updated `Report` object.
- **Used By**: `src/components/report/ReportDetailsModal.tsx`.

### 4. `addReportResponseApi(id, payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/reports/:id/response`
- **Purpose**: Submits an admin message response to a report thread.
- **Request Body**: `AddReportResponsePayload` (`message`, `isAdminResponse`).
- **Response**: `ReportResponse` object.
- **Used By**: `src/components/report/ReportDetailsModal.tsx`.
