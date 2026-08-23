# Feature: Lost & Found Management

## 1. Purpose
Provides a digital community lost and found registry where Condo Administrators can catalog lost or found items, log descriptions/locations, process resident claims, and verify returned items.

---

## 2. User & Access Level
- **Role**: `condo_admin`
- **Route**: `/condo-admin/lost-found`

---

## 3. Main Files Responsible
- **Page**: [`src/pages/condo-admin/LostFound.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/LostFound.jsx)
- **Service**:
  - [`src/services/lostFoundService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/lostFoundService.js)
  - `api.lostFound` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. Key Functions in `lostFoundService.js`
- `getAll(params)`: Retrieves items list.
- `create(data)`: Registers a new item with `type` (`lost` vs `found`), title, location, and description.
- `claim(id, data)`: Registers a resident claim request.
- `verifyClaim(id)`: Marks the item claim as verified and updates item status to `claimed`.
- `getStats(items)`: Calculates `total`, `lost`, `found`, `open`, `matched`, `claimed`, and `archived` counts.
