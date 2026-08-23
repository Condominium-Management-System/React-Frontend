# Feature: User & Resident Management

## 1. Purpose
Provides dual-level user administration:
1. **Super Admin**: Master directory of all system accounts across roles (`super_admin`, `condo_admin`, `guard`, `resident`), account verification actions, role modifications, and deletions.
2. **Condo Admin**: Management of residents assigned to the specific condominium code, viewing block/room numbers, and tracking community circle enrollments (Equb/Iddir).

---

## 2. User & Access Level
- **Super Admin**: `/super-admin/users`
- **Condo Admin**: `/condo-admin/residents`

---

## 3. UI Overview
- **KPI Metrics**: Total Users, Verified, Pending, Admins / Equb / Iddir participants.
- **Search & Filters**: Text query filter and status dropdown (`ALL`, `VERIFIED`, `PENDING`).
- **User Roster Table**: Avatar, Full Name, Email, Phone Number, Role badge, Condo Code, Status chip, and action buttons.
- **Registration Modal**: Form dialog for new account creation.
- **Edit Modal**: Dialog to update contact info, role, and verification status.

---

## 4. Main Files Responsible
- **Pages**:
  - [`src/pages/super-admin/Users.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Users.jsx)
  - [`src/pages/condo-admin/Residents.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Residents.jsx)
- **Modals**:
  - [`src/components/user/RegisterUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/RegisterUserModal.jsx)
  - [`src/components/user/EditUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/EditUserModal.jsx)
- **Services**:
  - `api.users` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)
  - `userService` in [`src/services/crudService.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/services/crudService.js)

---

## 5. Important Operations
- `api.users.getAll()`: Fetches all system users.
- `api.users.verify(condoId, userId)`: Sets `isVerified = true`.
- `api.users.delete(condoId, userId)`: Deletes user record.
- `fetch('/api/auth/register')`: Creates new user account.
