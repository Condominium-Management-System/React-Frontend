> 🌐 **Full-Stack Quick Navigation:**
> - ⚙️ **Backend API (Repository):** [https://github.com/Condominium-Management-System/backend](https://github.com/Condominium-Management-System/backend)
> - 🚀 **Live Deployed Application:** [https://homeaxiz.vercel.app](https://homeaxiz.vercel.app)
> - 💻 **Frontend Web Portal (Repository):** [https://github.com/Condominium-Management-System/React-Frontend](https://github.com/Condominium-Management-System/React-Frontend)

---

# HomeAxis Frontend Portal — Enterprise Condominium Management System

A modern, responsive, mobile-first web application powering the **HomeAxis Condominium Management System**, built with React 18, Material UI (MUI v5), Axios with automatic JWT interceptors, and real-time Socket.IO communication.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Material UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://homeaxiz.vercel.app)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Client-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## 📑 Table of Contents
- [📌 Overview](#-overview)
- [🔗 Ecosystem & Project Resources](#-ecosystem--project-resources)
- [👥 User Roles & Interface Capabilities](#-user-roles--interface-capabilities)
- [✨ Core Features](#-core-features)
- [🛠️ Technology Stack](#%EF%B8%8F-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🏗️ Architecture & Component Hierarchy](#%EF%B8%8F-architecture--component-hierarchy)
- [1️⃣ Clone the Repository](#1%EF%B8%8F%E2%83%A3-clone-the-repository)
- [2️⃣ Install Dependencies](#2%EF%B8%8F%E2%83%A3-install-dependencies)
- [⚙️ Environment Configuration](#%EF%B8%8F-environment-configuration)
- [▶️ Running the Application](#%EF%B8%8F-running-the-application)
- [📱 Portals & Key Interfaces](#-portals--key-interfaces)
  - [1. 🏡 Resident Portal (Mobile-First Experience)](#1--resident-portal-mobile-first-experience)
  - [2. 🏢 Condominium Admin Console](#2--condominium-admin-console)
  - [3. 👑 Super Administrator Console](#3--super-administrator-console)
- [🔒 Security & Protected Routing](#-security--protected-routing)
- [🧠 Key Design Decisions](#-key-design-decisions)
- [🔮 Future Enhancements](#-future-enhancements)
- [📌 Assumptions and Known Limitations](#-assumptions-and-known-limitations)
- [👨‍💻 Authors & Lead Engineers](#-authors--lead-engineers)

---

## 📌 Overview
The **HomeAxis Frontend** is a single-page application (SPA) created to meet the modern operational and community lifestyle needs of Ethiopian condominium residents and property management teams.

Traditional condominium management systems either cater exclusively to administrative desk workers or fail to reflect local financial customs like **Equb** and **Iddir**. HomeAxis bridges this gap by offering:
- A **mobile-first Resident Portal** that residents can use directly from their smartphones to verify savings contributions, pay monthly maintenance dues without typing bank accounts, and participate in community mutual aid.
- An **operational Condominium Admin Console** providing real-time treasury monitoring, resident roster management, digital Equb lottery rounds, and double-entry transaction auditing.
- A **Super Administrator Console** offering nationwide condominium governance and consolidated revenue analytics across all registered condominiums.

---

## 🔗 Ecosystem & Project Resources
| Resource | URL | Description |
|:---|:---|:---|
| **Live Deployed Web Application** | [https://homeaxiz.vercel.app](https://homeaxiz.vercel.app) | Production web portal (Vercel) |
| **Frontend GitHub Repository** | [Condominium-Management-System/React-Frontend](https://github.com/Condominium-Management-System/React-Frontend) | React 18 single-page application |
| **Backend GitHub Repository** | [Condominium-Management-System/backend](https://github.com/Condominium-Management-System/backend) | Express.js & PostgreSQL REST API |
| **Local Web Server** | `http://localhost:3000` | Local frontend development runtime |

---

## 👥 User Roles & Interface Capabilities
The frontend features declarative role-based routing that serves all roles through clean, unified login (`/login`) and registration (`/register`) views:

1. 👑 **Super Administrator (`super_admin`)**:
   - Accesses `/super-admin/dashboard` to monitor all registered condominiums across Ethiopia.
   - Views aggregated operational funds across all condominium treasury accounts.
   - Provisions new condominium complexes, manages administrators, and broadcasts nationwide notices.

2. 🏢 **Condominium Administrator (`condo_admin`)**:
   - Accesses `/condo-admin/dashboard` scoped strictly to their assigned condominium code.
   - Registers and manages condominium operational source/destination accounts (CBE, Telebirr).
   - Approves resident fee payments with automated treasury balance crediting.
   - Manages building blocks, apartment units, resident approvals, and Equb/Iddir workflows.

3. 🏡 **Resident (`resident`)**:
   - Accesses `/resident/dashboard` optimized for mobile screens and thumbs.
   - Views verified contribution totals for Equb and Iddir memberships.
   - Submits condominium dues using automated payment destination routing.
   - Configures personal payout accounts (CBE, Telebirr) for receiving Equb lottery pots and community aid.
   - Submits maintenance tickets, posts community promotions, and checks property notices.

4. 🛡️ **Security Guard (`guard`)**:
   - Accesses `/resident/dashboard` facilities interfaces to manage gate clearance, log security alerts, and inspect lost & found items.

---

## ✨ Core Features
- **Automated Treasury Payment Routing**: When making payments, the system resolves the official condominium destination account (CBE or Telebirr) and displays it as read-only information, completely removing resident typing errors.
- **Verified Financial Status Cards**: Live cards displaying enrolled Equb savings groups, active Iddir mutual aid standing, and masked payout accounts (`Ethio Telecom Telebirr (••••2212)`).
- **Resident Self-Registration**: Direct self-registration (`/register`) with dynamic condominium selection populated directly from live backend records.
- **Condominium Treasury Hub**: Real-time balance banner, account status badges, and an interactive **Account Transaction History Modal**.
- **Super Admin Revenue Aggregator**: Real-time calculation of total operational funds across all registered condominiums in Ethiopia.
- **Digital Community Engines**: Full interactive UI for Equb lottery winner selection and Iddir emergency aid claim submissions.
- **Responsive Mobile Navigation**: Dedicated thumb-friendly bottom navigation bar for mobile viewports.

---

## 🛠️ Technology Stack
| Technology | Purpose |
|:---|:---|
| [React 18](https://react.dev/) | Frontend component framework |
| [React Router v6](https://reactrouter.com/) | Client-side routing and declarative protected route guards |
| [Material UI (MUI v5)](https://mui.com/) | Accessible, modern enterprise UI components & design system |
| [Emotion](https://emotion.sh/) | CSS-in-JS styled component styling |
| [Axios](https://axios-http.com/) | HTTP client with bearer token request/response interceptors |
| [Socket.IO Client](https://socket.io/) | Real-time WebSocket event listeners and messaging |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | Interactive toast feedback for payments, alerts, and errors |
| [Recharts](https://recharts.org/) | Responsive SVG financial analytics and revenue charts |

---

## 📂 Project Structure
```
React-Frontend/
├── public/
│   ├── index.html             # Application HTML shell
│   └── favicon.svg            # HomeAxis brand icon
├── src/
│   ├── api/
│   │   └── axiosConfig.js     # Axios instance, bearer interceptor, and endpoint catalog
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx     # Top application header with profile & notifications
│   │   │   ├── Sidebar.jsx    # Collapsible desktop navigation bar
│   │   │   └── MobileNav.jsx  # Fixed thumb-friendly mobile bottom navigation
│   │   ├── chat/              # Real-time discussion modal components
│   │   └── user/              # User registration and profile editing dialogs
│   ├── context/
│   │   ├── AuthContext.jsx    # Global authentication state, tokens, and role definitions
│   │   └── ThemeContext.jsx   # Dark / Light theme provider
│   ├── layouts/
│   │   ├── SuperAdminLayout.jsx # Super Admin application container & navigation
│   │   ├── CondoAdminLayout.jsx # Condominium Admin application container
│   │   └── ResidentLayout.jsx   # Resident & Guard mobile-first container
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx      # Clean unified sign-in page
│   │   │   ├── Login.css      # Dark-themed responsive authentication styling
│   │   │   └── Register.jsx   # Resident registration with dynamic condo lookup
│   │   ├── super-admin/       # Nationwide condominium governance dashboards
│   │   ├── condo-admin/       # Condominium treasury, units, and Equb/Iddir management
│   │   ├── resident/          # Mobile resident dashboard, dues payments, and savings
│   │   └── common/            # Shared building blocks and apartment units views
│   ├── routes/
│   │   ├── AppRoutes.jsx      # Declarative RBAC route mapping and redirects
│   │   └── AppRoutes.css      # Route layout styling
│   ├── services/              # API consumption service adapters
│   ├── App.jsx                # Root application component
│   └── index.jsx              # React DOM render entry point
├── package.json               # NPM scripts and dependencies
└── README.md                  # Project documentation
```

---

## 🏗️ Architecture & Component Hierarchy
```
                             ┌───────────────────────┐
                             │       App.jsx         │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │     AuthContext       │
                             │ (JWT, Role, User State)
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │     AppRoutes.jsx     │
                             └───────────┬───────────┘
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
      ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
      │   SuperAdminLayout   ││   CondoAdminLayout   ││    ResidentLayout    │
      └──────────┬───────────┘└──────────┬───────────┘└──────────┬───────────┘
                 │                       │                       │
      ┌──────────┴───────────┐┌──────────┴───────────┐┌──────────┴───────────┐
      │ • Condos Governance  ││ • Treasury Accounts  ││ • Mobile Dashboard   │
      │ • Revenue Statistics ││ • Payment Queue      ││ • Auto Fee Payment   │
      │ • Building Blocks    ││ • Equb / Iddir Ops   ││ • Equb & Mutual Aid  │
      │ • User Management    ││ • Resident Roster    ││ • Payout Accounts    │
      └──────────────────────┘└──────────────────────┘└──────────────────────┘
```

---

## 1️⃣ Clone the Repository
```bash
git clone https://github.com/Condominium-Management-System/React-Frontend.git
cd React-Frontend
```

## 2️⃣ Install Dependencies
```bash
npm install
```

---

## ⚙️ Environment Configuration
Create a `.env` file in the project root:

```env
# Backend API Base URL
REACT_APP_API_URL="http://127.0.0.1:3000/api"

# WebSocket Server URL
REACT_APP_SOCKET_URL="http://127.0.0.1:3000"
```

---

## ▶️ Running the Application

### Development Server:
```bash
npm start
```
Starts the local development server at `http://localhost:3000` with hot-module reloading.

### Production Build:
```bash
npm run build
```
Generates an optimized production bundle in the `build/` directory with code splitting and minification.

---

## 📱 Portals & Key Interfaces

### 1. 🏡 Resident Portal (Mobile-First Experience)
- **Verified Financial Status Cards**: Shows real-time enrollment in Equb rotating credit, approved Iddir mutual aid, and configured CBE/Telebirr payout accounts.
- **Automated Payment Routing**: When making condominium fee payments, the verified condominium destination account (CBE account number or Telebirr merchant ID) is automatically populated as read-only information.
- **Payout Destination Hub (`/resident/accounts`)**: Residents configure authorized CBE or Telebirr accounts for receiving Equb lottery pots and community disbursements.
- **Thumb-Friendly Bottom Bar**: Seamless access on mobile screens to **Home**, **Payments**, **Lost & Found**, **Promotions**, and **Notices**.

### 2. 🏢 Condominium Admin Console
- **Treasury & Operational Funds**: Displays active funds scoped to the condominium, primary account designation, and transaction logs.
- **Account Transaction History Modal**: Displays all inflows (resident dues, service charges) and outflows (maintenance, payouts) linked to the account.
- **Payment Verification Queue**: Admin approves or rejects pending submissions, automatically crediting the destination balance upon approval.
- **Equb & Iddir Operations**: Admin creates rotating cycles, approves member applications, runs lotteries, and disburses payouts.

### 3. 👑 Super Administrator Console
- **System-Wide Revenue Aggregation**: Live calculation of total operational funds across all registered condominiums in Ethiopia.
- **Multi-Condominium Account Directory**: Overview of registered accounts across all condominiums with filter dropdown by condominium.
- **Platform Governance**: Condominium registration, building structure management, and platform-wide announcements.

---

## 🔒 Security & Protected Routing
1. **Stateless JWT Storage**: Tokens are stored in secure browser storage and attached automatically to outgoing API requests via Axios request interceptors (`Authorization: Bearer <token>`).
2. **Declarative Route Guards**: `AppRoutes.jsx` verifies authentication status and user roles, preventing unauthorized cross-role access.
3. **Automatic Redirection**: Any unauthenticated attempt to access dashboard routes immediately redirects to `/login`.

---

## 🧠 Key Design Decisions
- **Unified Clean Authentication**: Single `/login` and `/register` views prevent confusion between resident and administrative access.
- **Material UI with Responsive Breakpoints**: High-density desktop grids adapt smoothly into mobile cards and swipeable sheets for resident mobile use.
- **Safe Response Normalization**: API response adapters safely unpack paginated objects (`data?.data?.items || data?.data || []`), ensuring UI stability even with unassigned or newly registered users.

---

## 🔮 Future Enhancements
- Progressive Web App (PWA) offline caching and home screen install banner.
- Push notifications via Service Workers for instant emergency alerts.
- Multi-language localization (Amharic, Afaan Oromoo, Tigrinya, English).

---

## 📌 Assumptions and Known Limitations
- External banking transfers are simulated through the Zero-Balance Simulator engine.
- Browser local storage is used for token persistence.

---

## 👨‍💻 Authors & Lead Engineers

| Role | Engineer |  |
|:---|:---|:---|
| **Frontend Lead Engineer**| **Singiten Beshada** | 
| **Backend Lead Engineer** | **Shanbel Dires** | 
| **UI/UX Designer** | **Saron Tesfahun** | 

---

## 📄 License
Proprietary software developed for the HomeAxis Condominium Management System. All rights reserved.
