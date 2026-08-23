# Feature: Condominium Management

## 1. Purpose
Allows Super Administrators to register new condominiums, assign administrator quotas, monitor active/inactive statuses, search properties by name/code/city, update property parameters, and soft/hard delete properties.

---

## 2. User & Access Level
- **Role**: `super_admin` Only.
- **Route**: `/super-admin/condos`.

---

## 3. UI Overview
- **Header Action**: "Register New Condo" button opening registration dialog.
- **KPI Stats Cards**: 4 summary cards (Total Condos, Active, Inactive, Total Admins) which also serve as quick filter buttons.
- **Search Bar**: Live keyword search across name, code, and city.
- **Interactive Table**: Shows Condo Code, Name with initial avatar, City, Max Admins chip, Status chip, and action buttons (Toggle Status, Edit, Delete).
- **Create/Edit Modal**: Dialog collecting `condoName`, `address`, `city`, and `maxAdmins`.

---

## 4. Main Files Responsible
- **Page**: [`src/pages/super-admin/Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx)
- **API Client**: `api.condos` in [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js)

---

## 5. Important Functions & Operations
- `fetchCondos()`: Executes `GET /api/condos`, updates `condos` array, and computes stats.
- `handleSubmit()`: Calls `api.condos.create(formData)` or `api.condos.update(id, formData)`.
- `handleToggleStatus(id)`: Executes `PATCH /api/condos/:id/status`.
- `handleDelete(id)`: Prompts confirmation and executes `DELETE /api/condos/:id`.
