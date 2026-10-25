# HomeAxis Frontend — Next-Gen Condominium Management Portal & Resident Experience

A modern, responsive, mobile-first web portal for the **HomeAxis Condominium Management System**, built with React 18, Material UI (MUI), and real-time Socket.IO communication.

---

## 📱 Portals & Key Features

### 1. 🏡 Resident Portal (Mobile-First Experience)
- **Fixed Bottom Navigation Bar**: Clean, thumb-friendly navigation bar on mobile viewports covering **Home**, **Payments**, **Lost & Found**, **Promotions**, and **Alerts**, safely positioned above device safe areas.
- **Verified Financial Status Cards**:
  - **Equb Rotating Savings**: Displays active enrolled group names, pending approval badges, and verified ETB contribution sums.
  - **Iddir Mutual Aid**: Displays membership status and verified contribution totals.
  - **Payout Destination**: Displays configured payout provider and masked account number (`Ethio Telecom Telebirr (••••2212)`) with direct tap-to-configure routing.
- **Automatic Payment Routing**: Official Condominium Destination card that automatically displays the verified condominium destination account based on the selected payment method (CBE, Telebirr, etc.).
- **Community Modules**: Lost & Found reporting, promotions marketplace, incident reporting, and real-time announcements.

### 2. 🏢 Condominium Admin Console
- **Condominium Treasury & Accounts Hub**: Real-time banner displaying operational funds scoped to the condominium code, primary account designation, and an interactive **Account Transaction History Modal** displaying all inflows and outflows.
- **Resident & Unit Management**: Building blocks, apartment rooms, occupancy management, and resident profile verification.
- **Community Finance Management**: Equb rounds, winner lotteries, payout disbursements, and Iddir mutual aid emergency claims.
- **Payment Approvals**: Pending resident payment queue with one-click verification and automated destination balance crediting.

### 3. 👑 Super Administrator Console
- **System-Wide Revenue Performance**: Real-time aggregated revenue metrics calculated across all condominiums.
- **Multi-Condominium Treasury Console**: Overview of registered accounts across all condominiums with filter dropdown by condominium and official account registration dialog.
- **Platform Governance**: Condominium registration, building structure management, and system-wide broadcast management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Framework & UI** | React 18 / Material UI (MUI v5) / Emotion |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (with Bearer Token Interceptors) |
| **Real-Time Client**| Socket.IO Client |
| **Icons & Design** | Material Icons / Custom SVG Icons |
| **Responsive Design**| Mobile-First Breakpoints & MUI Grid System |

---

## 👥 Authors & Lead Engineers

| Role | Engineer | Contact & Profiles |
|:---|:---|:---|
| **Frontend Lead Engineer**| **Singiten Beshada** | [singiten2127@gmail.com](mailto:singiten2127@gmail.com) • [GitHub: @singiten](https://github.com/singiten) |
| **Backend Lead Engineer** | **Shanbel Dires** | [shanbeldires7@gmail.com](mailto:shanbeldires7@gmail.com) |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Backend API Base URL
REACT_APP_API_URL=http://localhost:3000/api

# Real-Time WebSocket Server URL
REACT_APP_SOCKET_URL=http://localhost:3000

# Port Configuration
PORT=3001
```

---

## 🚀 Getting Started & Available Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm start
```
Runs the application on [http://localhost:3001](http://localhost:3001).

### 3. Build for Production
```bash
npm run build
```
Bundles production-ready assets into the `build/` folder with optimal minification and asset hashing.

### 4. Run Test Suite
```bash
npm test
```

---

## 📁 Directory Structure

```
src/
├── api/                    # Axios client configuration & API service contracts
├── components/             # Reusable UI components
│   ├── chat/              # Real-time chat & messaging widgets
│   ├── common/            # Sidebar, Header, Mobile Bottom Nav, Stats Cards
│   └── user/              # User modal dialogs & forms
├── context/               # Global state contexts (AuthContext, SocketContext)
├── layouts/               # Role-based shell layouts
│   ├── ResidentLayout.jsx # Mobile-first resident shell with bottom navigation
│   ├── CondoAdminLayout.jsx # Condominium management shell with sidebar
│   └── SuperAdminLayout.jsx # Platform oversight shell
├── pages/                 # Role-specific view components
│   ├── resident/          # Dashboard, Payments, Accounts, Reports, Lost & Found
│   ├── condo-admin/       # Dashboard, Accounts, Residents, Blocks, Equb, Iddir
│   └── super-admin/       # Dashboard, Accounts, Condos, Users, Payments
├── routes/                # Role-based route guard and route definitions (AppRoutes.jsx)
└── services/              # API interaction abstractions
```

---

## 📄 License
Proprietary software for HomeAxis Condominium Management System. All rights reserved.
