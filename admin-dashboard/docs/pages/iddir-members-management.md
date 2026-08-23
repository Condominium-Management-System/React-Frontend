# Iddir Members Management Page

## Purpose
Enables Super Administrators to manage resident memberships across community Iddir funds, filter members by condominium or status, and register resident users into active Iddir funds.

## Route
`/iddir-members`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Iddir Member Directory Table**: Displays member full name, contact info (email/phone), condominium & assigned unit (block/room), assigned Iddir fund name, joined date, membership status badge (`active`, `inactive`, `suspended`), and **Actions Column** (Edit Status, Remove Member).
- **Multi-Criteria Search & Filter**: Text search bar (by name, email, phone, or Iddir fund), status filter dropdown (`active`, `inactive`, `suspended`), and condominium selector dropdown.
- **Register Member Modal**: Modal form allowing Super Admin to select a condominium, pick an active Iddir fund, pick an eligible resident user, and register them into the Iddir (`POST /api/iddir-members`).
- **Edit Member Modal**: Form modal allowing Super Admin to update a member's status (`active`, `inactive`, `suspended`) via `updateIddirMemberApi`.
- **Remove Member Confirmation**: Confirmation dialog allowing Super Admin to safely remove a member (`deleteIddirMemberApi`), which sets their status to inactive and updates member counts without deleting the Iddir.
- **Pagination**: Server-side client pagination controls.

## Components Used
- `src/components/iddir/IddirMemberTable.tsx` — Member directory table with pagination, status badges, and Edit/Remove action buttons.
- `src/components/iddir/RegisterIddirMemberModal.tsx` — Form modal for enrolling residents into Iddir funds.
- `src/components/iddir/EditIddirMemberModal.tsx` — Form modal for updating member status.
- `src/components/iddir/DeleteIddirMemberModal.tsx` — Confirmation dialog for removing a member.

## API Calls
- `getIddirMembersApi(condoId)` from `src/services/api/iddirApi.ts` (`GET /api/iddir-members` or `GET /api/iddir-members/:condoId`).
- `addIddirMemberApi(payload)` from `src/services/api/iddirApi.ts` (`POST /api/iddir-members`).
- `updateIddirMemberApi(condoId, memberId, payload)` from `src/services/api/iddirApi.ts` (`PATCH /api/iddir-members/:condoId/:id` or `PATCH /api/iddir-members/:id`).
- `deleteIddirMemberApi(condoId, memberId)` from `src/services/api/iddirApi.ts` (`DELETE /api/iddir-members/:condoId/:id` or `DELETE /api/iddir-members/:id`).
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
