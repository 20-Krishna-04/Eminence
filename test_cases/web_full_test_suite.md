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
- **Expected**: Redirected to `/customer/dashboard`. Name shows "Demo User". [ ]

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
- **Expected**: Redirected to `/driver/dashboard`. Driver Portal header shows correct driver name from DB (not hardcoded). [ ]

---

### TC-W-AUTH-05: Admin Login
- **Login Type**: Admin
- **Credentials**: `admin@eminence.com` / `adminpassword123`
- **Steps**:
  1. Go to `http://localhost:5173/admin/login` or click **Admin** tab on the login page.
  2. Enter email and password.
  3. Click **Login as Administrator**.
- **Expected**: Redirected to `/admin/dashboard`. Sidebar shows all 8 admin options. [ ]

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
  - Values are NOT hardcoded (`12`, `10`, `₹4,250`). [ ]

---

### TC-W-CUST-02: Recent Bookings Tab — Real API Data
- **Pre-condition**: Logged in as Customer.
- **Steps**: Click the **"Bookings"** tab on the dashboard.
- **Expected**:
  - If you have no bookings, shows empty state: *"No bookings yet"* with an icon.
  - If bookings exist, each card shows real booking ID (first 8 chars), date, pickup → drop, vehicle, status badge, and correct fare.
  - Booking IDs are NOT `BKG-7829`, `BKG-7815` (those were removed). [ ]

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
- **Expected**: Invoice data is generated from real completed bookings (not hardcoded INV-2608-012). Download button shows "Downloading..." state. [ ]

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
- **Expected**: Booking created. Redirected to tracking page. Booking ID visible in URL. [ ]

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
- **Expected**: Button text changes. API call to `/api/drivers/:id/toggle` is made. Status badge updates. [ ]

---

### TC-W-DRV-03: Demand Surge Heatmap
- **Pre-condition**: Logged in as Driver.
- **Steps**:
  1. Click the **"Heatmap"** tab.
- **Expected**: A list of demand hotspot zones is shown (e.g., `Swargate Bus Stand - 1.3x`). Zones fetched from `/api/drivers/heatmap`. [ ]

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
- **Expected**: Earnings data is fetched from `/api/drivers/:id/payslip`. Shows gross, platform fee, TDS, and net payout. NOT hardcoded `₹1,250`. [ ]

---

### TC-W-DRV-06: Accept a Ride Request (via Socket)
- **Pre-condition**: Driver is online. A customer creates a booking simultaneously.
- **Steps**:
  1. Make sure Driver tab is open and **ONLINE**.
  2. In a separate browser/tab, create a booking as Customer.
  3. Watch the Driver Portal.
- **Expected**: A ride request card appears with the customer's pickup, drop, and fare. **Accept** and **Decline** buttons are visible. [ ]

---

## 🏢 Section 5: Business (B2B) Dashboard

### TC-W-BIZ-01: Business Welcome — No Hardcoded Company Name
- **Pre-condition**: Logged in as Business user.
- **Steps**: Open `/business/dashboard`.
- **Expected**: Header shows `user?.companyName || user?.name`. NOT "Reliance Smart - Magarpatta Branch". [ ]

---

### TC-W-BIZ-02: Active Contracts — Live from API
- **Pre-condition**: Business account logged in.
- **Steps**: Click **"Contracts"** tab.
- **Expected**: Contracts fetched from `/api/b2b/contracts`. If none, empty state shows "No active contracts yet." NOT "CTR-8892-A". [ ]

---

### TC-W-BIZ-03: Request a New Contract
- **Pre-condition**: Logged in as Business.
- **Steps**:
  1. Click the **"Contracts"** tab.
  2. Click **"Request Contract"**.
  3. Fill: Vehicle Type = `Medium Tempo`, Count = `2`, Start Date = next Monday, End Date = 3 months later.
  4. Click **Submit**.
- **Expected**: Contract appears in the list with status `pending`. Admin can approve it from the Admin panel. [ ]

---

### TC-W-BIZ-04: Bulk CSV Upload (Batch Bookings)
- **Pre-condition**: Logged in as Business.
- **Steps**:
  1. Click the **"bulk-load"** tab.
  2. Download the CSV template.
  3. Fill in 3 rows of booking data.
  4. Upload the file.
- **Expected**: Success state appears: "Batch Bookings Scheduled!". [ ]

---

### TC-W-BIZ-05: Business Invoices Tab
- **Pre-condition**: Logged in as Business with at least one invoice.
- **Steps**: Click the **"Invoices"** tab.
- **Expected**: Invoices fetched from `/api/b2b/invoices`. Shows invoice amount, date, status. Empty state if none. [ ]

---

## ⚙️ Section 6: Admin Panel

### TC-W-ADM-01: Admin Overview Stats
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Overview"** in the Admin sidebar.
- **Expected**: Revenue, Drivers, Vehicles, Customers counts fetched live from `/api/admin/stats/overview`. Matches actual database count. [ ]

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
- **Expected**: Four live animated dials — Speed, RPM, Engine Temp, Fuel Level — fluctuate in real time from the backend `telematicsSimulator`. "LIVE CONNECTION ACTIVE" badge is green and pulsing. [ ]

---

### TC-W-ADM-06: Analytics — Revenue Chart
- **Pre-condition**: Logged in as Admin.
- **Steps**: Click **"Analytics"** in the sidebar.
- **Expected**: A 7-day revenue bar chart is rendered with real booking data from `/api/admin/stats/revenue`. Each bar shows earnings per day. [ ]

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
- **Expected**: New team member appears in the roles table with correct role badge (not distorted). [ ]

---

### TC-W-ADM-09: Contracts — Approve a B2B Request
- **Pre-condition**: A Business user has submitted a contract request (TC-W-BIZ-03).
- **Steps**:
  1. Logged in as Admin, click **"Contracts"**.
  2. Find the `pending` contract.
  3. Click **"Approve"**.
- **Expected**: Contract status changes to `active`. The Business user's dashboard now shows it under Active Contracts. [ ]

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
| TC-W-AUTH-01 | Customer Phone Login | [ ] |
| TC-W-AUTH-02 | Customer Google Sign-In | [ ] |
| TC-W-AUTH-03 | Business Login | [ ] |
| TC-W-AUTH-04 | Driver Login | [ ] |
| TC-W-AUTH-05 | Admin Login | [ ] |
| TC-W-AUTH-06 | Invalid Login Rejection | [ ] |
| TC-W-AUTH-07 | Logout Flow | [ ] |
| TC-W-CUST-01 | Dashboard Live Stats | [ ] |
| TC-W-CUST-02 | Real Bookings Tab | [ ] |
| TC-W-CUST-03 | Referral Code Copy | [ ] |
| TC-W-CUST-04 | Add & Delete Address | [ ] |
| TC-W-CUST-05 | Update Profile | [ ] |
| TC-W-CUST-06 | Notifications Tab | [ ] |
| TC-W-CUST-07 | Invoice PDF Download | [ ] |
| TC-W-BOOK-01 | Full Booking Flow | [ ] |
| TC-W-BOOK-02 | Surge Pricing Detection | [ ] |
| TC-W-BOOK-03 | Promo Code Apply | [ ] |
| TC-W-BOOK-04 | Multi-Stop Booking | [ ] |
| TC-W-BOOK-05 | ESG Emissions Badge | [ ] |
| TC-W-BOOK-06 | Razorpay Wallet Payment | [ ] |
| TC-W-DRV-01 | Driver Name from DB | [ ] |
| TC-W-DRV-02 | Duty Toggle | [ ] |
| TC-W-DRV-03 | Demand Heatmap | [ ] |
| TC-W-DRV-04 | WMS Scanner | [ ] |
| TC-W-DRV-05 | Earnings from API | [ ] |
| TC-W-DRV-06 | Accept Ride via Socket | [ ] |
| TC-W-BIZ-01 | Business Name from DB | [ ] |
| TC-W-BIZ-02 | Live Contracts List | [ ] |
| TC-W-BIZ-03 | Request New Contract | [ ] |
| TC-W-BIZ-04 | Bulk CSV Upload | [ ] |
| TC-W-BIZ-05 | Business Invoices | [ ] |
| TC-W-ADM-01 | Overview Stats | [ ] |
| TC-W-ADM-02 | Add New Driver | [ ] |
| TC-W-ADM-03 | Add New Vehicle | [ ] |
| TC-W-ADM-04 | Manage Customers | [ ] |
| TC-W-ADM-05 | Fleet Telematics Dials | [ ] |
| TC-W-ADM-06 | Analytics Revenue Chart | [ ] |
| TC-W-ADM-07 | Support Inbox Chat | [ ] |
| TC-W-ADM-08 | Settings / Team Roles | [ ] |
| TC-W-ADM-09 | Approve B2B Contract | [ ] |
| TC-W-ADM-10 | Audit Logs | [ ] |
| TC-W-EDGE-01 | Route Guard | [ ] |
| TC-W-EDGE-02 | Role Separation | [ ] |
| TC-W-EDGE-03 | Invalid OTP | [ ] |
| TC-W-EDGE-04 | Own Referral Code | [ ] |
| TC-W-EDGE-05 | Referral Code Used Twice | [ ] |
| TC-W-EDGE-06 | Booking Validation | [ ] |
