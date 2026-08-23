# Known Issues & Codebase Clarifications

This document catalogs code nuances, empty placeholder files, mock data fallbacks, and inconsistencies discovered during the static code audit of the React frontend.

---

## 1. Empty Placeholder Files

The following three files in [`src/components/common/`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/) exist in the repository but have 0 bytes (empty content):

1. `DataTable.jsx` (0 bytes)
2. `Header.jsx` (0 bytes)
3. `StatusBadge.jsx` (0 bytes)

*Finding*: Pages build their own custom styled tables, headers, and status chips directly using Material UI and Emotion rather than importing these placeholder files.

---

## 2. Mock Data Fallbacks in Select Pages

Certain pages contain embedded mock data fallback mechanisms:

1. [`src/pages/super-admin/EqubIddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/EqubIddirManagement.jsx#L120) — Currently uses an internal `MOCK_CONDO_EQUBS` array with an 800ms artificial delay rather than directly calling `api.equbs.getAll()`.
2. [`src/pages/condo-admin/Residents.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Residents.jsx#L148) — Uses `MOCK_RESIDENTS` data for demonstration.
3. [`src/pages/condo-admin/Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Dashboard.jsx#L76) — Contains `MOCK_STATS` as a fallback if the live API calls fail.

---

## 3. Direct `fetch` vs Axios Inconsistency

While the vast majority of API calls use `api.*` from [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js), two user modal components invoke native browser `fetch` directly:
- [`src/components/user/RegisterUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/RegisterUserModal.jsx#L80) — Calls `fetch('https://backend-a3xi.onrender.com/api/auth/register', ...)`.
- [`src/components/user/EditUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/EditUserModal.jsx#L75) — Calls `fetch('https://backend-a3xi.onrender.com/api/users/${user.condoId}/${user.id}', ...)`.

---

## 4. Hardcoded API Base URLs

- `src/api/axiosConfig.js` sets `const API_URL = 'https://backend-a3xi.onrender.com/api'`.
- It does not read `process.env.REACT_APP_API_URL` dynamically. To change API targets for local development, `API_URL` in `axiosConfig.js` must be updated or refactored to read `process.env.REACT_APP_API_URL || 'https://backend-a3xi.onrender.com/api'`.
