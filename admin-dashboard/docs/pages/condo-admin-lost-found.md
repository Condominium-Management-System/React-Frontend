# Page: Condo Admin Lost & Found (`/condo-admin/lost-found`)

## 1. Purpose
Management of property lost and found items, recording found articles, matching claims, and completing handovers.

## 2. Route & Access
- Path: `/condo-admin/lost-found`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- Metrics cards (Total, Lost, Found, Open, Claimed).
- New item registration dialog.
- Claim verification dialog with claim notes and status updates.

## 4. API Calls
- `lostFoundService.getAll()` / `api.lostFound.getAll()`
- `lostFoundService.create(data)`
- `lostFoundService.verifyClaim(id)`

## 5. Important Files
- [`src/pages/condo-admin/LostFound.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/LostFound.jsx)
- [`src/services/lostFoundService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/lostFoundService.js)
