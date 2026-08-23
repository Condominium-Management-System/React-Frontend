# Layout Components

This document describes the layout shells and navigation components in the React frontend.

---

## 1. `SuperAdminLayout.jsx`

Located at [`src/layouts/SuperAdminLayout.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/layouts/SuperAdminLayout.jsx):

```jsx
const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar isSuperAdmin={true} onLogout={handleLogout} />
      <div className="main-content">
        <div className="main-header">
          <h2>Super Admin Console</h2>
          <div className="user-info">
            <span>{user?.fullName || 'Super Admin'}</span>
            <div className="avatar">SA</div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
```

- **Role**: Master wrapper for Super Admin routes (`/super-admin/*`).
- **Renders**: `Sidebar` configured with `isSuperAdmin={true}`, top header with user name, and `<Outlet />` for child pages.

---

## 2. `CondoAdminLayout.jsx`

Located at [`src/layouts/CondoAdminLayout.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/layouts/CondoAdminLayout.jsx):
- **Role**: Master wrapper for Condo Admin routes (`/condo-admin/*`).
- **Renders**: `Sidebar` configured with `isSuperAdmin={false}` (rendering condo admin links) and top header showing the administrator's property context.

---

## 3. `Sidebar.jsx`

Located at [`src/components/common/Sidebar.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/Sidebar.jsx):
- **Props**: `{ isSuperAdmin, onLogout }`.
- **Navigation Links**:
  - **Super Admin**: Dashboard, Condos, Users, Reports, Payments, Announcements, Promotions, Equb & Iddir.
  - **Condo Admin**: Dashboard, Residents, Reports, Payments, Announcements, Lost & Found, Equb Management, Iddir Management.
- **Active State**: Uses React Router `NavLink` with dynamic `active` class highlighting current route.
- **Logout Action**: Renders a logout button at the bottom triggering the `onLogout` callback.
