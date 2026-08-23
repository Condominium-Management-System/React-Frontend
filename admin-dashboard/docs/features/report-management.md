# Feature: Maintenance Reports & Ticketing

## 1. Purpose
Provides a ticketing system for tracking, assigning, updating, and responding to maintenance issues filed by residents (e.g. plumbing, electrical, structural, elevator, security).

---

## 2. User & Access Level
- **Super Admin**: `/super-admin/reports` (System-wide ticket oversight).
- **Condo Admin**: `/condo-admin/reports` (Local property maintenance operations).

---

## 3. Main Files Responsible
- **Pages**:
  - `src/pages/super-admin/Reports.jsx`
  - `src/pages/condo-admin/Reports.jsx`
- **Service**:
  - [`src/services/reportService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/reportService.js)
  - `api.reports` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. Key Workflows & Operations
- `api.reports.getAdminAll(params)`: Retrieves paginated maintenance tickets with category and status filters.
- `api.reports.updateStatus(id, { status })`: Updates ticket status (`pending`, `in_progress`, `resolved`, `rejected`).
- `api.reports.assign(id, { assignedTo })`: Assigns a technician or administrator to the ticket.
- `api.reports.addResponse(id, { message })`: Appends an administrative reply to the resident's conversation thread.
