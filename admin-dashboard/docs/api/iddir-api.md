# Iddir API (`iddirApi.ts`)

File Path: `src/services/api/iddirApi.ts`

Handles community Iddir retrieval and creation endpoints.

---

## Functions

### 1. `getIddirsApi(condoId?)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/iddirs` or `/api/iddirs/:condoId/iddirs`
- **Purpose**: Fetches system-wide Iddir records (or filtered by a specific condominium).
- **Parameters**: `condoId?: string` (optional).
- **Response**: `Iddir[]`.
- **Used By**: `src/pages/IddirManagement/IddirManagement.tsx`.

### 2. `createIddirApi(condoId, payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/iddirs/:condoId/iddirs`
- **Purpose**: Registers a new community Iddir for a condominium.
- **Request Body**: `CreateIddirPayload` (`condoId`, `name`, `startedDate`, `contributionAmount`).
- **Response**: Created `Iddir` object.
- **Used By**: `src/components/iddir/CreateIddirModal.tsx`.
