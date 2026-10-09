# Eminence Project Context & Guidelines

## 1. Project Overview
- **Name & Goal**: "Eminence" is a university engineering project focused on a "Smart Transport Booking and Helpline Management System with Voice-Assisted Booking and Real-Time Tracking."
- **Structure**: It is a monorepo containing three main directories: 
  - `backend` (Node.js/Express)
  - `frontend` (React.js/Vite Web Portal)
  - `mobile` (React Native/Expo app for Drivers/Customers)
- **Scope Restriction**: The "B2B" (Business-to-Business) logic has been completely removed from the project scope. Do not try to restore or reference B2B flows.

## 2. Architecture & Tech Stack
- **Authentication**: Uses JWT and bcrypt. Both web and mobile support Customer Phone OTP login and Google Sign-in. Admins log in via email. Fast2SMS is used for OTPs (currently relying on the "Testing Route" with verified numbers).
- **Real-Time / WebSockets**: Uses `Socket.io` for live GPS tracking and the Helpline chat module.
- **Simulations**: We use a "Simulated Telemetry Engine" in the backend to broadcast fake OBD-II vehicle data (speed, engine temp, RPM, fuel) and GPS coordinates via WebSockets. 
  - **CRITICAL RULE**: Never delete or "fix" this simulation logic by removing it; it is the required proof-of-concept for physical IoT hardware.
- **Algorithms**: Calculates ESG CO₂ emission estimates based on standard EPA distance formulas.

## 3. Development Rules
- **Testing**: All QA documentation is consolidated into a single file at `test_cases/web_full_test_suite.md`. Do not scatter test cases.
- **Payments**: We use Razorpay test mode keys (`rzp_test_`).
- **Feature Complexity**: When asked to add new features, keep them highly complex and architectural (like predictive maintenance or NLP) rather than basic CRUD, as this is graded on engineering complexity.
- **Safety**: Do not delete local system files or modify anything outside of the Eminence workspace directory.
