# Page: Super Admin Users (`/super-admin/users`)

## 1. Purpose
Master user directory for reviewing all system accounts, role assignments, verification statuses, and account creation.

## 2. Route & Access
- Path: `/super-admin/users`
- Access: `super_admin` Only
- Layout: `SuperAdminLayout`

## 3. Key Components
- 4 `StatsCard` filters (Total Users, Verified, Pending, Admins).
- Live keyword search bar.
- Material UI Table with role chips and action icons (`FaCheck`, `FaRegEdit`, `FaRegTrashAlt`).
- `RegisterUserModal` and `EditUserModal`.

## 4. State
- `users`: Array of user records.
- `loading`: Boolean.
- `searchTerm`: String.
- `filterType`: `'ALL' | 'VERIFIED' | 'PENDING' | 'ADMINS'`.
- `page`, `rowsPerPage`: Pagination numbers.
- `isRegisterModalOpen`: Boolean.
- `openEditModal`: Boolean.
- `selectedUser`: User object.

## 5. API Calls
- `api.users.getAll()`: `GET /admin/users`
- `api.users.verify(condoId, userId)`: `PATCH /admin/users/:condoId/:userId/verify`
- `api.users.delete(condoId, userId)`: `DELETE /users/:condoId/:userId`
- `fetch('/api/auth/register')`: (inside `RegisterUserModal`)

## 6. Important Files
- [`src/pages/super-admin/Users.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Users.jsx)
- [`src/components/user/RegisterUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/RegisterUserModal.jsx)
- [`src/components/user/EditUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/EditUserModal.jsx)
