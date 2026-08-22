# Payment API (`paymentApi.ts`)

File Path: `src/services/api/paymentApi.ts`

Handles payment statistics, querying, invoice loading, and payment approval/rejection workflows.

---

## Functions

### 1. `getPaymentStatisticsApi()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/payments/statistics`
- **Purpose**: Fetches financial summary statistics.
- **Response**: `PaymentStatistics` (`totalPayments`, `pendingPayments`, `approvedPayments`, `rejectedPayments`).
- **Used By**: `src/pages/PaymentManagement/PaymentManagement.tsx`.

### 2. `getPaymentsApi(params)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/payments?<queryString>`
- **Purpose**: Queries payment transaction list with filters and pagination parameters.
- **Parameters**: `PaymentsQueryParams` (`page`, `limit`, `search`, `paymentType`, `status`, `paymentMethod`, `condoId`, `userId`).
- **Response**: `{ payments: Payment[]; total: number }`.
- **Used By**: `src/pages/PaymentManagement/PaymentManagement.tsx`.

### 3. `getPaymentByIdApi(id)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/payments/:id`
- **Purpose**: Loads full invoice details for a specific payment.
- **Response**: `Payment` detail object.
- **Used By**: `src/components/payment/PaymentDetailsModal.tsx`.

### 4. `approvePaymentApi(id, adminNotes?)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/payments/:id/approve`
- **Purpose**: Approves a pending payment invoice.
- **Request Body**: `{ adminNotes?: string }`.
- **Response**: Updated `Payment` object.
- **Used By**: `src/components/payment/PaymentActionDialog.tsx`.

### 5. `rejectPaymentApi(id, adminNotes?)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/payments/:id/reject`
- **Purpose**: Rejects a pending payment invoice.
- **Request Body**: `{ adminNotes?: string }`.
- **Response**: Updated `Payment` object.
- **Used By**: `src/components/payment/PaymentActionDialog.tsx`.
