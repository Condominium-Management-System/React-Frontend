# Feature: Announcements & Broadcasts

## 1. Purpose
Enables administrators to broadcast emergency notices, general announcements, community events, celebration notices, and mourning messages to residents with priority pinning and expiration dates.

---

## 2. User & Access Level
- **Super Admin**: `/super-admin/announcements`
- **Condo Admin**: `/condo-admin/announcements`

---

## 3. Main Files Responsible
- **Pages**:
  - `src/pages/super-admin/Announcements.jsx`
  - `src/pages/condo-admin/Announcements.jsx`
- **Service**:
  - [`src/services/announcementService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/announcementService.js)
  - `api.announcements` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 4. Key Functions in `announcementService.js`
- `getAll(params)`: Sanitizes query params and fetches announcements list.
- `create(data)`: Publishes announcement with title, content, type (`general`, `emergency`, `event`, `celebration`, `mourning`), and `isPinned` flag.
- `update(id, data)` / `delete(id)`: Modifies or removes notices.
- `getStats(announcements)`: In-memory aggregator computing `total`, `pinned`, `active`, `expired`, and counts grouped by announcement type.
