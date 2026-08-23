# Data Flow Architecture

This document maps how data travels through the React frontend during fetching, mutation, and state synchronization.

---

## 1. Standard Page Query Flow (Example: Super Admin Condos)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant Page as Condos.jsx
    participant Api as axiosConfig.js (api.condos.getAll)
    participant Axios as axiosInstance (Interceptors)
    participant Backend as Backend Server (/api/condos)
    participant UI as Material UI Table & Stats Cards

    Admin->>Page: Opens /super-admin/condos
    Page->>Page: setLoading(true)
    Page->>Api: api.condos.getAll()
    Api->>Axios: axiosInstance.get('/condos')
    Axios->>Axios: Injects Authorization: Bearer <accessToken>
    Axios->>Backend: GET /api/condos
    Backend-->>Axios: HTTP 200 { success: true, data: [...] }
    Axios-->>Api: Axios Response
    Api-->>Page: Response data
    Page->>Page: setCondos(data) & compute stats
    Page->>Page: Computes filteredCondos & paginatedCondos
    Page->>UI: Renders rows, status chips, pagination & action buttons
    UI-->>Admin: Displays interactive condominium directory
```

---

## 2. Entity Creation & Mutation Flow (Example: Registering a Condo)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant UI as Condos.jsx
    participant Modal as Dialog Form (openDialog)
    participant Api as axiosConfig.js (api.condos.create)
    participant Backend as Backend Server (/api/condos)

    Admin->>UI: Clicks "Register New Condo"
    UI->>Modal: Opens dialog with empty formData
    Admin->>Modal: Fills condoName, address, city, maxAdmins
    Admin->>Modal: Clicks "Create Condo"
    Modal->>Api: api.condos.create(formData)
    Api->>Backend: POST /api/condos { condoName, address, ... }
    Backend-->>Api: HTTP 201 { success: true, data: { ...newCondo } }
    Api-->>Modal: Response received
    Modal->>UI: toast.success('Condo created successfully')
    Modal->>UI: setOpenDialog(false)
    Modal->>UI: Triggers fetchCondos()
    UI->>Backend: Re-queries GET /api/condos
    Backend-->>UI: Fresh updated list
    UI-->>Admin: Table reflects newly created condominium
```

---

## 3. Direct Fetch Mutation Flow (Example: RegisterUserModal)

In [`src/components/user/RegisterUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/RegisterUserModal.jsx), user registration makes a direct `fetch()` call to the backend registration endpoint:

```
User submits form
  ↓
RegisterUserModal validates fields (fullName, email, password, phone, fan, condoCode)
  ↓
fetch('https://backend-a3xi.onrender.com/api/auth/register', { method: 'POST', body })
  ↓
Server creates resident account
  ↓
toast.success('User registered successfully!')
  ↓
onSuccess() callback invoked
  ↓
Parent (Users.jsx) re-fetches user roster via api.users.getAll()
  ↓
Modal closes
```
