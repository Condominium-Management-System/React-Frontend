# Iddir Management Page

## Purpose
Enables Super Administrators to manage community Iddir funds, create new Iddirs for condominiums, and inspect Iddir member directories and monthly contribution amounts.

## Route
`/iddirs`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Iddir Directory Table**: Displays Iddir name, assigned condominium, started date, monthly contribution amount (ETB), member count (`_count.members`), status badge (`active`, `inactive`), creator admin details, and **Actions Column** (Edit, Delete).
- **Search & Filtering**: Search bar by Iddir name, condominium, or creator admin, plus status filter dropdown (`active`, `inactive`) and condominium filter selector.
- **Add Iddir Modal**: Modal form allowing Super Admin to create a new Iddir by selecting a condominium, specifying the Iddir name, started date, and monthly contribution amount.
- **Edit Iddir Modal**: Pre-filled modal form allowing Super Admin to update Iddir name, started date, monthly contribution amount, and active/inactive status.
- **Delete Iddir Confirmation**: Dialog warning that deleting an Iddir will automatically remove all associated resident members in a safe transaction (`deleteIddirApi`).
- **Pagination**: Server-side client pagination controls.

## Components Used
- `src/components/iddir/IddirTable.tsx` — Iddir records table with pagination and Edit/Delete action buttons.
- `src/components/iddir/CreateIddirModal.tsx` — Form modal for registering new Iddirs.
- `src/components/iddir/EditIddirModal.tsx` — Pre-filled form modal for updating existing Iddirs.
- `src/components/iddir/DeleteIddirModal.tsx` — Confirmation dialog for deleting Iddirs and cascading member removals.

## API Calls
- `getIddirsApi(condoId)` from `src/services/api/iddirApi.ts` (`GET /api/iddirs` or `GET /api/iddirs/:condoId/iddirs`).
- `createIddirApi(condoId, payload)` from `src/services/api/iddirApi.ts` (`POST /api/iddirs/:condoId/iddirs`).
- `updateIddirApi(condoId, iddirId, payload)` from `src/services/api/iddirApi.ts` (`PATCH /api/iddirs/:condoId/iddirs/:iddirId`).
- `deleteIddirApi(condoId, iddirId)` from `src/services/api/iddirApi.ts` (`DELETE /api/iddirs/:condoId/iddirs/:iddirId`).
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).

## Cascade Deletion Behavior
When an Iddir is deleted via `deleteIddirApi`:
1. The backend service (`deleteIddirService` in `backend/services/iddir.service.js`) initiates a database transaction (`prisma.$transaction`).
2. All `IddirMember` records associated with that `iddirId` are deleted.
3. Affected users' `isInIddir` flags are re-evaluated and updated automatically.
4. The `Iddir` is marked as deleted (`deletedAt = now()`, `status = inactive`, `noMembers = 0`).

## Important Role Rules
- Accessible exclusively by Super Admins. Route is protected and hidden from `condo_admin` navigation.
