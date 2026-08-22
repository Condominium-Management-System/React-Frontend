# Payment Management Page

## Purpose
Provides financial management, invoice tracking, search filters, detail inspection, and payment approval or rejection workflows.

## Route
`/payments`

## Who Can Access It
- `super_admin`
- `condo_admin`

## Main Features
- **Summary Metrics Header**: Cards for Total Payments, Pending Payments, Approved Payments, and Rejected Payments.
- **Search & Filters**: Search bar, payment type filter, status filter, payment method filter, and condo selector filter (Super Admin).
- **Payment Transaction Table**: Displays reference number, payment type, total amount, status badge, payment method, user info, and action buttons.
- **Payment Details Modal**: Full invoice view showing detailed breakdowns, service fee splits, transaction references, and user details.
- **Payment Action Dialog**: Dialog modal to approve or reject pending payments with optional admin notes.
- **Pagination**: Server-side query pagination.

## Components Used
- `src/components/payment/PaymentStats.tsx` — Summary metric cards.
- `src/components/payment/PaymentFilters.tsx` — Search and filter controls.
- `src/components/payment/PaymentTable.tsx` — Payments table.
- `src/components/payment/PaymentDetailsModal.tsx` — Invoice detail modal.
- `src/components/payment/PaymentActionDialog.tsx` — Approve/Reject modal.

## API Calls
- `getPaymentStatisticsApi()` from `src/services/api/paymentApi.ts` (`GET /api/payments/statistics`).
- `getPaymentsApi(params)` from `src/services/api/paymentApi.ts` (`GET /api/payments`).
- `getPaymentByIdApi(id)` from `src/services/api/paymentApi.ts` (`GET /api/payments/:id`).
- `approvePaymentApi(id, adminNotes)` from `src/services/api/paymentApi.ts` (`PATCH /api/payments/:id/approve`).
- `rejectPaymentApi(id, adminNotes)` from `src/services/api/paymentApi.ts` (`PATCH /api/payments/:id/reject`).
- `getCondosApi()` from `src/services/api/condoApi.ts` (`GET /api/condos`).

## Data Flow
```
PaymentManagement.tsx mounts
             │
             ▼
Fetches stats & payment query list via paymentApi.ts
             │
             ▼
Renders table -> Admin clicks "Approve" or "Reject"
             │
             ▼
PaymentActionDialog opens -> Admin enters notes & submits
             │
             ▼
Executes approvePaymentApi / rejectPaymentApi -> Triggers reloadData()
```

## Important Role Rules
- Super Admins can select any condominium from the condo filter dropdown to audit its payments.
- Condo Admins view payments within their assigned condo scope.

## Current Limitations
- None.
