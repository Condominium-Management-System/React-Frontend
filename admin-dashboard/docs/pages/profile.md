# Profile Page

## Purpose
Allows administrators to view their personal profile information, system account details, security settings, and change their password.

## Route
`/profile`

## Who Can Access It
- `super_admin`
- `condo_admin`

## Main Features
- **Profile Info Card**: Displays profile photo avatar, full name, email, phone number, FAN ID, and *Edit Profile* trigger button.
- **Account Info Card**: Displays account role, verification status, assigned condo name/code, and registration date.
- **Security Card**: Password security card with *Change Password* trigger button.
- **Edit Profile Modal**: Form modal allowing users to upload a profile photo, update full name, email, phone, and FAN ID.
- **Change Password Modal**: Form modal allowing users to update their password.

## Components Used
- `src/components/profile/ProfileInfoCard.tsx` — Personal profile display card.
- `src/components/profile/AccountInfoCard.tsx` — Account details card.
- `src/components/profile/SecurityCard.tsx` — Security card.
- `src/components/profile/EditProfileModal.tsx` — Profile update modal.
- `src/components/profile/ChangePasswordModal.tsx` — Password change modal.

## API Calls
- `getProfileApi()` from `src/services/api/authApi.ts` (`GET /api/auth/me`).
- `updateProfileApi(formData)` from `src/services/api/authApi.ts` (`PATCH /api/auth/me`).
- `clearStoredSession()` from `src/services/api/httpClient.ts` (invoked upon successful password change to require re-login).

## Data Flow
```
Profile.tsx mounts -> Calls getProfileApi()
                           │
                           ▼
Backend returns user profile -> Cards display user details
                           │
                           ▼
User updates profile via EditProfileModal (FormData submitted)
                           │
                           ▼
updateProfileApi updates session storage & AuthContext state
```

## Important Role Rules
- Accessible by all authenticated administrative users. Displays user's assigned role badge (`super_admin` or `condo_admin`).

## Current Limitations
- Changing password logs out the current session, requiring re-authentication.
