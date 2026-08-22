# User API (`userApi.ts`)

File Path: `src/services/api/userApi.ts`

Handles user listing, account creation, details update, role assignment, and user deletion.

---

## Functions

### 1. `getUsersApi(condoId?)`
- **HTTP Method**: `GET`
- **Endpoint**:
  - `super_admin` (no condo filter): `/api/admin/users`
  - `super_admin` (with condo filter): `/api/users/:condoId`
  - `condo_admin`: `/api/users/:userCondoId`
- **Purpose**: Fetches user accounts directory.
- **Parameters**: `condoId?: string`.
- **Response**: Array of `User` objects.
- **Used By**: `src/pages/UserManagement/UserManagement.tsx`.

### 2. `createUserApi(payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Purpose**: Registers a new user account in the system.
- **Request Body**: `CreateUserPayload` (`fullName`, `email`, `password`, `phoneNumber`, `fan`, `condoCode`).
- **Response**: Created `User` object.
- **Used By**: `src/components/user/RegisterUserModal.tsx`.

### 3. `updateUserApi(condoId, userId, payload)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/users/:condoId/:userId`
- **Purpose**: Updates personal details of a user.
- **Request Body**: `UpdateUserPayload` (`fullName`, `email`, `phoneNumber`, `fan`, `block`, `roomNo`, `isVerified`).
- **Response**: Updated `User` object.
- **Used By**: `src/components/user/EditUserModal.tsx`.

### 4. `updateUserRoleApi(condoId, userId, role)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/users/:condoId/:userId/role`
- **Purpose**: Modifies assigned role of a user (`super_admin`, `condo_admin`, `resident`).
- **Request Body**: `{ role: string }`.
- **Response**: Updated `User` object.
- **Used By**: `src/components/user/EditUserModal.tsx`.

### 5. `deleteUserApi(condoId, userId)`
- **HTTP Method**: `DELETE`
- **Endpoint**: `/api/users/:condoId/:userId`
- **Purpose**: Deletes a user account.
- **Used By**: `src/components/user/DeleteUserModal.tsx`.
