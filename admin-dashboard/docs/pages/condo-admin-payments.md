# Page: Condo Admin Payments (`/condo-admin/payments`)

## 1. Purpose
Reviewing, verifying, approving, and rejecting resident dues and maintenance payments for the assigned condominium.

## 2. Route & Access
- Path: `/condo-admin/payments`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components & Operations
- Local payment statistics cards.
- Payment table filtered by status, billing type, and method.
- Payment slip review dialog with approve/reject actions.

## 4. API Calls
- `api.payments.getAll(params)`
- `api.payments.approve(id, data)`
- `api.payments.reject(id, data)`

## 5. Important Files
- `src/pages/condo-admin/Payments.jsx`
- [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
