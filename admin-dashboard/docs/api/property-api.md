# Property API (`propertyApi.ts`)

File Path: `src/services/api/propertyApi.ts`

Handles creation and retrieval of apartment blocks and individual room units, as well as status updates.

---

## Functions

### 1. `getBlocksApi(condoId)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/blocks/:condoId/blocks`
- **Purpose**: Fetches property blocks for a specified condominium.
- **Parameters**: `condoId: string`.
- **Response**: Array of `Block` objects.
- **Used By**: `src/pages/PropertyLayout/PropertyLayout.tsx`.

### 2. `createBlockApi(condoId, payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/blocks/:condoId/blocks`
- **Purpose**: Creates a new apartment block.
- **Request Body**: `CreateBlockPayload` (`blockNo`, `noRooms`, `noFloors`).
- **Response**: Created `Block` object.
- **Used By**: `src/components/property/CreateBlockModal.tsx`.

### 3. `getRoomsApi(condoId, blockId?)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/rooms/:condoId?blockId=<blockId>`
- **Purpose**: Fetches room units for a specified condominium, optionally filtered by block.
- **Parameters**: `condoId: string`, `blockId?: string`.
- **Response**: Array of `Room` objects.
- **Used By**: `src/pages/PropertyLayout/PropertyLayout.tsx`.

### 4. `createRoomApi(condoId, payload)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/rooms/:condoId`
- **Purpose**: Creates a new apartment room unit.
- **Request Body**: `CreateRoomPayload` (`blockId`, `roomNumber`, `floor`, `roomType`, `status`).
- **Response**: Created `Room` object.
- **Used By**: `src/components/property/CreateRoomModal.tsx`.

### 5. `updateRoomStatusApi(condoId, roomId, status)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/rooms/:condoId/:roomId/status`
- **Purpose**: Modifies the occupancy status of a unit (`free`, `occupied`, `reserved`, `maintenance`).
- **Request Body**: `{ status: RoomStatus }`.
- **Response**: Updated `Room` object.
- **Used By**: `src/components/property/UpdateRoomStatusModal.tsx`.
