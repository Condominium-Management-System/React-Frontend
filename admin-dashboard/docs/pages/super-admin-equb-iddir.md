# Page: Super Admin Equb & Iddir (`/super-admin/equb-iddir`)

## 1. Purpose
Provides a consolidated overview of community financial funds (Equbs) and mutual aid organizations (Iddirs) across all registered properties.

## 2. Route & Access
- Path: `/super-admin/equb-iddir`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- 5 Metric Cards (Total Equbs, Total Iddirs, Total Members, Total Amount ETB, Active Funds).
- Search input by condominium name or code.
- Property Cards listing nested Equbs and Iddirs with contribution rates and member counts.
- Details Modal with Equb/Iddir tabbed views.

## 4. State & Data
- `condoData`: Array of condominiums containing nested `equbs` and `iddirs` arrays.
- `selectedItem`: Selected condominium for detail modal.
- `detailTab`: Active tab index (`0` for Equbs, `1` for Iddirs).

## 5. Important Files
- [`src/pages/super-admin/EqubIddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/EqubIddirManagement.jsx)
