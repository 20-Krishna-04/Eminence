# Eminence — Complete Setup & Installation Guide

This guide walks you through setting up the complete **Eminence** monorepo from scratch, including the Node.js/Express backend, the React/Vite web application, the React Native/Expo mobile application, databases, and testing tools.

---

## 📋 Table of Contents

- [System Prerequisites](#system-prerequisites)
- [Monorepo Architecture](#monorepo-architecture)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Detailed Component Setup](#detailed-component-setup)
  - [1. Backend Setup](#1-backend-setup)
    - [Database Options (SQLite vs PostgreSQL/NeonDB)](#database-options-sqlite-vs-postgresqlneondb)
    - [Environment Variables (.env)](#environment-variables-env)
    - [Starting the Backend](#starting-the-backend)
  - [2. Frontend Web Setup](#2-frontend-web-setup)
    - [Environment Variables](#environment-variables)
    - [Starting the Frontend](#starting-the-frontend)
  - [3. Mobile Application Setup (Expo)](#3-mobile-application-setup-expo)
    - [Running on Expo Go (Physical Device)](#running-on-expo-go-physical-device)
    - [Running on Web Browser](#running-on-web-browser)
    - [Running on Android / iOS Simulators](#running-on-android--ios-simulators)
- [Testing & Quality Verification](#testing--quality-verification)
  - [Running the Full Test Suite](#running-the-full-test-suite)
  - [Component-Level Test Commands](#component-level-test-commands)
- [Default Demo Credentials & Ports](#default-demo-credentials--ports)
- [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 💻 System Prerequisites

Before starting, ensure your system has the following tools installed:

| Requirement | Minimum Version | Recommended | Notes |
|---|---|---|---|
| **Node.js** | `v18.0.0` | `v20.x LTS` | [Download Node.js](https://nodejs.org/) |
| **npm** | `v9.0.0` | `v10.x` | Comes bundled with Node.js |
| **Git** | `v2.30.0` | Latest | [Download Git](https://git-scm.com/) |
| **PostgreSQL** *(Optional)* | `v14+` | NeonDB / Supabase | Optional; a zero-config SQLite mode is included |
| **Expo Go** *(Optional)* | Latest | Latest | Install on mobile device from App Store / Google Play |

Verify your environment by running:
```bash
node -v
npm -v
git --version
```

---

## 🏗️ Monorepo Architecture

The repository is organized into three decoupled subsystems:

```
Eminence/
├── backend/            # Express.js REST API & WebSocket Telematics Engine
├── frontend/           # React 18 + Vite Web Dashboard (Dispatch, Customer, Admin)
├── mobile/             # React Native (Expo Router) Universal Mobile Application
├── run_all_tests.js    # Automated root pre-commit validation scorecard
├── SETUP.md            # Complete environment setup & deployment instructions
├── SECURITY.md         # Vulnerability disclosure & security architecture
└── README.md           # Project overview & feature breakdown
```

---

## ⚡ Quick Start (Local Development)

If you just want to get up and running locally with zero external database dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/Ridhesh927/Eminence.git
cd Eminence

# 2. Setup and launch Backend (Zero-Config SQLite mode)
cd backend
npm install
cp .env.example .env
npm run dev

# 3. In a second terminal, setup and launch Frontend
cd ../frontend
npm install
npm run dev

# 4. In a third terminal, setup and launch Mobile (Web mode)
cd ../mobile
npm install
npm run web
```

---

## 🔧 Detailed Component Setup

### 1. Backend Setup

The backend handles REST API endpoints, real-time WebSocket telematics, JWT session cookies, pricing calculation, and automated background jobs.

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Environment Variables
Create a local `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```

#### Database Options (SQLite vs PostgreSQL/NeonDB)

Eminence supports two database modes out-of-the-box:

* **Option A: Zero-Config Local SQLite (Recommended for rapid testing)**:
  Set the following in `backend/.env`:
  ```env
  NODE_ENV=development
  PORT=3000
  USE_SQLITE=true
  DEMO_SEED=true
  JWT_SECRET=super_secret_local_dev_key_eminence_32chars
  ```
  *When `USE_SQLITE=true`, the backend automatically provisions a local SQLite file (`backend/eminence_dev.sqlite`) with tables and initial demo accounts seeded automatically.*

* **Option B: Cloud PostgreSQL (NeonDB / Supabase / AWS RDS)**:
  Set the following in `backend/.env`:
  ```env
  NODE_ENV=development
  PORT=3000
  USE_SQLITE=false
  DATABASE_URL=postgresql://username:password@ep-xyz.neon.tech/eminence_db?sslmode=verify-full
  JWT_SECRET=your_production_grade_random_hex_secret
  RAZORPAY_KEY_ID=rzp_test_your_key
  RAZORPAY_KEY_SECRET=your_key_secret
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  ```

#### Starting the Backend
```bash
npm run dev
```
Output will confirm:
```
[Database] Connected successfully.
[Server] Eminence Backend running on http://localhost:3000
[Socket] WebSocket Telematics initialized.
```

---

### 2. Frontend Web Setup

The web application is built with React 18, Vite, and Tailwind CSS. It provides modular dashboard interfaces for Customers, Drivers, Dispatchers, and Superadmins.

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Configure Environment Variables
Verify or create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

#### Starting the Frontend
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

### 3. Mobile Application Setup (Expo)

The mobile companion application is built with React Native and Expo Router. It delivers live trip tracking, driver duty toggling, WMS barcode scanning, dynamic surge heatmaps, and IoT telematics monitoring.

#### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

#### Running on Expo Go (Physical Device)
1. Ensure your mobile device and development computer are connected to the **same local Wi-Fi network**.
2. Start the Expo bundler:
   ```bash
   npx expo start
   ```
3. Open the **Expo Go** app on your phone:
   - **Android**: Tap "Scan QR code" and point your camera at the terminal.
   - **iOS**: Open the native Camera app and tap the prompt to open in Expo Go.

#### Running on Web Browser
To test the mobile interface in your desktop browser:
```bash
npm run web
```
This starts the Metro bundler with web support on `http://localhost:8081`.

#### Running on Android / iOS Simulators
- **Android**: With Android Studio emulator running, press `a` in the Expo terminal.
- **iOS** *(macOS only)*: With Xcode Simulator installed, press `i` in the Expo terminal.

---

## 🧪 Testing & Quality Verification

Eminence features a strict, automated five-stage verification pipeline.

### Running the Full Test Suite
Run the pre-commit scorecard from the project root:
```bash
node run_all_tests.js
```

This synchronously executes all five verification checks:
```
========================================================================
                       PRE-COMMIT SCORECARD                             
========================================================================
 [ PASS ] Backend: Jest Unit & Integration Tests (25 Test Cases)
 [ PASS ] Frontend: Oxlint Static Analysis
 [ PASS ] Frontend: Production Bundle Compilation (Vite)
 [ PASS ] Mobile: TypeScript Typecheck (tsc --noEmit)
 [ PASS ] Mobile: Full QA Integration Test Suite (31 Test Cases across 5 Phases)
========================================================================
```

### Component-Level Test Commands

If working on an isolated subsystem, you can run individual suites:

* **Backend Tests**:
  ```bash
  cd backend && npm test
  ```
* **Frontend Linting & Build**:
  ```bash
  cd frontend && npm run lint
  cd frontend && npm run build
  ```
* **Mobile TypeScript & Integration Tests**:
  ```bash
  cd mobile && npm run typecheck
  cd mobile && npm test
  ```

---

## 🔑 Default Demo Credentials & Ports

When running with `USE_SQLITE=true` and `DEMO_SEED=true`:

| User Role | Username / Identifier | Password / Flow | Portal URL |
|---|---|---|---|
| **Super Admin** | `admin@example.com` | `password123` | `http://localhost:5173/admin/login` |
| **Customer** | `9999999999` (or phone) | OTP Verification (`123456`) | `http://localhost:5173/login` |
| **Driver** | Auto-seeded in fleet | In-app duty toggle | Mobile App / Driver Dashboard |

### Default Service Ports
- **Backend API**: `http://localhost:3000`
- **Frontend Web**: `http://localhost:5173`
- **Mobile Metro Bundler**: `http://localhost:8081`

---

## ❓ Troubleshooting & FAQs

### 1. Backend: Port 3000 is already in use
* **Cause**: Another instance of Node.js or a background process is bound to port 3000.
* **Resolution**: Change `PORT=3001` in `backend/.env` and update `VITE_API_URL=http://localhost:3001` in `frontend/.env`.

### 2. Frontend: Cannot connect to Backend / Network Error
* **Cause**: Backend is not running or CORS blocked the request.
* **Resolution**: Verify the backend is active at `http://localhost:3000/api/health`. Check that `frontend/.env` points to the correct backend host.

### 3. Mobile: Network request failed in Expo Go
* **Cause**: In physical device testing, `localhost` refers to the mobile phone itself, not your development PC.
* **Resolution**: The mobile app automatically resolves the host machine IP via `Constants.expoConfig.hostUri`. Ensure both devices are on the same Wi-Fi network and that your workstation firewall allows inbound traffic on port 3000.

### 4. Database: SSL / TLS Handshake Errors on NeonDB
* **Cause**: Missing or disabled TLS parameters.
* **Resolution**: Ensure your `DATABASE_URL` includes `?sslmode=verify-full`. The backend automatically enforces `rejectUnauthorized: true` with standard trusted root CAs.
