# 🌐 Eminence — Complete Web Portal Test Suite
**Covers**: Customer · Business · Driver · Admin · SuperAdmin  
**URL**: `http://localhost:5173` · **Backend**: `http://localhost:3000`  
**Last Updated**: 2026-10-08

---

## 🔐 Section 1: Authentication (All Roles)

### TC-W-AUTH-01: Customer Phone + OTP Login
- **Login Type**: Customer
- **Credentials**: Phone `1234567890` (demo OTP shown in backend terminal)
- **Steps**:
  1. Go to `http://localhost:5173/login`.
  2. Click the **"Customer"** tab.
  3. Enter `1234567890` and click **Sign In**.
  4. Check the backend terminal for the OTP code.
  5. Enter the OTP and click **Verify OTP**.
- **Expected**: Redirected to `/customer/dashboard`. Name shows "Demo User". [x]

---

### TC-W-AUTH-02: Customer Google Sign-In
- **Login Type**: Customer
- **Steps**:
  1. Go to `http://localhost:5173/login`.
  2. Click **"Continue with Google"**.
  3. Select your Google account in the popup.
- **Expected**: Redirected to `/customer/dashboard` with your Google name. If first time, a blank dashboard with 0 bookings appears (no hardcoded data). [ ]

---

### TC-W-AUTH-03: Business Login
- **Login Type**: Business (B2B)
- **Credentials**: Phone `9999999998` or register a new account
- **Steps**:
  1. Go to `http://localhost:5173/login`.
  2. Click the **"Business"** tab.
  3. Enter business phone and OTP.
- **Expected**: Redirected to `/business/dashboard`. Company name and contract count shows in header. [ ]

---

### TC-W-AUTH-04: Driver Login
- **Login Type**: Driver
- **Credentials**: Phone `9876543210` (demo driver)
- **Steps**:
  1. Go to `http://localhost:5173/login`.
  2. Click the **"Driver"** tab.
  3. Enter driver phone and OTP from backend terminal.
- **Expected**: Redirected to `/driver/dashboard`. Driver Portal header shows correct driver name from DB (not hardcoded). [x]

---

### TC-W-AUTH-05: Admin Login
- **Login Type**: Admin
- **Credentials**: `admin@eminence.com` / `adminpassword123`
- **Steps**:
  1. Go to `http://localhost:5173/admin/login` or click **Admin** tab on the login page.
  2. Enter email and password.
  3. Click **Login as Administrator**.
- **Expected**: Redirected to `/admin/dashboard`. Sidebar shows all 8 admin options. [x]

---

### TC-W-AUTH-06: Invalid Login Rejection
- **Login Type**: Admin
- **Steps**:
  1. Go to `http://localhost:5173/admin/login`.
  2. Enter `admin@eminence.com` with password `wrongpassword`.
- **Expected**: Error toast/message: "Invalid email or password". Page does not redirect. [ ]

---

### TC-W-AUTH-07: Logout Flow (All Roles)
- **Steps**:
  1. Log in as any user.
  2. Click the **logout icon** (→ arrow) in the top-right of the navbar.
- **Expected**: Redirected to `/login`. Revisiting `/customer/dashboard` redirects back to `/login` (route guard active). [ ]

---

## 👤 Section 2: Customer Dashboard

### TC-W-CUST-01: Dashboard Stats (Live Data)
- **Pre-condition**: Logged in as Customer (`1234567890`).
- **Steps**: Open the Customer Dashboard.
- **Expected**:
  - **Total Bookings** shows the real count from `/api/bookings`.
  - **Completed Rides** shows only `completed` status count.
  - **Total Spent** is correctly summed from completed booking fares.
  - Values are NOT hardcoded (`12`, `10`, `₹4,250`). [x]

---

### TC-W-CUST-02: Recent Bookings Tab — Real API Data
- **Pre-condition**: Logged in as Customer.
- **Steps**: Click the **"Bookings"** tab on the dashboard.
- **Expected**:
  - If you have no bookings, shows empty state: *"No bookings yet"* with an icon.
  - If bookings exist, each card shows real booking ID (first 8 chars), date, pickup → drop, vehicle, status badge, and correct fare.
  - Booking IDs are NOT `BKG-7829`, `BKG-7815` (those were removed). [x]

---

### TC-W-CUST-03: Referral Code Copy
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Click the **"Rewards"** tab.
  2. Click **"Copy Code"** next to the referral code.
- **Expected**: A success toast/icon appears. The code on your clipboard matches the one shown on screen. [ ]

---

### TC-W-CUST-04: Add & Delete a Saved Address
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Click the **"Addresses"** tab.
  2. Click **"Add Address"**.
  3. Fill in: Label = `Home`, Street = `MG Road`, City = `Pune`, Postal Code = `411001`.
  4. Click **Save**.
  5. Verify the address appears in the list.
  6. Click **Delete** on the new address.
- **Expected**: Address saves and appears live. Deletion removes it from the list immediately. [ ]

---

### TC-W-CUST-05: Update Profile
- **Pre-condition**: Logged in as Customer (Google account with blank profile).
- **Steps**:
  1. Click the **"Profile"** tab.
  2. Change the Name field to `Test User`.
  3. Add email and city.
  4. Click **Save Changes**.
- **Expected**: Success message appears. The dashboard header now shows the updated name. [ ]

---

### TC-W-CUST-06: Notifications Tab
- **Pre-condition**: Logged in as Customer with at least one completed booking.
- **Steps**:
  1. Click the **"Notifications"** tab.
  2. If there are notifications, click one.
- **Expected**: Notifications load from the API. Clicking marks them as read (badge count decreases). [ ]

---

### TC-W-CUST-07: Invoice / Receipt for Completed Booking
- **Pre-condition**: Customer has at least one completed booking.
- **Steps**:
  1. Click the **"Invoices"** tab.
  2. Find a completed booking in the table.
  3. Click **"Download PDF"**.
- **Expected**: Invoice data is generated from real completed bookings (not hardcoded INV-2608-012). Download button shows "Downloading..." state. [x]

---

## 📦 Section 3: Booking Flow

### TC-W-BOOK-01: Full Booking Flow (Standard)
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Click **"Book a Vehicle"** from the navbar or dashboard.
  2. **Step 1 (Location)**: Pickup = `Swargate`, Drop = `Kothrud`.
  3. **Step 2 (Vehicle)**: Select `Small Tempo`, Weight = `300 KG`, Goods = `Electronics`.
  4. **Step 3 (Schedule)**: Choose any weekday, time 10:00 AM.
  5. Click **"Calculate Fare"**.
  6. **Step 4 (Details)**: Enter receiver phone = `9876543210`.
  7. Select **Wallet** payment, click **Confirm Booking**.
- **Expected**: Booking created. Redirected to tracking page. Booking ID visible in URL. [x]

---

### TC-W-BOOK-02: Surge Pricing Detection (Friday 6 PM)
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Begin a booking (any pickup/drop).
  2. On **Step 3 (Schedule)**, select the **next Friday** at **18:00 (6 PM)**.
  3. Click **Calculate Fare**.
- **Expected**: A red surge badge appears → `🚀 Surge Active (1.5x)`. The final fare is 1.5× the base. [ ]

---

### TC-W-BOOK-03: Promo Code — Test Code `EMINENCE-XYZ123`
- **Pre-condition**: Logged in as Customer, on the booking summary step.
- **Steps**:
  1. In the **Promo Code** field, type `EMINENCE-XYZ123`.
  2. Click **Apply**.
- **Expected**: Green success message: "Referral applied! ₹100 discount added." Total fare reduces by ₹100. [ ]

---

### TC-W-BOOK-04: Multi-Stop Booking
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Begin a new booking.
  2. On the Location step, add **2 additional drop stops** using the **"+ Add Stop"** button.
  3. Fill: Pickup = `Pune Station`, Stop 1 = `Hadapsar`, Stop 2 = `Hinjewadi`.
  4. Continue and calculate fare.
- **Expected**: All 3 stops are shown on the summary. The system applies TSP (Travelling Salesman Problem) route optimization. [ ]

---

### TC-W-BOOK-05: ESG Emissions Badge Visible on Summary
- **Pre-condition**: During any booking, after calculating fare.
- **Steps**: Look at the booking summary on the right side panel.
- **Expected**: A green **🌿 ESG Emissions** badge is visible showing the CO2 footprint in KG for the trip distance. [ ]

---

### TC-W-BOOK-06: Payment via Razorpay (Wallet)
- **Pre-condition**: Customer has completed fare calculation.
- **Steps**:
  1. Select **Wallet** (Mobikwik, Airtel, etc.) in the Razorpay popup.
  2. Complete the test payment.
- **Expected**: Booking is marked as `confirmed`. You are redirected to the tracking page with the booking ID. [ ]

---

## 🚚 Section 4: Driver Dashboard

### TC-W-DRV-01: Driver Portal Header — No Hardcoded Name
- **Pre-condition**: Logged in as Driver.
- **Steps**: Open `http://localhost:5173/driver/dashboard`.
- **Expected**: "Welcome, **[Driver's Real Name from DB]**" is shown. NOT "Ramesh Kumar (MH 12 AB 1234)". [ ]

---

### TC-W-DRV-02: Driver Duty Toggle (Online/Offline)
- **Pre-condition**: Logged in as Driver.
- **Steps**:
  1. Look at the status button in the top-left of the Driver Portal.
  2. Click it to toggle from **OFFLINE → ONLINE**.
  3. Click again to go back to **OFFLINE**.
- **Expected**: Button text changes. API call to `/api/drivers/:id/toggle` is made. Status badge updates. [x]

---

### TC-W-DRV-03: Demand Surge Heatmap
- **Pre-condition**: Logged in as Driver.
- **Steps**:
  1. Click the **"Heatmap"** tab.
- **Expected**: A list of demand hotspot zones is shown (e.g., `Swargate Bus Stand - 1.3x`). Zones fetched from `/api/drivers/heatmap`. [x]

---

### TC-W-DRV-04: WMS Barcode Scanner (Simulation)
- **Pre-condition**: Logged in as Driver.
- **Steps**:
  1. Click the **"WMS Scanner"** tab.
  2. Click **"Start Scan"**.
  3. Point camera at any barcode, or use the manual input field with `EMN-BOX-001`.
- **Expected**: Scan result shows item name, barcode, and status `Loaded`. [ ]

---

### TC-W-DRV-05: Driver Earnings Tab
- **Pre-condition**: Logged in as Driver.
- **Steps**:
  1. Click the **"Earnings"** tab.
- **Expected**: Earnings data is fetched from `/api/drivers/:id/payslip`. Shows gross, platform fee, TDS, and net payout. NOT hardcoded `₹1,250`. [x]

---

### TC-W-DRV-06: Accept a Ride Request (via Socket)
- **Pre-condition**: Driver is online. A customer creates a booking simultaneously.
- **Steps**:
  1. Make sure Driver tab is open and **ONLINE**.
  2. In a separate browser/tab, create a booking as Customer.
  3. Watch the Driver Portal.
- **Expected**: A ride request card appears with the customer's pickup, drop, and fare. **Accept** and **Decline** buttons are visible. [ ]

---


## ⚙️ Section 6: Admin Panel

### TC-W-ADM-01: Admin Overview Stats
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Overview"** in the Admin sidebar.
- **Expected**: Revenue, Drivers, Vehicles, Customers counts fetched live from `/api/admin/stats/overview`. Matches actual database count. [x]

---

### TC-W-ADM-02: Manage Drivers — Add New Driver
- **Pre-condition**: Logged in as Admin.
- **Steps**:
  1. Click **"Manage Drivers"**.
  2. Click **"Add Driver"**.
  3. Fill: Name = `Test Driver`, Phone = `9876500001`, License = `MH1234567`.
  4. Click **Save**.
- **Expected**: New driver appears in the drivers list. [ ]

---

### TC-W-ADM-03: Manage Vehicles — Add New Vehicle
- **Pre-condition**: Logged in as Admin.
- **Steps**:
  1. Click **"Manage Vehicles"**.
  2. Click **"Add Vehicle"**.
  3. Fill: Reg = `MH12AB9999`, Type = `Large Truck`, Capacity = `5000kg`.
  4. Click **Save**.
- **Expected**: Vehicle appears in the vehicles list. [ ]

---

### TC-W-ADM-04: Manage Customers — View All
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Manage Users"** in the sidebar.
- **Expected**: All registered customers shown with name, phone, and registration date. [ ]

---

### TC-W-ADM-05: Fleet Telematics — Live IoT Dials
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Fleet Telematics"**.
- **Expected**: Four live animated dials — Speed, RPM, Engine Temp, Fuel Level — fluctuate in real time from the backend `telematicsSimulator`. "LIVE CONNECTION ACTIVE" badge is green and pulsing. [x]

---

### TC-W-ADM-06: Analytics — Revenue Chart
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Analytics"** in the sidebar.
- **Expected**: A 7-day revenue bar chart is rendered with real booking data from `/api/admin/stats/revenue`. Each bar shows earnings per day. [x]

---

### TC-W-ADM-07: Admin Support Inbox — Chat
- **Pre-condition**: Logged in as Admin. A customer has sent a support message.
- **Steps**:
  1. Click **"Support Inbox"** in the sidebar.
  2. Click on an active customer thread.
  3. Type a reply and press send.
- **Expected**: Message appears in the chat thread. Customer sees the reply in their Support tab via WebSocket in real time. [ ]

---

### TC-W-ADM-08: Admin Settings — Manage Team Roles
- **Pre-condition**: Logged in as Super Admin.
- **Steps**:
  1. Click **"Settings"** → **"Team Management"** tab.
  2. Click **"Add Team Member"**.
  3. Enter email, temporary password, and role (Finance Admin / Support Admin).
  4. Click **Save**.
- **Expected**: New team member appears in the roles table with correct role badge (not distorted). [x]

---


### TC-W-ADM-10: Audit Logs Tab
- **Pre-condition**: Logged in as Super Admin.
- **Steps**: Click **"Settings"** → **"Audit Logs"** tab.
- **Expected**: A list of immutable audit log entries shows admin actions (user creation, status changes). [ ]

---

## 🔴 Section 7: Edge Cases & Security

### TC-W-EDGE-01: Route Guard — Unauthorized Access
- **Steps**: Without logging in, navigate directly to `http://localhost:5173/customer/dashboard`.
- **Expected**: Immediately redirected to `/login`. [ ]

---

### TC-W-EDGE-02: Role Separation — Customer Cannot Access Admin
- **Pre-condition**: Logged in as Customer.
- **Steps**: Navigate to `http://localhost:5173/admin/dashboard`.
- **Expected**: Redirected to `/login` or `/unauthorized` page. [ ]

---

### TC-W-EDGE-03: Invalid OTP Rejection
- **Pre-condition**: At the OTP verification screen.
- **Steps**: Enter `000000` as the OTP.
- **Expected**: Error message appears: "Invalid OTP". The page does NOT redirect to the dashboard. [ ]

---

### TC-W-EDGE-04: Referral Code — Cannot Use Own Code
- **Pre-condition**: Logged in as Customer.
- **Steps**:
  1. Find your own referral code from the Rewards tab.
  2. Try to apply it in the Booking promo code field.
- **Expected**: Error: "You cannot use your own referral code." [ ]

---

### TC-W-EDGE-05: Referral Code — Cannot Apply Twice
- **Pre-condition**: Customer has already used a referral code previously.
- **Steps**: Try to apply any referral code again.
- **Expected**: Error: "You have already used a referral code." [ ]

---

### TC-W-EDGE-06: Booking Without Required Fields
- **Pre-condition**: On the Booking page, Step 1.
- **Steps**: Click **"Next"** without filling pickup or drop address.
- **Expected**: Validation error: "Please complete all location fields." Form does not advance. [ ]

---

## ✅ Test Progress Tracker

| Test ID | Description | Status |
|---|---|---|
| TC-W-AUTH-01 | Customer Phone Login | ✅ |
| TC-W-AUTH-02 | Customer Google Sign-In | [ ] |
| TC-W-AUTH-04 | Driver Login | ✅ |
| TC-W-AUTH-05 | Admin Login | ✅ |
| TC-W-AUTH-06 | Invalid Login Rejection | [ ] |
| TC-W-AUTH-07 | Logout Flow | [ ] |
| TC-W-CUST-01 | Dashboard Live Stats | ✅ |
| TC-W-CUST-02 | Real Bookings Tab | ✅ |
| TC-W-CUST-03 | Referral Code Copy | [ ] |
| TC-W-CUST-04 | Add & Delete Address | [ ] |
| TC-W-CUST-05 | Update Profile | [ ] |
| TC-W-CUST-06 | Notifications Tab | [ ] |
| TC-W-CUST-07 | Invoice PDF Download | ✅ |
| TC-W-BOOK-01 | Full Booking Flow | ✅ |
| TC-W-BOOK-02 | Surge Pricing Detection | [ ] |
| TC-W-BOOK-03 | Promo Code Apply | [ ] |
| TC-W-BOOK-04 | Multi-Stop Booking | [ ] |
| TC-W-BOOK-05 | ESG Emissions Badge | [ ] |
| TC-W-BOOK-06 | Razorpay Wallet Payment | [ ] |
| TC-W-DRV-01 | Driver Name from DB | [ ] |
| TC-W-DRV-02 | Duty Toggle | ✅ |
| TC-W-DRV-03 | Demand Heatmap | ✅ |
| TC-W-DRV-04 | WMS Scanner | [ ] |
| TC-W-DRV-05 | Earnings from API | ✅ |
| TC-W-DRV-06 | Accept Ride via Socket | [ ] |

| TC-W-ADM-01 | Overview Stats | ✅ |
| TC-W-ADM-02 | Add New Driver | [ ] |
| TC-W-ADM-03 | Add New Vehicle | [ ] |
| TC-W-ADM-04 | Manage Customers | [ ] |
| TC-W-ADM-05 | Fleet Telematics Dials | ✅ |
| TC-W-ADM-06 | Analytics Revenue Chart | ✅ |
| TC-W-ADM-07 | Support Inbox Chat | [ ] |
| TC-W-ADM-08 | Settings / Team Roles | ✅ |

| TC-W-ADM-10 | Audit Logs | [ ] |
| TC-W-EDGE-01 | Route Guard | [ ] |
| TC-W-EDGE-02 | Role Separation | [ ] |
| TC-W-EDGE-03 | Invalid OTP | [ ] |
| TC-W-EDGE-04 | Own Referral Code | [ ] |
| TC-W-EDGE-05 | Referral Code Used Twice | [ ] |
| TC-W-EDGE-06 | Booking Validation | [ ] |


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
  [DONE{PASSED}]

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
  [DONE{PASSED}]

### TC-W006: Admin Fleet Overview Map
- **Pre-condition**: Logged in as Admin (`admin@eminence.com`).
- **Steps**:
  1. Navigate to **"Live Fleet Tracking"** on the admin sidebar.
- **Expected Result**: 
  - The Live Fleet Telematics dashboard is displayed with real-time IoT data streams.
  - Four live dials are visible: **Current Speed**, **Engine RPM**, **Engine Temp**, and **Fuel Level**.
  - The values should actively fluctuate as the backend `telematicsSimulator` streams WebSocket data.
  [DONE{PASSED}]

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


# Eminence Logistics — Manual QA Test Cases

> **Setup**: Ensure `npm run dev` is running in both `backend/` and `frontend/`. Backend: `http://localhost:5000` | Frontend: `http://localhost:5173`  
> **Seeded Credentials**:
> - Admin: `admin@eminence.com` / `adminpassword123`
> - Demo Customer Phone: `1234567890`

---

## 🔐 MODULE 1: Authentication & Authorization

### TC-001 — Customer Phone Login (OTP Flow)
| Field | Details |
|-------|---------|
| **Precondition** | App is running, no user is logged in |
| **Steps** | 1. Go to `http://localhost:5173` → Click "Sign In" / "Get Started" <br> 2. Enter phone number `1234567890` <br> 3. Click "Send OTP" <br> 4. Enter any 6-digit OTP (simulation accepts any) <br> 5. Click "Verify" |
| **Expected Result** | ✅ Redirected to Customer Dashboard. User name "Demo User" visible. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-002 — Admin Login
| Field | Details |
|-------|---------|
| **Precondition** | App is running |
| **Steps** | 1. Navigate to `/admin/login` <br> 2. Enter email: `admin@eminence.com` <br> 3. Enter password: `adminpassword123` <br> 4. Click "Login" |
| **Expected Result** | ✅ Redirected to Admin Dashboard. Overview stats visible. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-003 — Invalid Admin Login
| Field | Details |
|-------|---------|
| **Steps** | 1. Go to Admin login <br> 2. Enter wrong password `wrongpassword` <br> 3. Click "Login" |
| **Expected Result** | ✅ Error message shown. No redirect. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-004 — Route Guard (Unauthorized Access)
| Field | Details |
|-------|---------|
| **Steps** | 1. While logged out, navigate directly to `/dashboard` or `/admin` |
| **Expected Result** | ✅ Redirected to login page. Access denied. |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 📱 MODULE 2: Customer Dashboard & Booking

### TC-010 — View Customer Dashboard
| Field | Details |
|-------|---------|
| **Precondition** | Logged in as Demo Customer |
| **Steps** | 1. Log in with phone `1234567890` <br> 2. Navigate to Dashboard |
| **Expected Result** | ✅ Booking history visible with 2 seeded rides (Swargate→Hinjewadi, Pune Station→Kothrud). |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-011 — Create a Standard Booking
| Field | Details |
|-------|---------|
| **Precondition** | Logged in as customer |
| **Steps** | 1. Click "Book a Tempo" <br> 2. Fill in: Pickup: `Koregaon Park, Pune`, Drop: `Viman Nagar, Pune` <br> 3. Select tempo type: `Small` <br> 4. Enter weight: `150` kg, Goods: `Electronics` <br> 5. Pick today's date and a time <br> 6. Click "Confirm Booking" |
| **Expected Result** | ✅ Booking created. Confirmation message shown. Appears in ride history. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-012 — Booking with Multi-Stop Addresses
| Field | Details |
|-------|---------|
| **Steps** | 1. Create a booking <br> 2. Add 2 additional stop addresses <br> 3. Confirm |
| **Expected Result** | ✅ Booking saved with multiple drop addresses. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-013 — ESG Emissions Badge in Ride History
| Field | Details |
|-------|---------|
| **Precondition** | TC-011 completed |
| **Steps** | 1. Go to Customer Dashboard → Ride History <br> 2. Find the newly created booking |
| **Expected Result** | ✅ Green 🌿 ESG badge visible showing estimated CO2 kg saved. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-014 — Save Address to Address Book
| Field | Details |
|-------|---------|
| **Steps** | 1. Go to Customer Dashboard → "Address Book" tab <br> 2. Click "Add Address" <br> 3. Fill in Label: `Home`, Street: `123 MG Road`, City: `Pune`, Postal: `411001` <br> 4. Save |
| **Expected Result** | ✅ New address appears in the address book list. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-015 — Wallet Balance View
| Field | Details |
|-------|---------|
| **Steps** | 1. Go to Customer Dashboard → "Wallet" tab |
| **Expected Result** | ✅ Wallet balance shown. Transaction history visible (if any). |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-016 — Referral Code Copy
| Field | Details |
|-------|---------|
| **Steps** | 1. On Customer Dashboard, find the referral section <br> 2. Click "Copy Code" button |
| **Expected Result** | ✅ "Copied!" feedback shown. Code copied to clipboard. |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 🚚 MODULE 3: Driver Dashboard

### TC-020 — Driver Dashboard Access
| Field | Details |
|-------|---------|
| **Precondition** | A driver account exists (seeded: Ramesh Kumar) |
| **Steps** | 1. Log in as a driver <br> 2. Navigate to Driver Dashboard |
| **Expected Result** | ✅ Driver dashboard loads with earnings summary and incoming requests panel. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-021 — AI Demand Heatmap
| Field | Details |
|-------|---------|
| **Steps** | 1. On Driver Dashboard, navigate to the "Heatmap" section <br> 2. Call `GET http://localhost:5000/api/drivers/heatmap` |
| **Expected Result** | ✅ Surge zone data returned with lat/lng coordinates and demand scores. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-022 — Driver Payslip Generation
| Field | Details |
|-------|---------|
| **Steps** | 1. Find a valid Driver ID from admin panel <br> 2. Call `GET http://localhost:5000/api/drivers/{driverId}/payslip` with a valid token |
| **Expected Result** | ✅ JSON response with `grossEarnings: 15000`, `platformFee: 2250`, `tdsTax: 150`, `netPayout: 12600`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-023 — WMS Barcode Scan (Simulation)
| Field | Details |
|-------|---------|
| **Steps** | 1. POST `http://localhost:5000/api/drivers/scan-inventory` with body: `{ "barcode": "EMN-BOX-001" }` |
| **Expected Result** | ✅ Response: `{ success: true, item: { barcode: 'EMN-BOX-001', status: 'Loaded' } }` |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 🏢 MODULE 4: Admin Dashboard

### TC-030 — Overview Stats Panel
| Field | Details |
|-------|---------|
| **Precondition** | Logged in as Admin |
| **Steps** | 1. Go to Admin Dashboard → Overview tab |
| **Expected Result** | ✅ Cards showing Total Revenue, Active Drivers, Total Vehicles, Total Customers. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-031 — Revenue Chart (Analytics)
| Field | Details |
|-------|---------|
| **Steps** | 1. Admin Dashboard → Analytics tab <br> 2. Observe Revenue chart |
| **Expected Result** | ✅ Line/bar chart rendered with 7-day revenue data (mock fallback if no real data). |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-032 — Add New Driver
| Field | Details |
|-------|---------|
| **Steps** | 1. Admin Dashboard → Drivers tab <br> 2. Click "Add Driver" <br> 3. Fill: Name: `Test Driver`, Phone: `9999999999`, License: `MH12XY9999` <br> 4. Save |
| **Expected Result** | ✅ New driver appears in the drivers list. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-033 — Add New Vehicle
| Field | Details |
|-------|---------|
| **Steps** | 1. Admin Dashboard → Vehicles tab <br> 2. Click "Add Vehicle" <br> 3. Fill: Registration: `MH-01-AA-1111`, Type: `Large`, Capacity: `2000` <br> 4. Save |
| **Expected Result** | ✅ New vehicle appears in vehicles list. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-034 — Real-Time Fleet Telematics (IoT)
| Field | Details |
|-------|---------|
| **Steps** | 1. Admin Dashboard → Telematics tab <br> 2. Start a telematics session for a vehicle |
| **Expected Result** | ✅ Live dials for Speed, RPM, Engine Temp, Fuel updating every 2 seconds. `healthScore` field visible. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-035 — Predictive Maintenance Alert
| Field | Details |
|-------|---------|
| **Steps** | 1. Let the telematics simulator run for ~2 minutes <br> 2. Watch the Alert field on the dashboard |
| **Expected Result** | ✅ Eventually emits `PREDICTIVE_MAINTENANCE_WARNING` when healthScore < 50. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-036 — Live Chat Inbox
| Field | Details |
|-------|---------|
| **Steps** | 1. Admin → Live Chat tab <br> 2. Send a message to a customer session |
| **Expected Result** | ✅ Message appears in real-time via Socket.io. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-037 — View Audit Logs
| Field | Details |
|-------|---------|
| **Steps** | 1. Call `GET http://localhost:5000/api/analytics/audit-logs` with Admin token |
| **Expected Result** | ✅ Paginated list of actions performed (e.g., driver creates/updates). |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 🚀 MODULE 5: Next-Gen Enterprise APIs

### TC-040 — Blockchain Proof of Delivery
| Field | Details |
|-------|---------|
| **Steps** | 1. Get a valid booking ID from the DB <br> 2. POST `http://localhost:5000/api/bookings/{id}/complete` with Auth token |
| **Expected Result** | ✅ `booking.podHash` field populated with a 64-char SHA-256 hex string. `booking.status` = `completed`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-041 — 3PL Failover (No Drivers Available)
| Field | Details |
|-------|---------|
| **Steps** | 1. Set all drivers to `inactive` in DB <br> 2. Create a new booking via `POST /api/bookings` |
| **Expected Result** | ✅ `booking.is3plOutsourced = true`, `booking.thirdPartyProvider = 'Delhivery Logistics'`, `status = driver_assigned`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-042 — ESG Carbon Calculation
| Field | Details |
|-------|---------|
| **Steps** | 1. Create a booking with `tempoType: 'large'` and `totalDistance: 10` via UI (Booking Wizard Step 2) or via `POST /api/bookings` |
| **Expected Result** | ✅ `booking.esgEmissions` displays `3.50 kg CO2` preview badge in UI and is persisted as float value `3.5` in the DB. |
| **Status** | `[x] Pass` `[ ] Fail` |

### TC-043 — AI Voice Booking (NLP Endpoint)
| Field | Details |
|-------|---------|
| **Steps** | 1. POST `http://localhost:5000/api/bookings/ai-booking` with Auth token <br> Body: `{ "transcript": "I need a large tempo to Mumbai tomorrow morning" }` |
| **Expected Result** | ✅ `{ success: true, booking: { tempoType: 'large', estimatedFare: 1200 } }` |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-044 — Dynamic Surge Pricing
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/analytics/surge` with Admin token |
| **Expected Result** | ✅ Response with `surgeMultiplier`, `surgeLabel`, `activeBookings`, `availableDrivers`, `demandRatio`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## ⚙️ MODULE 6: Infrastructure & SLA

### TC-050 — Health Check Endpoint
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/health` (no auth required) |
| **Expected Result** | ✅ `{ success: true, message: 'EMINENCE API is running', uptimeSeconds: <number>, memoryUsageMb: <number> }` |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-051 — SLA Monitoring Endpoint
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/analytics/sla` with Admin token |
| **Expected Result** | ✅ `{ sla: { uptimeHours, dbLatencyMs, memoryUsageMb, cacheStats, activeAlerts } }` |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-052 — Platform White-Label Config
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/config` (no auth) |
| **Expected Result** | ✅ `{ config: { brandName: 'Eminence Logistics', primaryColor: '#b87333' } }` |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-053 — Update Platform Config
| Field | Details |
|-------|---------|
| **Steps** | 1. PUT `http://localhost:5000/api/analytics/platform-config` with Admin token <br> Body: `{ "brandName": "Eminence Pro", "primaryColor": "#FF5733" }` |
| **Expected Result** | ✅ Config updated. GET `/api/config` returns new values. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-054 — Export Bookings (Expense Report)
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/analytics/export-bookings` with Admin token |
| **Expected Result** | ✅ Array of bookings with `{ id, date, pickup, drop, fare, status, esgEmissions, podHash }`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## ⭐ MODULE 7: Reviews & Ratings

### TC-060 — Submit a Driver Review
| Field | Details |
|-------|---------|
| **Precondition** | Valid `driverId` and `customerId` available |
| **Steps** | 1. POST `http://localhost:5000/api/reviews` <br> Body: `{ "driverId": "<id>", "customerId": "<id>", "rating": 5, "comment": "Excellent service!" }` |
| **Expected Result** | ✅ Review created. Driver's average rating updated in DB. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-061 — Get Driver Reviews
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/reviews/driver/<driverId>` |
| **Expected Result** | ✅ List of reviews for that driver returned. |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 🏦 MODULE 8: B2B & Payments

### TC-070 — B2B Business Registration
| Field | Details |
|-------|---------|
| **Precondition** | Logged in as customer |
| **Steps** | 1. POST `http://localhost:5000/api/b2b/register` with Auth token <br> Body: `{ "businessName": "Acme Corp", "gstNumber": "29ABCDE1234F1Z5" }` |
| **Expected Result** | ✅ Business registered. Can now access postpaid/credit features. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-071 — B2B Contract Request
| Field | Details |
|-------|---------|
| **Steps** | 1. POST `http://localhost:5000/api/b2b/contracts` with Auth token <br> Body: `{ "vehicleType": "large", "vehicleCount": 2, "startDate": "2026-09-10", "endDate": "2026-10-10" }` |
| **Expected Result** | ✅ Contract created with `status: 'pending'`. |
| **Status** | `[ ] Pass` `[ ] Fail` |

### TC-072 — View Invoices
| Field | Details |
|-------|---------|
| **Steps** | 1. GET `http://localhost:5000/api/b2b/invoices` with Auth token |
| **Expected Result** | ✅ List of invoices returned (empty array if none yet). |
| **Status** | `[ ] Pass` `[ ] Fail` |

---

## 📋 TEST SUMMARY

| Module | Total TCs | Pass | Fail | Blocked |
|--------|-----------|------|------|---------|
| Auth & Authorization | 4 | | | |
| Customer Dashboard | 7 | | | |
| Driver Dashboard | 4 | | | |
| Admin Dashboard | 8 | | | |
| Next-Gen Enterprise | 5 | | | |
| Infrastructure & SLA | 5 | | | |
| Reviews & Ratings | 2 | | | |
| B2B & Payments | 3 | | | |
| **TOTAL** | **38** | | | |

---

## 🐛 Bug Report Template

Use this for any failures found during testing:

```
Bug ID: BUG-XXX
TC Reference: TC-0XX
Severity: Critical / High / Medium / Low
Summary: [One-line description]
Steps to Reproduce:
  1.
  2.
  3.
Expected: 
Actual: 
Screenshot/Log: [Attach if available]
```
