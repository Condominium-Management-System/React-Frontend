# Page: Condo Admin Residents (`/condo-admin/residents`)

## 1. Purpose
Local resident roster management for the assigned property, enabling block/room lookup, verification status filtering, and participation tracking in Equb and Iddir programs.

## 2. Route & Access
- Path: `/condo-admin/residents`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- 5 `StatsCard` metric summaries (Total, Verified, Pending, In Equb, In Iddir).
- Search bar and status dropdown (`ALL`, `VERIFIED`, `PENDING`).
- `StyledTableContainer` showing Resident info, contact, Block/Room, Status, Equb chip, Iddir chip, and Actions (View Details, Edit, Delete).
- "Register Resident" action modal and Resident Details dialog.

## 4. State
- `residents`: Array of resident objects.
- `searchTerm`: String.
- `filterStatus`: `'ALL' | 'VERIFIED' | 'PENDING'`.
- `page`, `rowsPerPage`: Pagination parameters.
- `openRegisterModal`, `openDetailModal`: Boolean dialog states.
- `selectedResident`: Active resident object.

## 5. Important Files
- [`src/pages/condo-admin/Residents.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Residents.jsx)
