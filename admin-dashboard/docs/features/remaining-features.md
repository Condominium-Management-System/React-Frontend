# Remaining & Missing Features

This document accurately catalogs features that are currently **missing**, **partially implemented**, or **planned for future development** based strictly on inspection of the current `admin-dashboard` frontend codebase.

---

## Missing Features (Not Implemented in Admin Console)

| Feature | Status | Details |
|:---|:---:|:---|
| **Maintenance Report Administration Page** | ❌ Missing | While backend API endpoints and TypeScript interfaces (`Report`) exist, there is currently no maintenance management page or UI components in the admin console. |
| **Equb Direct Administration Module** | ❌ Missing | Equb group creation, round management, and payout logging screens do not exist in the admin console (metrics are only summarized on the Dashboard). |
| **Iddir Direct Administration Module** | ❌ Missing | Iddir membership administration and claim handling screens do not exist in the admin console (metrics are only summarized on the Dashboard). |
| **Lost & Found Administration Module** | ❌ Missing | No UI components exist in the admin console for logging or resolving lost and found items. |
| **Broadcast Announcements Module** | ❌ Missing | No UI components exist in the admin console for creating or broadcasting announcements to residents. |

---

## Partial Features (UI Components Present but Visual / Static)

| Feature | Status | Details |
|:---|:---:|:---|
| **Header Search Field** | 🟡 Partial | The search bar input inside `Header.tsx` is currently marked `readOnly` and serves as a visual placeholder. |
| **Header Notifications Bell** | 🟡 Partial | The notification bell icon in `Header.tsx` displays a static dot indicator; live notification feeds are not connected to a backend endpoint. |

---

## Verification Criteria
- All features marked **Implemented** in `implemented-features.md` have been verified against active page components, routes, and domain API service files.
- Features listed as **Missing** above do not have active page coordinators, route entries, or sidebar navigation links in the current frontend repository.
