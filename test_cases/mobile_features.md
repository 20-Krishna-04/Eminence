# Eminence - Mobile App Test Cases (Driver Companion)

This document focuses exclusively on the testing scenarios for the React Native Mobile App (`mobile`). It outlines step-by-step validations for the driver workflow, telematics, and hardware interactions, using the exact data seeded in your local database.

---

## 1. Authentication & Ride Assignment
**Objective**: Ensure drivers can log in and view their assigned fleet workloads.

### TC-M001: Driver Login & Dashboard
- **Test Data / Credentials**:
  - Driver Phone: `9876543210` (Use any mock OTP, e.g., `123456`)
- **Steps**:
  1. Open the Expo Go app or simulator and load the Eminence Driver App.
  2. Enter the phone number `9876543210` and proceed.
  3. Enter the 6-digit mock OTP on the verification screen.
- **Expected Result**: 
  - Login succeeds and the app navigates to the Driver Home screen.
  - The UI welcomes "Ramesh Kumar" and displays the active assigned vehicle: `MH-12-PQ-1234`.

### TC-M002: Viewing Pending Trips
- **Pre-condition**: Driver is logged in.
- **Steps**:
  1. Navigate to the **"My Trips"** or **"Active Routes"** tab in the bottom navigation bar.
- **Expected Result**: 
  - The app fetches data from the backend.
  - The driver should see the pre-assigned trip (e.g., Swargate to Hinjewadi) listed with its estimated payout, distance, and goods type (Boxes of books).

---

## 2. Active Trip Workflow & Telematics
**Objective**: Validate that a driver can navigate a trip while broadcasting hardware telemetry.

### TC-M003: Starting a Trip & Wake Lock
- **Pre-condition**: Driver has navigated to the Active Trip details screen.
- **Steps**:
  1. Tap the **"Start Trip"** button.
  2. Set the phone down and leave it untouched for 5 minutes.
- **Expected Result**: 
  - The UI updates to "Heading to Pickup".
  - The screen **does not turn off or dim**. The `expo-keep-awake` module correctly forces the device screen to remain on while the trip is active.

### TC-M004: Hardware QA Simulation (Overheat Warning)
- **Pre-condition**: Driver is actively on a trip.
- **Steps**:
  1. Scroll down to the bottom of the dashboard to find the **"QA SENSOR & TELEMETRY SIMULATION"** panel (only visible in development).
  2. Tap the red **"🔥 Inject Telemetry (110°C Overheat)"** button.
- **Expected Result**: 
  - The mobile app immediately displays a full-screen, red high-priority modal overlay: "🚨 HIGH-PRIORITY CRITICAL WARNING".
  - A haptic vibration is triggered on the physical device.
  - Tapping "Acknowledge Hazard" dismisses the modal.

---

## 3. Delivery & Proof of Delivery (PoD)
**Objective**: Test the final mile delivery workflows including scanning and photo capture.

### TC-M005: WMS Barcode Loading
- **Pre-condition**: Driver is at the "Heading to Pickup" step.
- **Steps**:
  1. Tap the **"Arrived at Pickup"** button.
  2. Tap **"Scan Goods / Barcode"**.
  3. Use the device camera to scan any standard QR code or barcode (or simulate a successful scan in the emulator).
- **Expected Result**: 
  - The app processes the scan and marks the manifest items as "Loaded".
  - The trip step progresses to "In Transit to Drop-off".

### TC-M006: Secure OTP Drop-off & Image Capture
- **Pre-condition**: Driver is at the drop-off location.
- **Steps**:
  1. Tap **"Complete Delivery"**.
  2. The app prompts for the receiver's 4-digit OTP. Enter `1234`.
  3. The app opens the camera module. Take a picture of the "delivered" goods.
  4. Submit the delivery flow.
- **Expected Result**: 
  - The trip is successfully marked as `Completed`.
  - The app navigates back to the home screen.
  - The driver's total daily earnings UI updates to reflect the completed trip's payout.
