# Page: Super Admin Announcements (`/super-admin/announcements`)

## 1. Purpose
Publishing and managing platform-wide notices, policy updates, and emergency broadcasts.

## 2. Route & Access
- Path: `/super-admin/announcements`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- Summary cards (Total, Pinned, Active, Expired).
- Type filter chips (`general`, `emergency`, `event`, `celebration`, `mourning`).
- Broadcast creation dialog.

## 4. API Calls
- `announcementService.getAll()` / `api.announcements.getAll()`
- `announcementService.create(data)`
- `announcementService.delete(id)`

## 5. Important Files
- `src/pages/super-admin/Announcements.jsx`
- [`src/services/announcementService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/announcementService.js)
