# Feature: Equb & Iddir Community Funds

## 1. Purpose
Manages traditional Ethiopian financial and social mutual-aid structures within the condominium system:
1. **Equb (Rotating Savings & Credit Association)**: Tracks regular financial contributions, rounds, member lists, and rotational payouts (`isGetEqub`).
2. **Iddir (Community Mutual Aid & Bereavement Fund)**: Tracks monthly contributions, emergency/bereavement funds, and active membership rosters.

---

## 2. User & Access Level
- **Super Admin**: `/super-admin/equb-iddir` (System-wide overview across all condominiums).
- **Condo Admin**:
  - `/condo-admin/equbs` (Local Equb circle creation & management).
  - `/condo-admin/iddirs` (Local Iddir fund creation & management).

---

## 3. Main Files Responsible
- **Pages**:
  - [`src/pages/super-admin/EqubIddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/EqubIddirManagement.jsx)
  - [`src/pages/condo-admin/EqubManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/EqubManagement.jsx)
  - [`src/pages/condo-admin/IddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/IddirManagement.jsx)
- **API Client**: `api.equbs` and `api.iddirs` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. Key Endpoints & Data Model
- `api.equbs.getAll(condoId)`: `GET /equbs/:condoId/equbs`
- `api.equbs.create(condoId, data)`: `POST /equbs/:condoId/equbs`
- `api.iddirs.getAll(condoId)`: `GET /iddirs/:condoId/iddirs`
- `api.iddirs.create(condoId, data)`: `POST /iddirs/:condoId/iddirs`
