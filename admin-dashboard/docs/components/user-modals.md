# User Modals Documentation

This document describes the user registration and modification modal components.

---

## 1. `RegisterUserModal.jsx`

Located at [`src/components/user/RegisterUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/RegisterUserModal.jsx).

### Purpose
Allows administrators to register new users (defaults to resident role) with all required system fields.

### Props:
- `isOpen`: Boolean controlling Dialog open/closed state.
- `onClose`: Callback invoked when user clicks Cancel or Close icon.
- `onSuccess`: Callback invoked after successful registration to trigger list refresh.

### Form Fields:
1. `fullName` (Text, required)
2. `email` (Email, required)
3. `password` (Password, min 8 chars, required)
4. `phoneNumber` (Text, required)
5. `fan` (FAN Number, exactly 16 digits, required)
6. `condoCode` (Condominium Code, required)

### API Communication:
Direct POST request using `fetch('https://backend-a3xi.onrender.com/api/auth/register')`. Displays duplicate entry errors if email, phone, or FAN already exists.

---

## 2. `EditUserModal.jsx`

Located at [`src/components/user/EditUserModal.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/user/EditUserModal.jsx).

### Purpose
Allows administrators to edit an existing user's information, change their assigned role, and toggle their verification status.

### Props:
- `isOpen`: Boolean.
- `user`: User entity object (`{ id, fullName, email, phoneNumber, role, isVerified, condoId }`).
- `onClose`: Callback.
- `onSuccess`: Callback.

### Editable Fields:
1. `fullName`
2. `email`
3. `phoneNumber`
4. `role`: Select dropdown with options:
   - `resident`
   - `condo_admin`
   - `guard`
   - `super_admin`
5. `isVerified`: Switch toggle.

### API Communication:
Executes `PATCH https://backend-a3xi.onrender.com/api/users/${user.condoId}/${user.id}` with `Authorization: Bearer <token>`.
