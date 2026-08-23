# Page: Condo Admin Equbs (`/condo-admin/equbs`)

## 1. Purpose
Management of rotating savings and credit groups (Equbs) within the local condominium community.

## 2. Route & Access
- Path: `/condo-admin/equbs`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- Equb circles directory with contribution amounts, cycle durations, and member counts.
- Create Equb dialog collecting name, contribution amount, cycle frequency, and start/due dates.
- Member participation roster.

## 4. API Calls
- `api.equbs.getAll(condoId)`: `GET /equbs/:condoId/equbs`
- `api.equbs.create(condoId, data)`: `POST /equbs/:condoId/equbs`
- `api.equbs.update(condoId, id, data)`: `PATCH /equbs/:condoId/equbs/:id`
- `api.equbs.delete(condoId, id)`: `DELETE /equbs/:condoId/equbs/:id`

## 5. Important Files
- `src/pages/condo-admin/EqubManagement.jsx`
- [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
