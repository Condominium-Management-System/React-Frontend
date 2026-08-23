# Frontend Technology Stack

This document details the exact technologies, runtime versions, and build tools used by the **React Frontend** (`react/`), verified against [`package.json`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/package.json).

---

## 1. Core Framework & Build Tooling

| Technology | Version | Purpose in this Project |
|---|---|---|
| **React** | `^18.2.0` | Core UI library providing functional components, hooks (`useState`, `useEffect`, `useContext`, `useCallback`), and Context API. |
| **React DOM** | `^18.2.0` | DOM renderer mounted via `ReactDOM.createRoot(document.getElementById('root'))` in `src/index.js`. |
| **react-scripts** | `5.0.1` | Create React App (CRA) build configuration providing Webpack 5 bundling, Babel compilation, development dev-server (`npm start`), and test runner (`npm test`). |
| **Language** | JavaScript (ES6+ / JSX) | Components and services are authored in modern JavaScript (`.jsx` / `.js`). |

---

## 2. Environment Configuration

Defined in [`react/.env`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/.env):

```properties
REACT_APP_API_URL=https://backend-a3xi.onrender.com/api
REACT_APP_ENV=production
```

- Accessible at runtime via `process.env.REACT_APP_API_URL`.
- Hardcoded fallback in `src/api/axiosConfig.js`: `'https://backend-a3xi.onrender.com/api'`.

---

## 3. NPM Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```
