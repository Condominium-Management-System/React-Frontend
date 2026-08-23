# Page: Super Admin Promotions (`/super-admin/promotions`)

## 1. Purpose
Management of business advertisements and promotional campaigns displayed across the platform.

## 2. Route & Access
- Path: `/super-admin/promotions`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- Revenue & Campaign Stats cards (`Total Revenue`, `Active`, `Pending`, `Approved`).
- Promotion review dialog with pricing inputs and approval/rejection controls.

## 4. API Calls
- `promotionService.getAll()` / `api.promotions.getAll()`
- `promotionService.review(id, { status, price })`
- `promotionService.delete(id)`

## 5. Important Files
- `src/pages/super-admin/Promotions.jsx`
- [`src/services/promotionService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/promotionService.js)
