# Iddir Members Management Page

## Purpose
Enables Super Administrators to manage resident memberships across community Iddir funds, filter members by condominium or status, and register resident users into active Iddir funds.

## Route
`/iddir-members`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Iddir Member Directory Table**: Displays member full name, contact info (email/phone), condominium & assigned unit (block/room), assigned Iddir fund name, joined date, and membership status badge (`active`, `inactive`, `suspended`).
- **Multi-Criteria Search & Filter**: Text search bar (by name, email, phone, or Iddir fund), status filter dropdown (`active`, `inactive`, `suspended`), and condominium selector dropdown.
- **Register Member Modal**: Modal form allowing Super Admin to select a condominium, pick an active Iddir fund, pick an eligible resident user, and register them into the Iddir (`POST /api/iddir-members`).
- **Pagination**: Server-side client pagination controls.

## Components Used
- `src/components/iddir/IddirMemberTable.tsx` — Member directory table with pagination and status badges.
- `src/components/iddir/RegisterIddirMemberModal.tsx` — Form modal for enrolling residents into Iddir funds.

## API Calls
- `getIddirMembersApi(condoId)` from `src/services/api/iddirApi.ts` (`GET /api/iddir-members` or `GET /api/iddir-members/:condoId`).
- `addIddirMemberApi(payload)` from `src/services/api/iddirApi.ts` (`POST /api/iddir-members`).
- `getIddirsApi(condoId)` from `src/services/api/iddirApi.ts` (`GET /api/iddirs/:condoId/iddirs`).
- `getUsersApi(condoId)` from `src/services/api/userApi.ts` (`GET /api/users/:condoId`).
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).

## Data Flow
```
IddirMembersManagement.tsx mounts -> Calls getCondosApi() & getIddirMembersApi()
                                            │
                                            ▼
Populates IddirMemberTable.tsx -> Super Admin clicks "Add Member"
                                            │
                                            ▼
Opens RegisterIddirMemberModal.tsx -> Loads active Iddirs & resident users for chosen condo
                                            │
                                            ▼
Executes addIddirMemberApi -> Refetches member list & updates UI
```

## Important Role Rules
- Accessible exclusively by Super Admins. Route is protected and hidden from `condo_admin` navigation.

## Current Limitations
- None.
