# User Management Page

## Purpose
Provides user account administration tools to register users, filter account lists, update user details and system roles, and delete user accounts.

## Route
`/users`

## Who Can Access It
- `super_admin`
- `condo_admin`

## Main Features
- **User Listing Table**: Displays user full name, email, phone number, FAN ID, role tag (`super_admin`, `condo_admin`, `resident`), condo code, and verification tag.
- **Filtering & Search**: Search bar, role filter dropdown, and verification status dropdown.
- **Register User Modal**: Form modal to register a new user account.
- **Edit User Modal**: Form modal to modify personal info and assign/change system roles.
- **Delete User Modal**: Confirmation dialog to delete a user.
- **Pagination**: Paginated user table rendering.

## Components Used
- `src/components/user/UserFilters.tsx` — Search bar and dropdown filters.
- `src/components/user/UserTable.tsx` — User list table.
- `src/components/user/RegisterUserModal.tsx` — User registration modal.
- `src/components/user/EditUserModal.tsx` — User update modal.
- `src/components/user/DeleteUserModal.tsx` — User deletion modal.

## API Calls
- `getUsersApi(condoId)` from `src/services/api/userApi.ts` (`GET /api/admin/users` or `GET /api/users/:condoId`).
- `createUserApi(payload)` from `src/services/api/userApi.ts` (`POST /api/auth/register`).
- `updateUserApi(condoId, userId, payload)` from `src/services/api/userApi.ts` (`PATCH /api/users/:condoId/:userId`).
- `updateUserRoleApi(condoId, userId, role)` from `src/services/api/userApi.ts` (`PATCH /api/users/:condoId/:userId/role`).
- `deleteUserApi(condoId, userId)` from `src/services/api/userApi.ts` (`DELETE /api/users/:condoId/:userId`).

## Data Flow
```
UserManagement.tsx mounts -> Evaluates user role & assigned condoId
                               │
                               ▼
Calls getUsersApi() -> Endpoint selected based on role
                               │
                               ▼
Backend returns user list -> State updated
                               │
                               ▼
Rendered in UserTable.tsx -> User triggers action (Edit/Role Change/Delete)
                               │
                               ▼
Modal executes userApi call -> Reloads user list upon success
```

## Important Role Rules
- **Super Admin**: Fetches system-wide user directory by default (`/api/admin/users`).
- **Condo Admin**: Automatically restricted to fetching users within their assigned condo scope (`/api/users/${userCondoId}`).

## Current Limitations
- Registering a user requires specifying a `condoCode`.
