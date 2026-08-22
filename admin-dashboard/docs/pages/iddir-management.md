# Iddir Management Page

## Purpose
Enables Super Administrators to manage community Iddir funds, create new Iddirs for condominiums, and inspect Iddir member directories and monthly contribution amounts.

## Route
`/iddirs`

## Who Can Access It
- `super_admin` only (guarded by `<ProtectedRoute allowedRoles={['super_admin']} />`).

## Main Features
- **Iddir Directory Table**: Displays Iddir name, assigned condominium, started date, monthly contribution amount (ETB), member count (`_count.members`), status badge (`active`, `inactive`), and creator admin details.
- **Search & Filtering**: Search bar by Iddir name, condominium, or creator admin, plus status filter dropdown (`active`, `inactive`) and condominium filter selector.
- **Add Iddir Modal**: Modal form allowing Super Admin to create a new Iddir by selecting a condominium, specifying the Iddir name, started date, and monthly contribution amount.
- **Pagination**: Server-side client pagination controls.

## Components Used
- `src/components/iddir/IddirTable.tsx` — Iddir records table with pagination.
- `src/components/iddir/CreateIddirModal.tsx` — Form modal for registering new Iddirs.

## API Calls
- `getIddirsApi(condoId)` from `src/services/api/iddirApi.ts` (`GET /api/iddirs` or `GET /api/iddirs/:condoId/iddirs`).
- `createIddirApi(condoId, payload)` from `src/services/api/iddirApi.ts` (`POST /api/iddirs/:condoId/iddirs`).
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).

## Data Flow
```
IddirManagement.tsx mounts -> Calls getCondosApi() & getIddirsApi()
                                        │
                                        ▼
Populates IddirTable.tsx -> Super Admin clicks "Add Iddir"
                                        │
                                        ▼
Opens CreateIddirModal.tsx -> Fills form & submits
                                        │
                                        ▼
Executes createIddirApi -> Refetches Iddir list & updates UI
```

## Important Role Rules
- Accessible exclusively by Super Admins. Route is protected and hidden from `condo_admin` navigation.

## Current Limitations
- None.
