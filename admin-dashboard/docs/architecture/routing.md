# Routing Architecture & Route Table

This document details the routing design implemented in [`src/routes/AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx) using **React Router DOM v6**.

---

## 1. Routing Architecture Overview

Unlike basic flat routing, this application uses **Role-Branch Routing** inside `AppRoutes.jsx`:
- The top-level component inspects `useAuth()`.
- Based on `user.role`, it dynamically mounts either the Super Admin route branch or the Condo Admin route branch.
- Role isolation is enforced at the router level: a Condo Admin cannot access Super Admin URLs because those routes do not exist in the rendered `<Routes>` tree when logged in as a Condo Admin.

---

## 2. Complete Route Table

| Route Path | Layout / Wrapper | Page Component | Allowed Roles | Description |
|---|---|---|---|---|
| `/login` | Standalone | [`Login.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/auth/Login.jsx) | Public / Unauthenticated | Admin login portal. Redirects to role dashboard if already authenticated. |
| **Super Admin Branch** | | | | |
| `/super-admin/dashboard` | `SuperAdminLayout` | [`Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Dashboard.jsx) | `super_admin` | Global system analytics, KPIs, revenue area charts, and payment method pie chart. |
| `/super-admin/condos` | `SuperAdminLayout` | [`Condos.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Condos.jsx) | `super_admin` | Condominium registration, status toggles, editing, and deletion. |
| `/super-admin/users` | `SuperAdminLayout` | [`Users.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Users.jsx) | `super_admin` | Master user accounts, resident/admin registration modal, verification actions, and role updates. |
| `/super-admin/reports` | `SuperAdminLayout` | [`Reports.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Reports.jsx) | `super_admin` | System-wide maintenance reports, task assignment, status updates, and response threads. |
| `/super-admin/payments` | `SuperAdminLayout` | [`Payments.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Payments.jsx) | `super_admin` | Payment invoices, slip reviews, approval and rejection actions. |
| `/super-admin/announcements`| `SuperAdminLayout` | [`Announcements.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Announcements.jsx)| `super_admin` | System-wide broadcasts with category filtering and pinning. |
| `/super-admin/promotions` | `SuperAdminLayout` | [`Promotions.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Promotions.jsx) | `super_admin` | Business promotion approvals, pricing, and campaign tracking. |
| `/super-admin/equb-iddir` | `SuperAdminLayout` | [`EqubIddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/EqubIddirManagement.jsx)| `super_admin`| Combined overview of Equbs and Iddirs across all condominiums. |
| **Condo Admin Branch** | | | | |
| `/condo-admin/dashboard` | `CondoAdminLayout` | [`Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Dashboard.jsx) | `condo_admin` | Local property analytics, occupancy rates, local revenue, and report counts. |
| `/condo-admin/residents` | `CondoAdminLayout` | [`Residents.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Residents.jsx) | `condo_admin` | Local resident directory, block/room assignments, and Equb/Iddir member flags. |
| `/condo-admin/reports` | `CondoAdminLayout` | [`Reports.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Reports.jsx) | `condo_admin` | Property-specific maintenance requests and admin responses. |
| `/condo-admin/payments` | `CondoAdminLayout` | [`Payments.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Payments.jsx) | `condo_admin` | Resident payment verification and status toggles. |
| `/condo-admin/lost-found`| `CondoAdminLayout` | [`LostFound.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/LostFound.jsx) | `condo_admin` | Lost and found items registry, claim filing, and verification. |
| `/condo-admin/announcements`| `CondoAdminLayout`| [`Announcements.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/Announcements.jsx)| `condo_admin`| Property-level notices and community event announcements. |
| `/condo-admin/equbs` | `CondoAdminLayout` | [`EqubManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/EqubManagement.jsx)| `condo_admin`| Local Equb savings circles creation and member tracking. |
| `/condo-admin/iddirs` | `CondoAdminLayout` | [`IddirManagement.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/condo-admin/IddirManagement.jsx)| `condo_admin`| Local Iddir mutual support funds creation and membership rosters. |

---

## 3. Redirection Behaviors

1. **Unauthenticated Redirect**: When `!isAuthenticated`, all non-login paths trigger `<Route path="*" element={<Navigate to="/login" replace />} />`.
2. **Post-Login Routing**:
   - `super_admin` navigates to `/super-admin/dashboard`.
   - `condo_admin` navigates to `/condo-admin/dashboard`.
3. **Wildcard Fallback**: Any undefined sub-route within a role branch redirects back to that role's dashboard.
