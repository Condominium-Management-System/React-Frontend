# Page: Condo Admin Announcements (`/condo-admin/announcements`)

## 1. Purpose
Creating and publishing notices, maintenance warnings, and community announcements for residents of the assigned condominium.

## 2. Route & Access
- Path: `/condo-admin/announcements`
- Access: `condo_admin` Only
- Layout: `CondoAdminLayout`

## 3. Key Components
- Announcement statistics summary.
- Notice composer modal with category dropdown and pinning options.
- Paginated notice feed with expiry indicators.

## 4. API Calls
- `announcementService.getAll()` / `api.announcements.getAll()`
- `announcementService.create(data)`
- `announcementService.delete(id)`

## 5. Important Files
- `src/pages/condo-admin/Announcements.jsx`
- [`src/services/announcementService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/announcementService.js)
