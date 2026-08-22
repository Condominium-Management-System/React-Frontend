# Role-Based Access Control (RBAC)

The HomeAxis Admin Console enforces Role-Based Access Control (RBAC) to ensure security and proper scoping across system operations.

## Supported System Roles

| Role Key | Name | Access Level | Description |
|:---|:---|:---|:---|
| `super_admin` | System Super Admin | System-Wide | Full administrative access to all condominiums, system users, global payments, and property settings. |
| `condo_admin` | Condo Admin | Condominium-Scoped | Restricted to managing users, blocks, rooms, and payments within their assigned `condoId`. |
| `resident` | Resident / User | Mobile Only | Non-administrative role. Explicitly blocked from accessing the web admin console. |

---

## Access & Permissions Matrix

| Route / Module | Super Admin | Condo Admin | Resident | Scoping Mechanism |
|:---|:---:|:---:|:---:|:---|
| `/login` | ✅ | ✅ | ❌ Blocked | Redirects to `/dashboard` if authenticated. |
| `/dashboard` | ✅ | ✅ | ❌ Blocked | Super Admin views system-wide data; Condo Admin views condo data. |
| `/condos` | ✅ | ❌ Blocked | ❌ Blocked | Guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`. |
| `/users` | ✅ | ✅ | ❌ Blocked | Super Admin: `/api/admin/users`; Condo Admin: `/api/users/:condoId`. |
| `/payments` | ✅ | ✅ | ❌ Blocked | Super Admin has condo selector filter; Condo Admin scoped to condo. |
| `/blocks-rooms` | ✅ | ✅ | ❌ Blocked | Super Admin selects target condo; Condo Admin uses assigned condo. |
| `/profile` | ✅ | ✅ | ❌ Blocked | Views and updates own profile details (`/api/auth/me`). |

---

## Implementation Details

### 1. Role Helpers (`src/utils/roleHelpers.ts`)
Provides central helper functions for role evaluation:
- `isSuperAdmin(role)`: Returns `true` if `role === 'super_admin'`.
- `isCondoAdmin(role)`: Returns `true` if `role === 'condo_admin'`.
- `canAccessWebConsole(role)`: Returns `true` if `role` is `super_admin` or `condo_admin`.

### 2. Guarded Route Component (`src/components/auth/ProtectedRoute.tsx`)
- Checks `canAccessWebConsole(user.role)`. If `false` (e.g. `resident`), renders an **Access Denied** message banner with a button to return to login.
- Checks `allowedRoles` prop. If route specifies `allowedRoles={['super_admin']}` and user is not a super admin, redirects to `/dashboard`.

### 3. Navigation Sidebar Filtering (`src/components/layout/Sidebar.tsx`)
- Sidebar filters navigation links using `item.superAdminOnly`.
- Link to **Condo Management** (`/condos`) is automatically hidden for Condo Admins.

### 4. API Endpoint Scoping (`src/services/api/userApi.ts`)
- In `getUsersApi(condoId)`:
  - If role is `condo_admin`, endpoint is forced to `/api/users/${userCondoId}`.
  - If role is `super_admin`, endpoint defaults to `/api/admin/users` unless a specific `condoId` filter parameter is passed.
