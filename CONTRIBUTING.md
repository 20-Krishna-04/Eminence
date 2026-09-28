# Contributing to Eminence

Thank you for your interest in contributing to **Eminence**! Eminence is a dual-channel smart transport booking, commercial fleet telematics, and B2B enterprise logistics platform.

This guide outlines our development workflow, environment setup, testing standards, and pull request guidelines to help you contribute effectively.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Monorepo Architecture](#monorepo-architecture)
- [Local Development Setup](#local-development-setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Web Setup](#3-frontend-web-setup)
  - [4. Mobile (Expo) Setup](#4-mobile-expo-setup)
- [Testing & Quality Assurance](#testing--quality-assurance)
  - [Running the Complete Test Suite](#running-the-complete-test-suite)
  - [Component-Level Testing](#component-level-testing)
- [Coding Standards & Conventions](#coding-standards--conventions)
  - [Backend (Node.js / Express / Sequelize)](#backend-nodejs--express--sequelize)
  - [Frontend (React / Vite / Tailwind CSS)](#frontend-react--vite--tailwind-css)
  - [Mobile (React Native / Expo Router)](#mobile-react-native--expo-router)
- [Git Workflow & Commit Guidelines](#git-workflow--commit-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs & Security Issues](#reporting-bugs--security-issues)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please be respectful, constructive, and collaborative in all communications, issue threads, and pull request reviews.

---

## Prerequisites

Ensure you have the following installed on your development workstation:

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**: Installed and configured
- **PostgreSQL** *(Optional for local dev)*: NeonDB or local PostgreSQL instance. A zero-config SQLite mode is also provided for frictionless offline development.
- **Expo Go** *(Optional for mobile testing)*: On iOS or Android device if testing native mobile features.

---

## Monorepo Architecture

Eminence is structured as a unified monorepo:

```
Eminence/
├── backend/            # Express.js REST API, WebSocket Server & Telematics Engine
│   ├── src/
│   │   ├── config/     # Database, CORS, and environment configurations
│   │   ├── controllers/# Business logic & endpoints
│   │   ├── middleware/ # Auth, rate limiting, and request sanitization
│   │   ├── models/     # Sequelize database models
│   │   ├── routes/     # Express route definitions
│   │   └── services/   # Telematics, AI forecasting, pricing, and notifications
│   └── tests/          # Jest unit and integration tests
├── frontend/           # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/ # Reusable UI components & admin tab modules
│   │   ├── pages/      # Route pages (Admin, Customer, Driver, Business dashboards)
│   │   ├── hooks/      # Modular custom React hooks
│   │   └── services/   # Axios API client & token utilities
│   └── public/         # Static assets
├── mobile/             # React Native + Expo Mobile Application
│   ├── src/
│   │   ├── app/        # Expo Router file-based screens & tabs
│   │   └── services/   # Location tracking, offline SQLite sync, push notifications
│   └── tests/          # Automated 31-case integration test suite (Phases 1–5)
├── run_all_tests.js    # Automated root pre-commit validation script
├── CONTRIBUTING.md     # Contributor guidelines
├── SECURITY.md         # Vulnerability disclosure & security architecture
└── README.md           # Project documentation & overview
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/Ridhesh927/Eminence.git
cd Eminence
```

### 2. Backend Setup

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
3. Configure your `.env` variables:
   - For frictionless offline development, set `USE_SQLITE=true` to use a local SQLite database with automatic schema sync and seeding.
   - For PostgreSQL / NeonDB, provide your connection string in `DATABASE_URL`.
   - Provide a strong string for `JWT_SECRET` (e.g. `openssl rand -hex 32`).
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:3000` (or `PORT` specified in `.env`).

### 3. Frontend Web Setup

1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Verify or create `frontend/.env`:
   ```bash
   VITE_API_URL=http://localhost:3000
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The web dashboard will be available at `http://localhost:5173`.

### 4. Mobile (Expo) Setup

1. Open a new terminal, navigate to the mobile directory, and install dependencies:
   ```bash
   cd mobile
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm start
   ```
3. Press `w` to run in web browser, `a` for Android Emulator, or scan the QR code with **Expo Go** on your physical device.

---

## Testing & Quality Assurance

Eminence enforces strict automated quality gates. Every commit must pass all five verification stages before merging.

### Running the Complete Test Suite

You can execute the entire monorepo test scorecard with a single command from the project root:

```bash
node run_all_tests.js
```

This automated runner executes:
1. **Backend Unit & Integration Tests**: 25+ Jest test cases.
2. **Frontend Static Analysis**: Oxlint static code analysis.
3. **Frontend Production Compilation**: Vite build bundle verification.
4. **Mobile TypeScript Validation**: Full TypeScript typecheck (`tsc --noEmit`).
5. **Mobile QA Integration Suite**: 31 end-to-end integration tests spanning:
   - Phase 1: Foundation & Authentication (OTP, Admin Login, Route Guards, Terms).
   - Phase 2: Customer Workflows (Booking, Route Optimizer, ESG, Saved Addresses, Live GPS).
   - Phase 3: Driver Companion (Duty Toggle, Surge Heatmap, Payslip, WMS Barcode, PoD Hash).
   - Phase 4: Admin & Enterprise (Overview Stats, Revenue Trends, Fleet CRUD, Telematics, SLA).
   - Phase 5: B2B Enterprise & Reviews (Driver Reviews, Corporate Accounts, B2B Invoices).

### Component-Level Testing

To run tests individually during development:

```bash
# Backend Jest Tests
cd backend && npm test

# Frontend Linting & Production Build
cd frontend && npm run lint
cd frontend && npm run build

# Mobile Typecheck & QA Integration
cd mobile && npm run typecheck
cd mobile && npm test
```

---

## Coding Standards & Conventions

### Backend (Node.js / Express / Sequelize)
- **Parameterized Queries**: Always use Sequelize query models or parameterized replacements to prevent SQL injection.
- **Input Sanitization**: Use the shared sanitization middleware in `middleware/requestValidator.js` for all incoming user input.
- **Async Error Handling**: Wrap controller endpoints in `try/catch` blocks and return standard JSON error envelopes: `{ success: false, message: '...' }`.
- **Environment Fallbacks**: Never fall back to insecure default secrets in production. Check `process.env` explicitly.

### Frontend (React / Vite / Tailwind CSS)
- **Modular Components**: Avoid monolithic page files. Keep tab views, modals, and charts in isolated components under `src/components/`.
- **Custom Hooks**: Encapsulate data fetching and socket subscriptions inside dedicated hooks (e.g., `useAdminOverview`, `useTelematics`).
- **Secure Sessions**: Rely on HttpOnly cookies and centralized Axios interceptors (`services/api.js`).

### Mobile (React Native / Expo Router)
- **Type Safety**: Strictly type props, hooks, and API responses. Ensure `tsc --noEmit` produces zero errors.
- **Role-Gated Permissions**: Verify user roles before engaging persistent device hardware (such as background location tracking).
- **Graceful Offline Degradation**: Use the SQLite sync queue (`services/OfflineSync.ts`) to queue mutations when network connectivity drops.

---

## Git Workflow & Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for users or administrators.
- `fix:` A bug fix or security patch.
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `test:` Adding missing tests or correcting existing tests.
- `docs:` Documentation changes only.
- `chore:` Routine repository maintenance or tooling changes.

**Example**:
```bash
git commit -m "fix(security): enforce RAZORPAY_WEBHOOK_SECRET and remove insecure fallback (Issue 18)"
```

---

## Submitting a Pull Request

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Implement Your Changes**: Write clean, modular, and documented code.
3. **Run All Tests**:
   ```bash
   node run_all_tests.js
   ```
   Ensure all 5 scorecard checks pass.
4. **Push & Open PR**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **PR Description**: Include a clear summary of changes, rationale, linked issue numbers, and test confirmation.

---

## Reporting Bugs & Security Issues

- **General Bugs**: Open an issue on GitHub using the bug report template. Include reproduction steps, environment details, and expected vs. actual behavior.
- **Security Vulnerabilities**: Refer to our [SECURITY.md](SECURITY.md) for responsible disclosure procedures.
