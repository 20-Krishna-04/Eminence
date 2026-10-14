# Eminence Project Change Record

## Project Purpose

Eminence is a logistics and fleet-management platform for customer bookings, driver operations, administrator dispatch, fleet management, payments, support, tracking, and enterprise B2B workflows.

The repository contains three application surfaces:

- `backend/`: Express, Sequelize, SQLite/PostgreSQL, REST APIs, Socket.IO, authentication, and background services.
- `frontend/`: React/Vite web application for customers, drivers, and administrators.
- `mobile/`: Expo/React Native application for customer, driver, and administrator workflows.

## Changes Completed

### Repository Review and Cleanup

- Reviewed the backend, frontend, mobile application, tests, and project documentation.
- Removed confirmed unused frontend imports, variables, and state bindings.
- Removed unused WebRTC peer state and unused authentication form state.
- Preserved platform services and fallback logic that are actively used by the application or tests.
- Corrected environment loading so explicit process variables are not overwritten by `.env` files.

### Test Environment and Database

- Updated the monorepo test runner to launch its local QA backend with `USE_SQLITE=true`.
- Prevented local integration tests from accidentally connecting to the configured remote PostgreSQL database.
- Added reliable demo seeding support for local development and automated QA.

### Driver and Admin Booking Workflow

- Fixed the driver availability request to use the backend route `PATCH /api/drivers/:id/toggle`.
- Fixed trip acceptance so the authenticated driver is stored on the booking.
- Driver acceptance now moves the booking to `arrived` and sends the driver ID to the backend.
- Restricted drivers so they can only change their own availability.
- Added admin assignment validation:
  - The selected driver must exist.
  - A driver already marked `on_trip` cannot receive another assignment.
- The admin dashboard can assign pending customer bookings to active drivers.
- Assigned bookings are loaded into the driver dashboard through driver metrics.

### Seeded Admin Authentication

- Fixed the missing `bcrypt` import in `backend/src/controllers/adminAuthController.js`.
- Verified that the seeded admin record is created and its password hash validates.
- Verified admin login and protected admin routes.

Local demo credentials are controlled by the project seed configuration. Do not use demo credentials in production.

### Telemetry and IoT Simulation

The project currently has no physical IoT device feed. The telemetry system therefore supports an explicit simulation mode instead of presenting generated values as real device readings.

- Added `backend/src/services/telemetryProvider.js`.
- Added provider selection through environment variables:

```env
TELEMETRY_PROVIDER=simulator
TELEMETRY_SIMULATION_ENABLED=false
```

Supported provider values are:

- `simulator`: generated data for local demos and testing.
- `mqtt`: reserved for a future real-device adapter.
- `none`: disable telemetry until a provider is connected.

Behavior:

- Non-production environments default to the simulator when no provider is configured.
- Production does not generate telemetry unless simulation is explicitly enabled.
- Telemetry payloads identify their source with `provider` and `simulated` fields.
- The backend keeps the latest 30 samples per simulated vehicle in memory.
- The admin web and mobile dashboards display `Simulation`, `Device Stream`, or `No Stream` status.
- The web dashboard displays recent telemetry samples.
- Mobile fallback simulation only runs after the backend explicitly reports simulation mode.
- Documentation now distinguishes simulated telemetry from real device data.

When physical devices are available, add an MQTT or other device adapter behind the telemetry provider boundary and keep the existing dashboard payload shape stable.

## Validation Results

The complete verification process passed after the changes:

- Backend: 43 tests passed.
- Mobile QA: 31 tests passed.
- Frontend lint passed.
- Frontend production build passed.
- Mobile TypeScript check passed.
- Git diff checks passed.

## Relevant Commits

- `58bb95b` — Connect admin assignments to the driver workflow.
- `cefa107` — Enable seeded admin authentication.
- `761c502` — Make telemetry simulation explicit and safe.

## Operational Notes

- Use SQLite for local development and automated tests.
- Use PostgreSQL for staging or production with the appropriate environment configuration.
- Keep `TELEMETRY_SIMULATION_ENABLED=false` in production unless a controlled demonstration is required.
- Never commit real secrets, production credentials, API keys, or private device connection details.
