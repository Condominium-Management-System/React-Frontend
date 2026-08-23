# Implemented Features

This document provides a checklist of all features currently implemented and active in the `admin-dashboard` frontend codebase.

## 1. Authentication & Security
- [x] **Email & Password Login**: Login form with credentials validation (`POST /api/auth/login`).
- [x] **Remember Me Session Persistence**: Dynamic switching between `localStorage` and `sessionStorage`.
- [x] **Automatic 401 Token Refresh**: Interceptor transparently refreshes access tokens using `POST /api/auth/refresh-token` and retries original requests.
- [x] **Protected Routes**: `<ProtectedRoute />` wrapper restricting unauthenticated access.
- [x] **Resident Blocking**: Non-admin accounts (`resident`) are blocked from web application access and shown an Access Denied banner.

## 2. Role-Based Access Control (RBAC)
- [x] **Super Admin Privilege Scope**: Access to all system routes including `/condos`. System-wide queries and condo filtering.
- [x] **Condo Admin Scope**: Restricted to assigned `condoId`. Route `/condos` is hidden and blocked. User listing queries are scoped to `/api/users/:condoId`.

## 3. Executive Dashboard (`/dashboard`)
- [x] **Metric Summary Cards**: Total Users, Total Condos, Total Payments, Total Transactions, Total Reports, Service Fees.
- [x] **Property Occupancy Grid**: Overview of Total Blocks, Total Rooms, Occupied Units, Free Units, and Reserved Units.

## 4. Condominium Management (`/condos`)
- [x] **Condominium Directory Table**: Displays condo name, code, city, address, block numbers, max admin limits, and status tags.
- [x] **City Filtering & Search**: Dynamic city dropdown selector and text search.
- [x] **Register Condominium**: Modal form to register new properties (`POST /api/condos`).
- [x] **Edit Condominium**: Modal form to update property settings (`PATCH /api/condos/:id`).
- [x] **Delete Condominium**: Soft-delete confirmation modal (`DELETE /api/condos/:id`).

## 5. User Administration (`/users`)
- [x] **User Accounts Table**: Displays name, email, phone, FAN ID, role tags, condo code, and verification tags.
- [x] **Role & Status Filters**: Filter by `super_admin`, `condo_admin`, `resident`, and verification status.
- [x] **Register User**: Modal form to register new user accounts (`POST /api/auth/register`).
- [x] **Edit User Details & Roles**: Modal form to update user details and reassign roles (`PATCH /api/users/:condoId/:userId` and `.../role`).
- [x] **Delete User**: User deletion confirmation modal (`DELETE /api/users/:condoId/:userId`).

## 6. Financial Payment Management (`/payments`)
- [x] **Payment Summary Metrics**: Overview cards for Total, Pending, Approved, and Rejected payments.
- [x] **Multi-Criteria Search & Filtering**: Search bar, payment type filter, status filter, payment method filter, and condo selector.
- [x] **Invoice Breakdown Modal**: Comprehensive invoice details modal displaying total amount, service fee breakdown, user info, and payment date.
- [x] **Approve & Reject Workflows**: Action dialog modal to approve or reject pending invoices with admin notes (`PATCH /api/payments/:id/approve` / `reject`).

## 7. Property Layout & Unit Management (`/blocks-rooms`)
- [x] **Property Layout Summary Cards**: Stat overview for blocks and room unit statuses.
- [x] **Room Units Directory Table**: Apartment unit table displaying block number, floor, room model, and occupancy status tags.
- [x] **Create Block**: Modal form to create new apartment blocks (`POST /api/blocks/:condoId/blocks`).
- [x] **Create Unit**: Modal form to create new apartment room units (`POST /api/rooms/:condoId`).
- [x] **Update Unit Status**: Modal form to modify room occupancy status (`free`, `occupied`, `reserved`, `maintenance`).

## 8. Admin Profile & Security (`/profile`)
- [x] **Profile Details Display**: User info banner, account status card, assigned condo info, and security overview card.
- [x] **Edit Profile**: Modal form to update full name, email, phone, FAN ID, and profile photo avatar (`PATCH /api/auth/me`).
- [x] **Change Password**: Modal form to update password and invalidate existing session.

## 9. Maintenance Reports Management (`/reports`)
- [x] **Maintenance Reports Table**: Table displaying ticket title, description, category, priority, reporter info, and status badges.
- [x] **Multi-Criteria Filter**: Filter by search query, status (`reported`, `assigned`, `in_progress`, `resolved`, `closed`), category, and priority.
- [x] **Report Details & Activity Modal**: Detailed modal view showing report metadata, attached photo, reporter info, status update form with resolution notes (`PUT /api/reports/:id/status`), and discussion thread with message response submission (`POST /api/reports/:id/response`).
- [x] **Super Admin Route Guarding**: Restricted exclusively to Super Admins (`allowedRoles={['super_admin']}`).

## 10. Iddir Management (`/iddirs`)
- [x] **Iddir Directory Table**: Displays Iddir name, condominium info, started date, monthly contribution amount, member count, status badge, and creator admin info.
- [x] **Multi-Criteria Search & Filter**: Search bar, status filter dropdown (`active`, `inactive`), and condominium filter selector.
- [x] **Create Iddir Modal**: Modal form to register a new Iddir (`POST /api/iddirs/:condoId/iddirs`).
- [x] **Super Admin Route Guarding**: Restricted exclusively to Super Admins (`allowedRoles={['super_admin']}`).

## 11. Iddir Members Management (`/iddir-members`)
- [x] **Iddir Member Directory Table**: Displays member full name, contact info, condominium & unit details, assigned Iddir fund, joined date, and status badges (`active`, `inactive`, `suspended`).
- [x] **Multi-Criteria Search & Condo Filter**: Search bar, status filter dropdown, and condominium selector dropdown.
- [x] **Register Member Modal**: Modal form to enroll a resident user into a community Iddir fund (`POST /api/iddir-members`).
- [x] **Super Admin Route Guarding**: Restricted exclusively to Super Admins (`allowedRoles={['super_admin']}`).



