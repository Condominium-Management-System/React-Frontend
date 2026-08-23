# Page: Super Admin Payments (`/super-admin/payments`)

## 1. Purpose
Financial overview and payment slip auditing across all condominiums in the platform.

## 2. Route & Access
- Path: `/super-admin/payments`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- Financial KPI Stats Cards (Total Volume, Approved, Pending, Rejected).
- Multi-parameter filter row.
- Transaction records table.
- Payment slip review dialog with Approve & Reject action triggers.

## 4. API Calls
- `api.payments.getStatistics()`: `GET /payments/statistics`
- `api.payments.getAll(params)`: `GET /payments`
- `api.payments.approve(id, data)`: `PATCH /payments/:id/approve`
- `api.payments.reject(id, data)`: `PATCH /payments/:id/reject`

## 5. Important Files
- `src/pages/super-admin/Payments.jsx`
- [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
