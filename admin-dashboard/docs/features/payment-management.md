# Feature: Payment Tracking & Verification

## 1. Purpose
Enables administrators to audit incoming resident payments (service charges, water/utility dues, Equb contributions, Iddir fees), inspect payment method details (CBE Birr, Telebirr, Bank Transfer, Cash), view transaction reference codes, and approve or reject submissions.

---

## 2. User & Access Level
- **Super Admin**: `/super-admin/payments` (Global revenue and transactions).
- **Condo Admin**: `/condo-admin/payments` (Property-specific resident payments).

---

## 3. Main Files Responsible
- **Pages**:
  - `src/pages/super-admin/Payments.jsx`
  - `src/pages/condo-admin/Payments.jsx`
- **API Client**: `api.payments` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. How It Works
1. Page loads payment statistics (`api.payments.getStatistics()`) and payment records (`api.payments.getAll()`).
2. Displays KPI metrics (Total Volume, Pending Approvals, Approved Payments, Rejected).
3. Table lists Resident, Payment Type, Amount (ETB), Method, Date, Reference Number, and Status.
4. Administrator reviews slip and clicks **Approve** (`api.payments.approve(id)`) or **Reject** (`api.payments.reject(id)`).
5. Post-mutation, toast alert fires and payment list reloads.
