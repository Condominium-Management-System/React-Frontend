# Authentication API (`authApi.ts`)

File Path: `src/services/api/authApi.ts`

Handles login, logout, profile loading, and profile updating.

---

## Functions

### 1. `loginApi(credentials)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Purpose**: Authenticates user login credentials.
- **Parameters**: `credentials: LoginCredentials` (`{ email, password }`).
- **Response**: `LoginResponse` containing `accessToken`, `refreshToken`, and `user` object.
- **Used By**: `src/context/AuthContext.tsx` (via `Login.tsx`).

### 2. `logoutApi()`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Purpose**: Invalidates refresh token on backend and clears local session.
- **Headers**: `Authorization: Bearer <accessToken>`.
- **Request Body**: `{ refreshToken: session.refreshToken }`.
- **Used By**: `src/context/AuthContext.tsx` (via `Sidebar.tsx` and `ProtectedRoute.tsx`).

### 3. `getProfileApi()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Purpose**: Fetches currently authenticated user's profile.
- **Response**: `User` profile object.
- **Used By**: `src/pages/Profile/Profile.tsx`, `src/components/profile/EditProfileModal.tsx`.

### 4. `updateProfileApi(formData)`
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/auth/me`
- **Purpose**: Updates admin profile information or photo avatar.
- **Request Body**: `FormData` object containing updated fields (`fullName`, `email`, `phoneNumber`, `fan`, `profilePhoto`).
- **Response**: Updated `User` object.
- **Used By**: `src/components/profile/EditProfileModal.tsx`, `src/components/profile/ChangePasswordModal.tsx`.
