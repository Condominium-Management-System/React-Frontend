# Page: Super Admin Condos (`/super-admin/condos`)

## 1. Purpose
Master directory and management dashboard for all condominiums in the HomeAxis platform.

## 2. Route & Access
- Path: `/super-admin/condos`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- 4 `StatsCard` filters (Total, Active, Inactive, Total Admins).
- Search input with adornment.
- `StyledTableContainer` with paginated condo records.
- Create/Edit Condominium `Dialog`.

## 4. State
- `condos`: Array of condo objects.
- `loading`: Boolean.
- `searchTerm`: String.
- `filterType`: `'ALL' | 'ACTIVE' | 'INACTIVE'`.
- `page`, `rowsPerPage`: Pagination numbers.
- `openDialog`: Boolean modal state.
- `editingCondo`: Condo object or null.
- `formData`: `{ condoName, address, city, maxAdmins, blockNumbers }`.

## 5. API Calls
- `api.condos.getAll()`: `GET /condos`
- `api.condos.create(formData)`: `POST /condos`
- `api.condos.update(id, formData)`: `PATCH /condos/:id`
- `api.condos.toggleStatus(id)`: `PATCH /condos/:id/status`
- `api.condos.delete(id)`: `DELETE /condos/:id`

## 6. Important Files
- [`src/pages/super-admin/Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx)
