# Eminence Logistics — Mobile Application (React Native & Expo)

The native companion application for the Eminence Logistics platform, built with **React Native**, **Expo SDK 52**, and **Expo Router**. It serves as an integrated monorepo package alongside `/backend` and `/frontend` web applications.

---

## 📱 Supported Platforms & Modules

- **iOS & Android** (via Expo Go, Development Builds, and standalone APKs/IPAs)
- **Web Browser** (via Expo Web / React Native Web)

### Core Role Portals

| Role | Directory | Key Capabilities |
| :--- | :--- | :--- |
| **Authentication** | `src/app/(auth)/` | Phone OTP login (TC-001), Admin email/password login (TC-002, TC-003), Route guarding (TC-004) |
| **Customer** | `src/app/(customer)/` | Ride history with ESG badges (TC-010, TC-013), standard & multi-stop booking (TC-011, TC-012), address book (TC-014), wallet balance (TC-015), referral code (TC-016), live GPS driver tracking (TC-035) |
| **Driver** | `src/app/(driver)/` | Duty toggle (TC-020), incoming ride cards, trip execution (TC-022, TC-024), WMS barcode scanner (TC-023), AI demand heatmap (TC-021) |
| **Admin** | `src/app/(admin)/` | Overview KPIs (TC-030), 7-day revenue chart (TC-031), driver onboarding (TC-032), vehicle registry (TC-033), IoT telematics (TC-034, TC-035), live support chat (TC-036), audit logs & SLA health (TC-037, TC-051) |

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```
From the interactive terminal:
- Press `a` to launch in the Android Emulator.
- Press `i` to launch in the iOS Simulator.
- Press `w` to open in your web browser.
- Scan the QR code using the **Expo Go** app on a physical device.

---

## 🧪 Automated Test Runners (27 / 27 Tests Passing)

All manual test cases from the project roadmap have automated test runners executing against the running backend server (`http://localhost:3000`):

```bash
# Phase 1: Authentication & Navigation (TC-001 to TC-004)
node tests/phase1_auth_tests.js

# Phase 2: Customer Workflows & Live Tracking (TC-010 to TC-016, TC-035)
node tests/phase2_customer_tests.js

# Phase 3: Driver Companion & Logistics (TC-020 to TC-024)
node tests/phase3_driver_tests.js

# Phase 4: Admin, Telematics & Enterprise (TC-030 to TC-037, TC-044, TC-051)
node tests/phase4_admin_tests.js
```

### Type Checking
```bash
npx tsc --noEmit
```

---

## 🤖 GitHub Actions CI/CD (`.github/workflows/mobile-ci.yml`)

The repository includes an automated Continuous Integration pipeline triggered on every push or pull request affecting the `mobile/` directory:

1. **`validate-mobile`**:
   - Checks out repository on `ubuntu-latest`.
   - Sets up Node.js 20 with npm caching.
   - Runs `npx tsc --noEmit` to ensure **0 TypeScript errors**.
   - Validates Expo project configuration.
2. **`test-mobile-contracts`**:
   - Performs syntax compilation and AST validation across all test suites (`node -c`).
