# State Management Architecture

This document describes how state is structured, updated, and persisted in the **React Frontend** (`react/`).

---

## 1. State Classification in this Project

The application uses a **Three-Tier State Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Auth State                        │
│            (AuthContext + localStorage Persistence)         │
│  - user, token, isAuthenticated                             │
│  - isSuperAdmin, isCondoAdmin, isResident, isGuard          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Custom Hook Async State                   │
│                         (useApi.js)                         │
│  - data, loading, error, execute, refetch                   │
│  - Optional automatic fetching (autoFetch)                  │
│  - Automatic toast error display                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Local Component State                      │
│                  (useState / useMemo)                       │
│  - Data arrays (condos, users, payments, reports)           │
│  - Filters, search terms, active tab indices                │
│  - Pagination (page, rowsPerPage)                           │
│  - Modal visibility (openDialog, openEditModal)             │
│  - Form state (formData, isSubmitting)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Global State (`AuthContext`)

Implemented in [`src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/context/AuthContext.jsx):

```javascript
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### State Values Provided:
- `user`: User object containing `id`, `fullName`, `email`, `role`, `condoId`, `condoCode`.
- `loading`: Boolean indicating whether localStorage verification is in progress.
- `isAuthenticated`: Derived boolean `!!user`.
- Role boolean flags: `isSuperAdmin`, `isCondoAdmin`, `isResident`, `isGuard`.
- `login(credentials)`: Asynchronous login handler storing tokens in `localStorage`.
- `logout()`: Clears `localStorage` and resets all state to `null` / `false`.

---

## 3. Asynchronous Hook State (`useApi`)

Implemented in [`src/hooks/useApi.js`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/hooks/useApi.js):

```javascript
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result.data.data || result.data);
      return result.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      if (options.showToast !== false) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options.showToast]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      execute();
    }
  }, [execute, options.autoFetch]);

  return { data, loading, error, execute, refetch: execute };
};
```

---

## 4. Local Page State & In-Memory Filtering

Pages maintain their active lists and compute filtered subsets using standard array methods:

```javascript
// Example from Condos.jsx
const [condos, setCondos] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('ALL');
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

const filteredCondos = condos.filter(condo => {
  const matchesSearch = 
    condo.condoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.condoCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.city?.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesFilter = 
    filterType === 'ALL' ||
    (filterType === 'ACTIVE' && condo.activeStatus) ||
    (filterType === 'INACTIVE' && !condo.activeStatus);
  
  return matchesSearch && matchesFilter;
});

const paginatedCondos = filteredCondos.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);
```
