# Feature: Business Promotions & Ad Management

## 1. Purpose
Allows Super Administrators to review commercial promotions submitted by local businesses, approve or reject advertisement campaigns, track click counts, and compute promotional ad revenue.

---

## 2. User & Access Level
- **Role**: `super_admin`
- **Route**: `/super-admin/promotions`

---

## 3. Main Files Responsible
- **Page**: [`src/pages/super-admin/Promotions.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Promotions.jsx)
- **Service**:
  - [`src/services/promotionService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/promotionService.js)
  - `api.promotions` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. Key Functions in `promotionService.js`
- `getAll(params)`: Retrieves list of promotions.
- `create(data)`: Supports `FormData` payloads for multi-part file banner uploads.
- `review(id, data)`: Submits approval or rejection decision with price rating.
- `getStats(promotions)`: Calculates `total`, `pending`, `approved`, `active`, `expired`, `rejected`, `cancelled`, and `totalRevenue`.
