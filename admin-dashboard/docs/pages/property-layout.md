# Property Layout Page

## Purpose
Manages condominium physical property layouts, including creating apartment blocks, creating room units, and modifying room occupancy statuses.

## Route
`/blocks-rooms`

## Who Can Access It
- `super_admin`
- `condo_admin`

## Main Features
- **Property Layout Summary Header**: Stat cards displaying Total Blocks, Total Units, Free Units, Occupied Units, and Reserved/Maintenance Units.
- **Search & Unit Status Filter**: Search bar, unit status filter dropdown, and action trigger buttons for *Add Block* and *Add Unit*.
- **Room Units Table**: Displays room unit number, block number, floor, room type model, occupancy badge, and status update triggers.
- **Create Block Modal**: Form modal to create a new property block (block number, number of rooms, number of floors).
- **Create Room Modal**: Form modal to add a new room unit assigned to a block.
- **Update Room Status Modal**: Form modal to modify a unit's status (`free`, `occupied`, `reserved`, `maintenance`).
- **Pagination**: Paginated room unit table.

## Components Used
- `src/components/property/PropertyStats.tsx` — Property metrics summary.
- `src/components/property/PropertyFilters.tsx` — Search, filter, and add buttons.
- `src/components/property/RoomTable.tsx` — Room units table.
- `src/components/property/CreateBlockModal.tsx` — Block creation modal.
- `src/components/property/CreateRoomModal.tsx` — Room unit creation modal.
- `src/components/property/UpdateRoomStatusModal.tsx` — Status update modal.

## API Calls
- `getBlocksApi(condoId)` from `src/services/api/propertyApi.ts` (`GET /api/blocks/:condoId/blocks`).
- `createBlockApi(condoId, payload)` from `src/services/api/propertyApi.ts` (`POST /api/blocks/:condoId/blocks`).
- `getRoomsApi(condoId, blockId)` from `src/services/api/propertyApi.ts` (`GET /api/rooms/:condoId`).
- `createRoomApi(condoId, payload)` from `src/services/api/propertyApi.ts` (`POST /api/rooms/:condoId`).
- `updateRoomStatusApi(condoId, roomId, status)` from `src/services/api/propertyApi.ts` (`PATCH /api/rooms/:condoId/:roomId/status`).
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).

## Data Flow
```
PropertyLayout.tsx loads condoId (from dropdown if super_admin, or user.condoId if condo_admin)
                                │
                                ▼
Fetches blocks (getBlocksApi) & rooms (getRoomsApi) in parallel
                                │
                                ▼
Renders RoomTable -> User changes room status via UpdateRoomStatusModal
                                │
                                ▼
Executes updateRoomStatusApi -> Refetches rooms & updates UI
```

## Important Role Rules
- Super Admins can select any condominium from the condo filter dropdown.
- Condo Admins automatically manage their assigned condominium.

## Current Limitations
- None.
