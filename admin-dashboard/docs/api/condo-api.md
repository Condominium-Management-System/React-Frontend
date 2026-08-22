# Condo API (`condoApi.ts`)

File Path: `src/services/api/condoApi.ts`

Handles CRUD operations for condominiums.

---

## Functions

### 1. `getCondosApi()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/condos`
- **Purpose**: Fetches all registered condominiums in the system.
- **Response**: Array of `Condo` objects.
- **Used By**: `src/pages/CondoManagement/CondoManagement.tsx`, `src/pages/PaymentManagement/PaymentManagement.tsx`, `src/pages/PropertyLayout/PropertyLayout.tsx`.

### 2. `createCondoApi(payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/condos`
- **Purpose**: Creates a new condominium property.
- **Request Body**: `CreateCondoPayload` (`condoCode`, `condoName`, `address`, `city`, `maxAdmins`, `blockNumbers`).
- **Response**: Created `Condo` object.
- **Used By**: `src/components/condo/RegisterCondoModal.tsx`.

### 3. `updateCondoApi(id, payload)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/condos/:id`
- **Purpose**: Updates details of an existing condominium.
- **Request Body**: `UpdateCondoPayload` (`condoName`, `address`, `city`, `maxAdmins`).
- **Response**: Updated `Condo` object.
- **Used By**: `src/components/condo/EditCondoModal.tsx`.

### 4. `deleteCondoApi(id)`
- **HTTP Method**: `DELETE`
- **Endpoint**: `/api/condos/:id`
- **Purpose**: Soft-deletes a condominium.
- **Used By**: `src/components/condo/DeleteCondoModal.tsx`.
