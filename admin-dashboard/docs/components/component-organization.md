# Component Architecture & Organization

This document details the component structure, styling patterns, state ownership, and modularity in the React frontend.

---

## 1. Component Categories

```
src/components/
├── common/
│   ├── DataTable.jsx      # Placeholder (empty 0-byte file)
│   ├── Header.jsx         # Placeholder (empty 0-byte file)
│   ├── Sidebar.jsx        # Master navigation sidebar with role-aware links
│   ├── StatCard.jsx       # Reusable colored KPI metric card
│   └── StatusBadge.jsx    # Placeholder (empty 0-byte file)
│
└── user/
    ├── EditUserModal.jsx      # User editing & role assignment dialog
    └── RegisterUserModal.jsx  # New user creation dialog with direct registration fetch
```

---

## 2. Component Design & Composition Patterns

### 1. In-Page Component Co-location
In this codebase, complex tables and forms are often styled and composed directly within page files using `@emotion/styled` and Material UI primitives:
- `StyledTableContainer`: Customized Paper container with styled gradient headers.
- `StatsCard`: Interactive card with top colored borders, hover lifts, and icon containers.
- `StatusChip`: Semantic colored badges for statuses (`Active`, `Inactive`, `Verified`, `Pending`).

### 2. Dialog Component Pattern
Modal dialogs (e.g. `RegisterUserModal.jsx`, `EditUserModal.jsx`) encapsulate form fields, validation, and loading spinners:
- **Props**: `{ isOpen, onClose, onSuccess, user? }`.
- **Styling**: `styled(Dialog)` with rounded corners (`borderRadius: '20px'`) and dark header gradients.
- **Feedback**: React-Toastify notifications on success or failure.
