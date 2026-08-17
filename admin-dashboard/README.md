# HomeAxis Admin Dashboard

Super Admin web dashboard frontend for the HomeAxis Condominium Management System.

## Technology Stack

- **React** 19
- **TypeScript**
- **Vite**
- **Tailwind CSS** v4
- **React Router** v7

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` (when backend base URL is available):

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
admin-dashboard/
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── layout/
│   │   └── common/
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── CondoManagement/
│   │   │   └── CondoManagement.tsx
│   │   ├── UserManagement/
│   │   │   └── UserManagement.tsx
│   │   └── PaymentManagement/
│   │       └── PaymentManagement.tsx
│   ├── services/
│   │   ├── api/
│   │   └── types/
│   ├── hooks/
│   ├── context/
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
