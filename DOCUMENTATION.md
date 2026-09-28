# 📚 Eminence — Complete Project Documentation

> **Next-Generation Commercial Freight Logistics, Real-Time Fleet Telematics & B2B Transport Platform**

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack Reference](#3-tech-stack-reference)
4. [Backend Documentation](#4-backend-documentation)
   - [Entry Points](#41-entry-points)
   - [Database Models](#42-database-models)
   - [REST API Reference](#43-rest-api-reference)
   - [WebSocket & Real-Time Events](#44-websocket--real-time-events)
   - [Background Jobs (Cron)](#45-background-jobs-cron)
   - [Middleware Layer](#46-middleware-layer)
   - [Services Layer](#47-services-layer)
5. [Frontend Documentation](#5-frontend-documentation)
   - [Pages & Routes](#51-pages--routes)
   - [Component Architecture](#52-component-architecture)
   - [State Management](#53-state-management)
   - [Custom Hooks](#54-custom-hooks)
   - [API Service Layer](#55-api-service-layer)
6. [Mobile App Documentation](#6-mobile-app-documentation)
   - [Screen Structure (Expo Router)](#61-screen-structure-expo-router)
   - [Mobile Services Layer](#62-mobile-services-layer)
   - [Hardware Integrations](#63-hardware-integrations)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Testing Infrastructure](#9-testing-infrastructure)
10. [Security Architecture](#10-security-architecture)
11. [Key Business Logic Explained](#11-key-business-logic-explained)
12. [Glossary](#12-glossary)

---

## 1. Project Overview

**Eminence** is a full-stack, production-grade commercial freight dispatch platform covering three surfaces:

| Surface | Technology | Purpose |
|---|---|---|
| **Backend API** | Node.js + Express.js | REST API, WebSockets, Auth, Pricing, Jobs |
| **Web Portal** | React 18 + Vite | Customer booking, Admin ops, Driver dispatching |
| **Mobile App** | React Native + Expo | Driver field companion, Live tracking, WMS scanning |

The platform serves three user roles:
- **Customer / Business**: Books freight trips (web + mobile)
- **Driver**: Accepts & manages trips, tracks earnings (mobile-first)
- **Admin / Dispatcher**: Manages fleet, telematics, and operations (web dashboard)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMINENCE MONOREPO                        │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   React Web      │  │  React Native    │  │  Admin Web   │  │
│  │   (Customer)     │  │  (Driver App)    │  │  (Dispatch)  │  │
│  │ localhost:5173   │  │ localhost:8081   │  │  same origin │  │
│  └────────┬─────────┘  └───────┬──────────┘  └──────┬───────┘  │
│           │                    │                     │          │
│           └────────────────────┴─────────────────────┘          │
│                                │                                │
│                     ┌──────────▼──────────┐                     │
│                     │   Express.js API    │                     │
│                     │  (localhost:3000)   │                     │
│                     │                    │                     │
│                     │  REST  │ Socket.io │                     │
│                     └──────┬─────────────┘                     │
│                            │                                    │
│              ┌─────────────┴───────────────┐                   │
│              │                             │                   │
│    ┌─────────▼─────────┐       ┌───────────▼──────┐           │
│    │ PostgreSQL/SQLite │       │   Redis Cache    │           │
│    │ (Sequelize ORM)   │       │  (In-Mem Fallbk) │           │
│    └───────────────────┘       └──────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Monorepo Folder Structure

```
Eminence/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app factory
│   │   ├── server.js               # HTTP + Socket.io bootstrap
│   │   ├── socket.js               # WebSocket event handlers
│   │   ├── cronJobs.js             # Scheduled background workers
│   │   ├── config/                 # Database pool & runtime config
│   │   ├── controllers/            # Business logic handlers
│   │   ├── middleware/             # Auth, sanitization, audit logging
│   │   ├── models/                 # Sequelize entity definitions
│   │   ├── routes/                 # Express router definitions
│   │   ├── services/               # Pricing, telematics, notifications
│   │   ├── migrations/             # DB schema migrations
│   │   └── seeders/                # DB seed data
│   └── tests/
│       ├── unit/                   # Unit tests (controllers, models)
│       └── integration/            # Integration tests (app.test.js)
│
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Top-level page components
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── redux/                  # Redux Toolkit store & slices
│   │   ├── context/                # React Context providers
│   │   ├── services/               # Centralized Axios API client
│   │   ├── utils/                  # Zod schemas, form helpers
│   │   └── routes/                 # React Router route config
│   └── vite.config.js
│
├── mobile/
│   ├── src/
│   │   ├── app/                    # Expo Router file-based screens
│   │   │   ├── (admin)/            # Admin tab group
│   │   │   ├── (auth)/             # Auth screens
│   │   │   ├── (customer)/         # Customer tab group
│   │   │   ├── (driver)/           # Driver tab group
│   │   │   └── (shared)/           # Shared screens (Terms etc.)
│   │   ├── components/             # Shared mobile components
│   │   ├── services/               # API client, GPS, push, offline sync
│   │   ├── hooks/                  # Custom mobile hooks
│   │   ├── context/                # Auth context
│   │   └── constants/              # App-wide constants
│   └── tests/                      # 31-case mobile QA suite
│
├── test_cases/                     # Advanced QA test case docs
├── run_all_tests.js                # Monorepo pre-commit scorecard
├── CONTRIBUTING.md                 # Setup & installation guide
├── SECURITY.md                     # Security policy & architecture
└── README.md                       # Project overview
```

---

## 3. Tech Stack Reference

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | 4.x | Web framework & REST routing |
| `sequelize` | 6.x | ORM for PostgreSQL + SQLite |
| `pg` / `sqlite3` | Latest | Database drivers |
| `socket.io` | 4.x | WebSocket real-time layer |
| `jsonwebtoken` | 9.x | JWT signing & verification |
| `bcryptjs` | 2.x | Password & hash comparison |
| `helmet` | 7.x | HTTP security headers |
| `express-rate-limit` | 6.x | API rate limiting |
| `ioredis` | 5.x | Redis client (+ in-memory fallback) |
| `pdfkit` | 0.x | PDF generation for payslips & invoices |
| `node-cron` | 3.x | Scheduled background tasks |
| `axios` | 1.x | HTTP client for third-party APIs |
| `nodemailer` | 6.x | Email notification delivery |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `vite` | 8.x | Build tool & dev server |
| `react-router-dom` | 6.x | Client-side routing |
| `redux-toolkit` | 2.x | State management |
| `axios` | 1.x | Centralized HTTP client |
| `socket.io-client` | 4.x | Real-time WebSocket client |
| `react-leaflet` | 4.x | OpenStreetMap interactive maps |
| `recharts` | 2.x | Analytics charts & graphs |
| `framer-motion` | 11.x | Micro-animations |
| `lucide-react` | Latest | Icon library |
| `zod` | 3.x | Form schema validation |
| `i18next` | Latest | Internationalization support |

### Mobile
| Package | Version | Purpose |
|---|---|---|
| `expo` | 57.x | React Native toolchain |
| `expo-router` | 4.x | File-based screen routing |
| `expo-location` | Latest | Foreground & background GPS |
| `expo-task-manager` | Latest | Background tasks engine |
| `expo-notifications` | Latest | Push notification delivery |
| `expo-secure-store` | Latest | Encrypted credential storage |
| `expo-local-authentication` | Latest | FaceID / Fingerprint biometrics |
| `expo-camera` | Latest | Camera for PoD & barcode |
| `expo-sqlite` | Latest | Offline-first local database |
| `@react-native-community/netinfo` | Latest | Network connectivity detection |

---

## 4. Backend Documentation

### 4.1 Entry Points

| File | Description |
|---|---|
| `src/server.js` | Main entry point. Creates HTTP server, binds Socket.io, starts cron jobs, syncs DB, seeds demo data |
| `src/app.js` | Express app factory. Registers all middleware (Helmet, CORS, rate-limit, sanitization) and mounts all routers |
| `src/socket.js` | Socket.io event handler. Manages `telematics`, `chat`, and `tracking` namespaces with JWT room guards |
| `src/cronJobs.js` | Runs Node-cron workers: driver allocation, health checks, and maintenance warnings |

### 4.2 Database Models

| Model | Table | Key Fields | Relations |
|---|---|---|---|
| `Customer` | `customers` | id, name, phone, email, governmentId (hashed), walletId | hasOne Wallet, hasMany Bookings |
| `Driver` | `drivers` | id, name, phone, vehicleId, isAvailable, isActive, earnings | belongsTo Vehicle, hasMany Bookings |
| `Vehicle` | `vehicles` | id, type, regNumber, status, fuelType, capacity | hasOne Driver |
| `Booking` | `bookings` | id (EM-XXX), customerId, driverId, status, estimatedFare, distanceKm, stops (JSON), esgEmissions | belongsTo Customer, Driver |
| `Wallet` | `wallets` | id, customerId, balance | belongsTo Customer, hasMany Transactions |
| `Transaction` | `transactions` | id, walletId, type, amount, description | belongsTo Wallet |
| `Invoice` | `invoices` | id, bookingId, customerId, amount, gst, status | belongsTo Booking |
| `B2BContract` | `b2b_contracts` | id, companyName, creditLimit, billingCycle, status | hasMany Invoices |
| `Review` | `reviews` | id, bookingId, driverId, rating, comment | belongsTo Booking, Driver |
| `Notification` | `notifications` | id, userId, userType, type, message, isRead | polymorphic userId |
| `AuditLog` | `audit_logs` | id, userId, role, action, resource, ip, metadata | append-only |
| `SupportChat` | `support_chats` | id, customerId, message, sender, timestamp | belongsTo Customer |
| `Inventory` | `inventories` | id, bookingId, barcode, itemName, quantity, status | belongsTo Booking |
| `Otp` | `otps` | id, phone, code, expiresAt, used | - |
| `Admin` | `admins` | id, email, passwordHash, role | - |
| `UserConsent` | `user_consents` | id, userId, consentType, timestamp | DPDP compliance |
| `PlatformConfig` | `platform_configs` | id, brandName, primaryColor, logoUrl | White-label config |

### 4.3 REST API Reference

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | ❌ | Send OTP to phone via Fast2SMS |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify OTP & issue JWT cookie |
| `POST` | `/api/auth/register` | ❌ | Register new customer |
| `GET` | `/api/auth/profile` | ✅ Customer | Get authenticated customer profile |
| `PUT` | `/api/auth/update-profile` | ✅ Customer | Update name, email, city |
| `DELETE` | `/api/auth/data` | ✅ Customer | DPDP "Right to be Forgotten" — anonymize PII |
| `POST` | `/api/auth/logout` | ✅ | Clear JWT HttpOnly cookie |

#### 🚚 Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | ✅ Customer | Create a new booking (multi-stop, ESG calc, PoD hash) |
| `GET` | `/api/bookings` | ✅ Customer | List all bookings for authenticated customer |
| `GET` | `/api/bookings/:id` | ✅ Customer | Get a single booking with all stops |
| `PUT` | `/api/bookings/:id/status` | ✅ Driver | Progress trip: Accept → Arrive → Transit → Complete |
| `POST` | `/api/bookings/pool` | ✅ Customer | Join LTL pooling engine for shared freight |
| `POST` | `/api/bookings/payment/verify` | ✅ Customer | Verify Razorpay payment against booking |

#### 🚗 Drivers (`/api/drivers`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/drivers` | ✅ Admin | List all registered drivers |
| `GET` | `/api/drivers/:id` | ✅ Admin | Get driver profile + vehicle + stats |
| `PUT` | `/api/drivers/:id/duty` | ✅ Driver | Toggle duty status (active/inactive) |
| `GET` | `/api/drivers/:id/payslip` | ✅ Driver | Get payslip JSON for current period |
| `GET` | `/api/drivers/:id/payslip/download` | ✅ Driver | Download branded PDF payslip |
| `GET` | `/api/drivers/:id/earnings` | ✅ Driver | Get weekly/daily earnings breakdown |

#### 📊 Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/overview` | ✅ Admin | KPIs: revenue, bookings, active drivers |
| `GET` | `/api/analytics/surge` | ✅ Admin | Real-time surge multiplier (cached 15s) |
| `GET` | `/api/analytics/utilization` | ✅ Admin | Driver utilization % & peak hours |
| `GET` | `/api/analytics/sla` | ✅ Admin | Server uptime, heap, DB latency ping |
| `GET` | `/api/analytics/audit-logs` | ✅ Admin | Paginated AuditLog viewer |
| `GET` | `/api/analytics/export-bookings` | ✅ Admin | Full booking export (CSV/PDF-ready JSON) |
| `GET` | `/api/analytics/platform-config` | ❌ | White-label brand config for CSS injection |
| `PUT` | `/api/analytics/platform-config` | ✅ Admin | Update platform branding |

#### 💰 Wallet (`/api/wallet`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/wallet` | ✅ Customer | Get wallet balance + recent transactions |
| `POST` | `/api/wallet/topup` | ✅ Customer | Add funds via Razorpay or direct credit |
| `POST` | `/api/wallet/deduct` | ✅ Internal | Deduct balance for a completed trip |

#### 🏢 B2B (`/api/b2b`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/b2b/register` | ❌ | Corporate account onboarding |
| `GET` | `/api/b2b/contracts` | ✅ Business | List enterprise contracts |
| `GET` | `/api/b2b/invoices` | ✅ Business | Get invoices for billing cycle |
| `POST` | `/api/b2b/expense/approve` | ✅ Manager | Approve or reject employee expense |

#### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | ✅ Customer | Get paginated notification history |
| `PUT` | `/api/notifications/:id/read` | ✅ Customer | Mark single notification as read |
| `PUT` | `/api/notifications/read-all` | ✅ Customer | Mark all unread notifications as read |

#### ⭐ Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | ✅ Customer | Submit rating + comment for a completed trip |
| `GET` | `/api/reviews/driver/:id` | ❌ | Fetch all reviews for a driver |

#### 🔗 Integrations (`/api/integrations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/integrations/razorpay-order` | ✅ Customer | Create Razorpay payment order |
| `POST` | `/api/integrations/razorpay-webhook` | Webhook | HMAC-verified payment status webhook |
| `POST` | `/api/integrations/whatsapp` | ✅ Admin | Trigger WhatsApp booking notification |

#### 🩺 Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Returns `{ success: true, message: "EMINENCE API is running" }` |

---

### 4.4 WebSocket & Real-Time Events

The WebSocket layer is powered by Socket.io with JWT middleware validation at handshake.

#### Namespaces & Events

**Default Namespace `/`**

| Event (Client → Server) | Description |
|---|---|
| `join_tracking` | Customer joins a specific trip tracking room `trip_{bookingId}` |
| `location_update` | Driver emits real-time GPS coordinates `{ lat, lng, speed }` |
| `chat_message` | Customer/Admin sends a support chat message |
| `join_admin` | Admin authenticates to receive telematics + inbox streams |

| Event (Server → Client) | Description |
|---|---|
| `driver_location` | Broadcast GPS update to trip tracking room |
| `chat_message` | Broadcast support message to chat room |
| `telematics_update` | Stream OBD-II telemetry `{ speed, rpm, temp, fuel }` to admin |
| `maintenance_alert` | Alert sent when temp or RPM exceeds safe thresholds |

---

### 4.5 Background Jobs (Cron)

| Job | Schedule | Description |
|---|---|---|
| **Driver Allocation** | Every 30 seconds | Scans unassigned bookings, queries nearest available driver using Haversine formula, auto-assigns |
| **Telematics Simulator** | Every 2 seconds | Generates mock OBD-II telemetry for vehicles and broadcasts via Socket.io |
| **Health Monitor** | Every 60 seconds | Checks DB latency, emits `HIGH_DB_LATENCY` alert if > 500ms |

---

### 4.6 Middleware Layer

| Middleware | File | Description |
|---|---|---|
| **Authentication Guard** | `middleware/auth.js` | Verifies JWT from HttpOnly cookie or `Authorization` header. Sets `req.user`. |
| **Role Guard** | `middleware/roles.js` | Checks `req.user.role` against allowed roles for a route. Returns 403 if mismatch. |
| **Request Sanitizer** | `middleware/requestValidator.js` | HTML entity-encodes all string fields in `req.body` to prevent XSS. |
| **Audit Logger** | `middleware/auditLogger.js` | Logs POST/PUT/PATCH/DELETE admin actions with redacted sensitive keys to AuditLog table. |
| **Rate Limiter** | `middleware/rateLimiter.js` | IP-based rate limiting (100 req/15min globally, 10 req/min for auth routes). |

---

### 4.7 Services Layer

| Service | File | Description |
|---|---|---|
| **Cache Service** | `services/cacheService.js` | Redis-backed LRU cache with automatic in-memory Map fallback. Namespaced by key prefix. |
| **Email Service** | `services/emailService.js` | Nodemailer-based transactional email (booking confirmations, driver alerts). |
| **SMS Service** | `services/smsService.js` | Fast2SMS OTP delivery integration. |
| **Telematics Simulator** | `services/telematicsSimulator.js` | Generates simulated OBD-II telemetry data (speed 0-120 km/h, RPM 800-4000, temperature, fuel). |
| **Pooling Engine** | `services/poolingEngine.js` | LTL matching algorithm: finds bookings with overlapping routes to share truck capacity and split fares. |
| **Route Optimizer** | `services/routeOptimizer.js` | TSP (Traveling Salesperson Problem) heuristic solver for optimizing multi-stop delivery sequences. |
| **AI Forecasting** | `services/aiForecasting.js` | Demand heatmap simulator that scores geographic zones by predicted booking velocity. |

---

## 5. Frontend Documentation

### 5.1 Pages & Routes

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `Home.jsx` | ❌ | Marketing landing page with 3D Spline UI |
| `/login` | `Login.jsx` | ❌ | OTP-based customer phone login |
| `/register` | `Register.jsx` | ❌ | New customer registration |
| `/complete-profile` | `CompleteProfile.jsx` | ✅ | Post-registration profile completion |
| `/dashboard` | `CustomerDashboard.jsx` | ✅ Customer | Main customer dashboard (bookings, wallet, notifications, ESG) |
| `/booking` | `Booking.jsx` | ✅ Customer | Multi-step freight booking builder (incl. AI voice & Razorpay) |
| `/tracking/:id` | `Tracking.jsx` | ✅ Customer | Real-time trip tracking with Leaflet map & telematics dials |
| `/admin/login` | `AdminLogin.jsx` | ❌ | Admin email/password login |
| `/admin` | `AdminDashboard.jsx` | ✅ Admin | Tabbed admin hub (Overview, Fleet, Telematics, Chat, Audit) |
| `/driver` | `DriverDashboard.jsx` | ✅ Driver | Driver operations panel (duty toggle, active trip, earnings) |
| `/business` | `BusinessDashboard.jsx` | ✅ Business | B2B account hub (bookings, invoices, expenses, approvals) |
| `/contracts` | `BusinessContracts.jsx` | ✅ Business | Contract management & credit terms |
| `/pricing` | `Pricing.jsx` | ❌ | Public enterprise pricing page |
| `/services` | `Services.jsx` | ❌ | Service offerings overview |
| `/about` | `About.jsx` | ❌ | About page |
| `/contact` | `Contact.jsx` | ❌ | Contact form |
| `/terms` | `Terms.jsx` | ❌ | Terms & conditions with consent tracking |

---

### 5.2 Component Architecture

```
components/
├── Admin/
│   ├── tabs/             # Modular admin dashboard tabs
│   │   ├── OverviewTab   # KPI metrics and charts
│   │   ├── FleetTab      # Driver & vehicle management
│   │   ├── TelematicsTab # Live IoT dials (Speed, RPM, Temp, Fuel)
│   │   ├── ChatTab       # Support inbox (Socket.io)
│   │   └── AuditTab      # Paginated audit log viewer
│   └── hooks/            # useAdminDashboard, useTelemetry, useChat
│
├── Auth/
│   └── OTPVerification   # 6-digit OTP input with auto-submit
│
├── Booking/
│   ├── StepIndicator     # Multi-step booking progress bar
│   ├── VehicleSelector   # Tempo type selection cards
│   ├── MultiStopForm     # Dynamic add/remove stop input fields
│   └── VoiceBooking      # Web Speech API AI voice input
│
├── Customer/
│   ├── WalletWidget      # Balance display + transaction history
│   ├── BookingHistory    # Past trip cards with invoice download
│   ├── NotificationBell  # Unread badge + dropdown history
│   └── ESGWidget         # Carbon emission savings badge
│
├── Driver/
│   ├── DutyToggle        # Active/Inactive switch
│   ├── ActiveTripCard    # Current trip progress + status update
│   └── EarningsChart     # Daily/weekly earnings bar chart
│
├── Maps/
│   ├── TrackingMap       # Leaflet map with real-time driver marker
│   └── HeatmapOverlay    # Demand zone color visualization
│
├── Common/
│   ├── Navbar            # Responsive navigation with role-aware links
│   ├── Footer            # Site footer with document links
│   ├── TermsModal        # DPDP consent modal
│   └── LoadingSpinner    # Global loading state component
│
└── Payment/
    └── RazorpayModal     # Payment checkout wrapper
```

---

### 5.3 State Management

Eminence uses **Redux Toolkit** for global state with the following slices:

| Slice | State Keys | Description |
|---|---|---|
| `authSlice` | `user`, `role`, `isAuthenticated` | Persisted session info from JWT profile fetch |
| `bookingSlice` | `currentBooking`, `stops`, `vehicleType`, `fare` | Active booking builder state |
| `driverSlice` | `location`, `status`, `activeTripId` | Driver duty & location state |
| `notificationSlice` | `notifications`, `unreadCount` | Real-time notification list |

React Context is also used for localized state:
- **`AuthContext`** — lightweight auth checks for routing
- **`ThemeContext`** — light/dark mode toggling

---

### 5.4 Custom Hooks

| Hook | Location | Description |
|---|---|---|
| `useSocket` | `hooks/useSocket.js` | Creates and manages a Socket.io connection, auto-disconnects on unmount |
| `useDriverLocation` | `hooks/useDriverLocation.js` | Subscribes to real-time driver GPS events via Socket |
| `useAdminDashboard` | `components/Admin/hooks/` | Manages tab state, data fetching, and admin-specific Socket subscriptions |
| `useWallet` | `hooks/useWallet.js` | Fetches and refreshes wallet balance and transactions |
| `useNotifications` | `hooks/useNotifications.js` | Polls and manages notification list + unread badge count |

---

### 5.5 API Service Layer

All HTTP requests route through a **centralized Axios instance** (`src/services/api.js`):

```javascript
// Base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Required for HttpOnly JWT cookies
  headers: { 'Content-Type': 'application/json' }
});
```

Key features of the API service:
- **Auto-cookie handling**: `withCredentials: true` ensures the JWT HttpOnly cookie is sent on every request.
- **401 Interceptor**: Automatically redirects to `/login` on authentication expiry.
- **Centralized base URL**: Driven by the `VITE_API_URL` environment variable for easy environment switching.

---

## 6. Mobile App Documentation

### 6.1 Screen Structure (Expo Router)

The mobile app uses **file-based routing** via Expo Router 4.x. Screens are organized into tab groups by user role:

```
src/app/
├── index.tsx                    # Root redirect (role-based)
├── _layout.tsx                  # Root layout (global providers)
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx                # OTP phone login
│   └── admin-login.tsx          # Admin email login
│
├── (customer)/
│   ├── _layout.tsx              # Bottom tab navigation
│   ├── dashboard.tsx            # Customer bookings, wallet, ESG
│   ├── book.tsx                 # Freight booking builder
│   ├── track.tsx                # Real-time trip tracking map
│   └── business.tsx             # B2B account view
│
├── (driver)/
│   ├── _layout.tsx              # Driver tab navigation
│   ├── dashboard.tsx            # Duty toggle + active trip
│   ├── heatmap.tsx              # AI demand surge heatmap
│   └── scanner.tsx              # WMS barcode camera scanner
│
├── (admin)/
│   ├── _layout.tsx
│   ├── dashboard.tsx            # Fleet overview
│   ├── fleet.tsx                # Driver & vehicle management
│   ├── telematics.tsx           # Live IoT dial gauges
│   ├── support.tsx              # Customer chat inbox
│   └── audit.tsx                # Audit log viewer
│
└── (shared)/
    ├── _layout.tsx
    ├── terms.tsx                # Terms & DPDP consent
    └── explore.tsx              # Feature discovery tab
```

---

### 6.2 Mobile Services Layer

| Service | File | Description |
|---|---|---|
| **API Client** | `services/api.js` | Axios instance pointing to backend. Uses `Constants.expoConfig.hostUri` for dynamic LAN IP resolution. |
| **GPS Telemetry** | `services/locationService.js` | `expo-location` + `expo-task-manager` background location task. Emits coordinates to Socket.io only when driver duty is active. |
| **Push Notifications** | `services/pushService.js` | `expo-notifications` registration, FCM/APNs token extraction, and local notification scheduling. |
| **Offline Sync Engine** | `services/offlineSync.js` | `expo-sqlite` queue for caching failed API calls during network loss. `NetInfo` listener triggers auto-flush on reconnection. |
| **Biometrics** | `services/biometricAuth.js` | `expo-local-authentication` + `expo-secure-store` for FaceID/Fingerprint login flow. |

---

### 6.3 Hardware Integrations

| Feature | Expo Package | Description |
|---|---|---|
| **Background GPS** | `expo-location` + `expo-task-manager` | Tracks driver GPS every 5–10s in background without keeping screen awake |
| **Camera / PoD** | `expo-camera` | Captures photographic Proof of Delivery before trip completion |
| **Barcode Scanner** | `expo-camera` (HTML5 canvas) | Scans WMS warehouse barcode QR codes at cargo pickup |
| **Biometric Auth** | `expo-local-authentication` | FaceID / Fingerprint for passwordless OTP bypass |
| **Push Alerts** | `expo-notifications` | OS-level push for ride requests and status changes |
| **Wake Lock** | `expo-keep-awake` | Prevents screen sleep during active navigation |
| **Secure Storage** | `expo-secure-store` | AES-encrypted device keychain for JWT token persistence |
| **Offline DB** | `expo-sqlite` | Local SQLite for PoD and form caching during connectivity loss |

---

## 7. Data Flow Diagrams

### Customer Booking Flow

```
Customer → Select Stops/Vehicle → Zod Validation
         → POST /api/bookings
         → Backend: ESG Calc + PoD SHA-256 Hash + Surge Check
         → Booking Created (status: "Pending")
         → Cron Job (every 30s): Haversine query → Nearest Driver
         → Driver Assignment (status: "Assigned")
         → Socket.io → Driver App: New Ride Alert
         → Driver Accepts → status: "In-Transit"
         → Socket.io → Customer Web: Live GPS Updates
         → Driver Completes → status: "Completed"
         → Invoice Generated → Wallet Deducted → Review Prompt
```

### Real-Time Telematics Flow

```
Backend Cron (every 2s)
  → TelematicsSimulator.generate()
  → { speed, rpm, temp, fuel } payload
  → socket.emit('telematics_update')
  → Admin Socket.io Room (authenticated)
  → AdminDashboard TelematicsTab
  → Live Dial Gauges update (Speed, RPM, Temp, Fuel)
  → IF temp > 100°C OR rpm > 5000:
      → socket.emit('maintenance_alert')
      → Driver Mobile: High-priority overlay alert
```

### OTP Login Flow

```
User enters phone
  → POST /api/auth/send-otp
  → Fast2SMS API call (6-digit OTP, 5min TTL)
  → OTP stored in DB (hashed)
  
User enters OTP
  → POST /api/auth/verify-otp
  → DB lookup + expiry check
  → OTP marked as used (single-use)
  → JWT signed (HMAC-SHA256, 7 day TTL)
  → Set-Cookie: HttpOnly, SameSite=Lax, Secure
  → Customer profile returned
```

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | API server port (default: `3000`) |
| `JWT_SECRET` | ✅ | Min 32-char random hex. **Never hardcode in prod.** |
| `DATABASE_URL` | Conditional | PostgreSQL connection string. Required if `USE_SQLITE=false`. |
| `USE_SQLITE` | ✅ | `true` = local SQLite zero-config mode. `false` = PostgreSQL. |
| `DEMO_SEED` | Optional | `true` = auto-seed demo admin, customer, and driver on startup. |
| `RAZORPAY_KEY_ID` | Optional | Razorpay test/live key ID for payments |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret for server-side order creation |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | HMAC-SHA256 signature for webhook verification |
| `FAST2SMS_API_KEY` | Optional | SMS OTP delivery key from fast2sms.com |
| `REDIS_URL` | Optional | Redis connection string. Falls back to in-memory if not set. |
| `SMTP_HOST` | Optional | Email server hostname for Nodemailer |
| `SMTP_USER` | Optional | Email account username |
| `SMTP_PASS` | Optional | Email account password |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g., `http://localhost:3000`) |

---

## 9. Testing Infrastructure

Eminence implements a **five-stage monorepo validation pipeline** enforced as a pre-commit hook via `run_all_tests.js`.

### Stage Breakdown

| Stage | Command | What It Tests |
|---|---|---|
| **1. Backend Unit + Integration** | `cd backend && npm test` | Jest: Auth, Booking, Admin, Socket tests (33 cases) |
| **2. Frontend Static Analysis** | `cd frontend && npm run lint` | Oxlint: ESLint rules, unused vars, React best practices |
| **3. Frontend Bundle Compilation** | `cd frontend && npm run build` | Vite production build — catches import errors and circular deps |
| **4. Mobile TypeScript** | `cd mobile && npm run typecheck` | `tsc --noEmit`: Full type correctness validation |
| **5. Mobile QA Integration** | `cd mobile && npm test` | 31-case integration suite across 5 phases |

### Backend Test Suites

| File | Cases | Description |
|---|---|---|
| `tests/unit/admin.test.js` | 8 | Admin controller: overview, surge, utilization, SLA, audit, config |
| `tests/unit/booking.test.js` | 11 | Booking creation, ESG, PoD hash, pooling, fare validation |
| `tests/unit/socket.test.js` | 5 | WebSocket: JWT auth, room joining, role gating, telematics stream |
| `tests/integration/app.test.js` | 2 | Health check + XSS sanitization entity encoding |

### Mobile QA Test Phases

| Phase | Cases | Description |
|---|---|---|
| Auth | 5 | OTP login, biometric bypass, role routing |
| Customer | 8 | Booking creation, tracking, wallet, notifications |
| Driver | 7 | Duty toggle, location emit, payslip, earnings |
| Admin | 6 | Fleet ops, telematics, chat inbox, audit logs |
| Performance | 5 | Background GPS accuracy, offline sync, concurrent API resilience |

---

## 10. Security Architecture

> Full details in [SECURITY.md](SECURITY.md). This section provides a developer-level summary.

| Layer | Implementation |
|---|---|
| **Authentication** | Stateless JWT in HttpOnly SameSite cookies. Signed with HMAC-SHA256. |
| **Authorization** | Express middleware reads `req.user.role` — enforced per-route (`customer`, `driver`, `admin`). |
| **Input Sanitization** | All `req.body` strings passed through HTML entity encoding before reaching controllers. |
| **SQL Injection** | Sequelize ORM uses parameterized prepared statements exclusively. |
| **XSS Prevention** | Content Security Policy via Helmet + server-side entity encoding. |
| **Rate Limiting** | `express-rate-limit`: 100 req/15min globally, 10 req/min on auth routes. |
| **Payment Security** | Razorpay webhook HMAC-SHA256 signature verification on raw request body. |
| **TLS** | NeonDB connections enforce `rejectUnauthorized: true` for certificate verification. |
| **Mobile Secrets** | Tokens stored in `expo-secure-store` (AES-encrypted device keychain). |
| **DPDP Compliance** | `governmentId` and `passwordHash` stripped from all public API responses. Right-to-deletion endpoint fully implemented. |
| **Audit Trail** | Immutable `AuditLog` table captures all admin mutations with IP, role, and timestamp. |

---

## 11. Key Business Logic Explained

### 11.1 Surge Pricing Engine

The surge multiplier is calculated in real-time using the live `activeBookings / availableDrivers` ratio:

```
multiplier = clamp(1.0, 2.5, activeBookings / max(1, availableDrivers))
```

- Cached in-memory for **15 seconds** to prevent repeated DB queries.
- Multiplier is applied to the base fare at the point of booking.

### 11.2 ESG Emissions Calculation

Carbon footprint is computed at booking creation based on vehicle type and distance:

| Vehicle Type | Emission Factor (gCO2/km) |
|---|---|
| 2-Wheeler | 50 |
| Auto/3-Wheeler | 80 |
| Pickup Truck | 120 |
| 14ft Commercial | 350 |

```
esgEmissions (kgCO2) = (distanceKm × emissionFactor) / 1000
```

### 11.3 Blockchain PoD (Proof of Delivery)

At booking creation, a tamper-evident hash is generated:

```javascript
const podHash = crypto
  .createHash('sha256')
  .update(`${bookingId}:${customerId}:${stops}:${timestamp}`)
  .digest('hex');
```

This hash is stored on the booking and can be re-verified post-delivery to confirm cargo was not tampered with.

### 11.4 Driver Allocation (Haversine)

The cron job queries for unassigned bookings, then runs a spatial Haversine distance query against all available drivers. The nearest driver within a configurable radius (default 10km) is auto-assigned.

### 11.5 LTL Pooling Engine

"Less-than-Truckload" pooling finds bookings with overlapping pickup/delivery corridors. It:
1. Groups bookings by geographic proximity of origin zones.
2. Checks combined payload weight against vehicle capacity.
3. Splits the fare proportionally across matched bookings.
4. Assigns a single driver to serve the consolidated route.

---

## 12. Glossary

| Term | Definition |
|---|---|
| **LTL** | Less-Than-Truckload — shared freight booking where multiple customers share a vehicle |
| **PoD** | Proof of Delivery — cryptographic receipt confirming cargo was successfully delivered |
| **ESG** | Environmental, Social & Governance — carbon emission tracking per trip |
| **Telematics** | Real-time vehicle data streaming (speed, RPM, temperature, fuel) over WebSocket |
| **WMS** | Warehouse Management System — barcode-based cargo check-in/check-out |
| **RBAC** | Role-Based Access Control — restricting routes and features by user role |
| **DPDP** | Digital Personal Data Protection (India, 2023) — data privacy compliance framework |
| **OBD-II** | On-Board Diagnostics — vehicle ECU sensor data standard (simulated here) |
| **TSP** | Traveling Salesperson Problem — multi-stop route optimization algorithm |
| **Haversine** | Mathematical formula calculating great-circle distance between two GPS coordinates |
| **HMAC** | Hash-based Message Authentication Code — used for Razorpay webhook signature verification |
| **NeonDB** | Serverless PostgreSQL cloud database provider |
| **Expo Go** | Expo's companion app for testing React Native apps on physical devices without building |
| **Metro** | JavaScript bundler used by React Native / Expo |
| **HttpOnly Cookie** | Browser cookie inaccessible to JavaScript — used to store JWT tokens securely |

---

*Last Updated: September 2026 | Documentation covers the complete Eminence monorepo codebase.*
