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

### 3. `getIddirMembersApi(condoId?, iddirId?)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/iddir-members` or `/api/iddir-members/:condoId`
- **Purpose**: Fetches system-wide Iddir members (or filtered by condominium / Iddir fund).
- **Parameters**: `condoId?: string`, `iddirId?: string`.
- **Response**: `IddirMember[]`.
- **Used By**: `src/pages/IddirMembersManagement/IddirMembersManagement.tsx`.

### 4. `addIddirMemberApi(payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/iddir-members`
- **Purpose**: Registers a resident user into a community Iddir fund.
- **Request Body**: `AddIddirMemberPayload` (`userId`, `iddirId`).
- **Response**: Created `IddirMember` object.
- **Used By**: `src/components/iddir/RegisterIddirMemberModal.tsx`.
