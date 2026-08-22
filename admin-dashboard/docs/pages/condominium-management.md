# Condominium Management Page

## Purpose
Enables Super Administrators to manage condominiums in the system (create new condos, update details, search by city, and soft-delete properties).

## Route
`/condos`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Condominium Listing Table**: Displays condo name, code, city, address, block count, max admins limit, and active status tags.
- **Search & City Filter**: Search input bar and dynamic city filter dropdown.
- **Register Condo Modal**: Modal form to add a new condominium with condo code, name, address, city, max admin limit, and block numbers.
- **Edit Condo Modal**: Modal form to update condo details.
- **Delete Condo Modal**: Confirmation modal for condo soft deletion.
- **Pagination**: Table pagination controls.

## Components Used
- `src/components/condo/CondoFilters.tsx` — Search and city filter.
- `src/components/condo/CondoTable.tsx` — Condominium list table.
- `src/components/condo/RegisterCondoModal.tsx` — Registration modal.
- `src/components/condo/EditCondoModal.tsx` — Update modal.
- `src/components/condo/DeleteCondoModal.tsx` — Delete confirmation modal.

## API Calls
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).
- `createCondoApi(payload)` from `src/services/api/condoApi.ts` (`POST /api/condos`).
- `updateCondoApi(id, payload)` from `src/services/api/condoApi.ts` (`PATCH /api/condos/:id`).
- `deleteCondoApi(id)` from `src/services/api/condoApi.ts` (`DELETE /api/condos/:id`).

## Data Flow
```
CondoManagement.tsx mounts
            │
            ▼
Executes getCondosApi() -> Stores condo list in state
            │
            ▼
Passes condo data & city options to CondoFilters and CondoTable
            │
            ▼
User opens modal & submits (Register / Edit / Delete)
            │
            ▼
Modal calls domain API -> On success, triggers parent reloadData()
```

## Important Role Rules
- Accessible exclusively by Super Admins. Access attempts by Condo Admins trigger an automatic route redirect to `/dashboard`.

## Current Limitations
- None.
