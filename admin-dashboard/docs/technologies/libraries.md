# Third-Party Libraries & Dependencies

This document provides a breakdown of all third-party libraries installed and used in the **React Frontend** (`react/`), referencing their usage in the codebase.

---

## 1. Complete Dependency Analysis

| Library | Exact Version | Role & Usage in this Project | Key Files Using It |
|---|---|---|---|
| **@mui/material** | `^5.18.0` | Comprehensive component system: `Button`, `Dialog`, `Table`, `Card`, `Paper`, `TextField`, `Select`, `Chip`, `CircularProgress`, `Tabs`, `Switch`, `Grid`. | Used across all pages and modals (e.g., `Condos.jsx`, `Users.jsx`, `Residents.jsx`). |
| **@mui/icons-material**| `^5.18.0` | Material design system icon set for sidebar, tables, status indicators, and headers. | `Sidebar.jsx`, `Dashboard.jsx`, `Condos.jsx`, `Residents.jsx`. |
| **@emotion/react** & **@emotion/styled** | `^11.14.0` / `^11.14.1` | CSS-in-JS styling engine powering Material UI custom `styled()` components. | `styled(Dialog)`, `styled(Card)`, `styled(TableContainer)` in pages. |
| **axios** | `^1.19.0` | Promise-based HTTP client with request/response interceptors and base configuration. | [`src/api/axiosConfig.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/api/axiosConfig.js). |
| **react-router-dom** | `^6.14.0` | Client-side routing, navigation, history synchronization, and nested route outlets. | [`AppRoutes.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/routes/AppRoutes.jsx), `Sidebar.jsx`. |
| **recharts** | `^2.15.4` | Data visualization charts: `AreaChart`, `ResponsiveContainer`, `PieChart`, `Tooltip`. | [`src/pages/super-admin/Dashboard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/pages/super-admin/Dashboard.jsx). |
| **react-toastify** | `^9.1.3` | User feedback notifications for successful actions, validation errors, and API failures. | `App.js`, `useApi.js`, `Login.jsx`, `Condos.jsx`, `Users.jsx`. |
| **react-icons** | `^5.7.0` | Icon sets (`FaRegEdit`, `FaRegTrashAlt`, `FaEye`, `MdVerified`, `MdOutlineUnverified`). | `Condos.jsx`, `Users.jsx`, `Residents.jsx`. |
| **lucide-react** | `^1.33.0` | Lightweight modern icons. | Listed in `package.json`, used in `StatCard.jsx`. |
| **react-hook-form** & **@hookform/resolvers** & **yup** | `^7.85.0` / `^3.10.0` / `^1.7.1` | Form state management and schema validation utilities. | Installed in `package.json`. |
| **date-fns** | `^2.30.0` | Date formatting and manipulation library. | Installed in `package.json`. |
