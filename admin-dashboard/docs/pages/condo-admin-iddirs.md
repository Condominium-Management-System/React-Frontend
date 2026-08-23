# Page: Condo Admin Iddirs (`/condo-admin/iddirs`)

## 1. Purpose
Management of mutual aid and bereavement funds (Iddirs) established for the residents of the condominium.

## 2. Route & Access
- Path: `/condo-admin/iddirs`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- Community Iddir fund directory with monthly contribution rates and member lists.
- Create/Edit Iddir dialog.
- Member enrollment and status verification roster.

## 4. API Calls
- `api.iddirs.getAll(condoId)`: `GET /iddirs/:condoId/iddirs`
- `api.iddirs.create(condoId, data)`: `POST /iddirs/:condoId/iddirs`
- `api.iddirs.update(condoId, id, data)`: `PATCH /iddirs/:condoId/iddirs/:id`
- `api.iddirs.delete(condoId, id)`: `DELETE /iddirs/:condoId/iddirs/:id`

## 5. Important Files
- `src/pages/condo-admin/IddirManagement.jsx`
- [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
