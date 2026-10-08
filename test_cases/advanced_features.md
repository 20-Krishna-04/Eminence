# Eminence - Web Portal Test Cases (Customer & Admin)

This document focuses exclusively on the testing scenarios for the React Web Portal (`frontend`). It outlines step-by-step validations for customer bookings, gamification, pricing, and the admin tracking dashboard, using the exact data seeded in your local database.

---

## 1. Authentication & Role Navigation
**Objective**: Ensure that web portal sessions route correctly based on user roles.

### TC-W001: Customer Login & Profile Access
- **Test Data / Credentials**:
  - Customer Phone: `1234567890` (Use any mock OTP, e.g., `123456`)
- **Steps**:
  1. Open a browser and navigate to `http://localhost:5173/login`.
  2. Enter the phone number `1234567890`.
  3. Wait for the OTP screen and input the 6-digit verification code.
  4. Click **"Verify OTP"**.
  5. Once logged in, click on the **"Profile"** or avatar icon in the top right.
- **Expected Result**: 
  - You are redirected to the customer dashboard.
  - The profile page correctly loads the seeded user details: Name is "Demo User", and phone is verified.
  [DONE{PASSED}]


### TC-W002: Admin Login & Secure Dashboard
- **Test Data / Credentials**:
  - Admin Email: `admin@eminence.com`
  - Password: `adminpassword123`
- **Steps**:
  1. Navigate to the hidden admin portal: `http://localhost:5173/admin/login`.
  2. Enter the email and password above.
  3. Click **"Login as Administrator"**.
- **Expected Result**: 
  - Redirected to `/admin/dashboard`.
  - The Admin sidebar is fully loaded, displaying options like "Fleet Telematics", "Driver Verification", and "Asset Health".
[DONE{PASSED}]
---

## 2. The Booking Flow & Smart Pricing
**Objective**: Validate the core logistics booking engine on the web.

### TC-W003: Standard Vehicle Booking, Surge Calculation & Payment Flow
- **Pre-condition**: Logged in as Customer (`1234567890`).
- **Steps**:
  1. On the customer dashboard, click **"Book a Vehicle"**.
  2. **Step 1 (Location)**: Enter "Swargate" as pickup and "Kothrud" as drop-off.
  3. **Step 2 (Vehicle & Goods)**: Select "Small Tempo". Enter a mock weight like "250 KG" and select "Furniture".
  4. **Step 3 (Schedule)**: Select an upcoming Friday at 18:00 (6:00 PM).
  5. Click **"Calculate Fare"**.
  6. **Step 4 (Details & Discounts)**: Enter a valid referral code or "Eminence Pro" code if applicable.
  7. Provide the Receiver's Contact Number.
  8. Select "Card" or "Netbanking" as the payment method and click **"Confirm Booking"**.
  9. Complete the Razorpay test payment flow using the test UPI credentials.
- **Expected Result**: 
  - The UI accurately calculates the distance.
  - A red surge badge `🚀 Surge Active (1.5x)` appears because Friday 6 PM falls into peak hours.
  - The referral discount is successfully applied to the total fare.
  - The final price dynamically reflects (Base Fare * Distance * 1.5) - Discount.
  - The booking is successfully created, generating a valid Booking ID and receipt.
  [DONE{PASSED}]

### TC-W004: Payment Gateway & ESG Emissions UI
- **Pre-condition**: You are at the final payment step of TC-W003.
- **Steps**:
  1. Review the order summary on the right-hand side.
  2. Check the green **ESG Emissions** badge.
  3. Select **"Pay Online (Razorpay)"** and click confirm.
- **Expected Result**: 
  - The ESG badge correctly displays the CO2 footprint calculation based on the distance.
  - Because you are using `rzp_test_` keys, the Razorpay mock popup should appear seamlessly.
  - Entering fake card details (`4111 1111 ...`) should succeed and redirect you to the "Booking Confirmed" screen.

---

## 3. Real-Time Tracking (Web Map)
**Objective**: Ensure the Web Portal correctly visualizes live vehicle locations.

### TC-W005: Customer Active Ride Tracking
- **Pre-condition**: Customer (`1234567890`) has a booking with status `driver_assigned`.
- **Steps**:
  1. Navigate to **"My Bookings"** (`http://localhost:5173/bookings`).
  2. Find the active trip in the list and click **"Track Ride"**.
- **Expected Result**: 
  - The tracking map loads with Leaflet/Google Maps.
  - The driver's assigned vehicle (`MH-12-PQ-1234`) is rendered on the map.
  - Driver details (Ramesh Kumar, 4.8 Rating) are visible in the side panel.
  - *Note:* The vehicle will remain static at 0 km/h and say "Loading..." until the Driver logs into the Mobile App, accepts the ride, and enters the Start Ride OTP (e.g. `8492`).

### TC-W006: Admin Fleet Overview Map
- **Pre-condition**: Logged in as Admin (`admin@eminence.com`).
- **Steps**:
  1. Navigate to **"Live Fleet Tracking"** on the admin sidebar.
- **Expected Result**: 
  - A global city map is displayed.
  - A cluster of pins is shown for all active vehicles.
  - Clicking on the pin for `MH-12-PQ-1234` opens a tooltip showing its current status ("In-Transit") and assigned driver ("Ramesh Kumar").

---

## 4. Bulk B2B Workflow
**Objective**: Test logistics-specific web tools for corporate accounts.

### TC-W007: AI Voice Route Optimization (B2B)
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Navigate to the **"AI Voice Booking"** tab.
  2. Allow microphone permissions.
  3. Speak loudly and clearly: *"Book a medium tempo from Hinjewadi to Viman Nagar tomorrow at 10 AM."*
- **Expected Result**: 
  - The web speech API parses the text.
  - The UI automatically auto-fills the Booking form: Pickup = Hinjewadi, Drop = Viman Nagar, Vehicle = Medium Tempo.
