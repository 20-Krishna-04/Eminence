# Advanced Backend Test Cases (Assigned to: Sanket)

## Overview
This document outlines advanced, edge-case, and security-focused testing scenarios for the Eminence Backend API and Database layer. Focus is on performance, security, data integrity, and complex business logic validation.

## 1. Security & Authentication Checks

### TC-BE-001: OTP Brute-Force Rate Limiting
**Objective:** Verify that repeated incorrect OTP submissions result in account lockout.
**Pre-conditions:** Test user is registered and OTP is generated via `/api/auth/send-otp`.
**Steps:**
1. Call `/api/auth/verify-otp` with incorrect OTP (5 times).
2. On 5th attempt, verify HTTP 429 response.
3. Call again with correct OTP.
4. Verify HTTP 429 response (lockout active).
5. Wait 15 minutes, try with new OTP.
**Expected Result:** Lockout is enforced. Old OTP is invalidated. System logs brute force attempt correctly.

### TC-BE-002: XSS & Payload Sanitization Bypass (CodeQL Verification)
**Objective:** Verify that `requestValidator.js` strips complex XSS payloads.
**Steps:**
1. Call `POST /api/auth/update-profile` with payload:
   `{"name": "Sanket <script>alert(1)</script>", "city": "<<script>script>alert(1)</script>"}`
2. Fetch the profile details.
**Expected Result:** Name and city should be sanitized to HTML entities or stripped completely.

### TC-BE-003: DPDP Data Anonymization
**Objective:** Verify that the "Right to be Forgotten" endpoint completely anonymizes PII.
**Steps:**
1. Call `DELETE /api/auth/data` as a logged-in user.
2. Query the user directly in the DB using the known ID.
**Expected Result:** Name changes to "Anonymized...", phone and email are scrambled, Government ID is nullified. Bookings remain but are orphaned from PII.

## 2. Business Logic & Integrity Constraints

### TC-BE-004: Financial Bounds Validation (Issue #172)
**Objective:** Ensure negative/zero values are rejected by the Booking model.
**Steps:**
1. Create a booking via `/api/bookings` with `totalDistance: 0`, `estimatedFare: -50`.
2. Observe API response.
3. Attempt to bypass API and insert directly to DB using script with `estimatedFare: 0`.
**Expected Result:** API returns HTTP 400. DB throws Sequelize Validation Error (min: 0.1 for distance, min: 0.01 for fare).

### TC-BE-005: ESG Emission Calculation Accuracy
**Objective:** Ensure carbon emissions are calculated strictly based on vehicle type and distance.
**Steps:**
1. Book `small` tempo for `20km`. Expected ESG: `(20 * 120) / 1000 = 2.4 KG CO2`.
2. Book `large` tempo for `20km`. Expected ESG: `(20 * 350) / 1000 = 7.0 KG CO2`.
**Expected Result:** API returns exact expected calculations in `esgEmissions` field.

## 3. High-Load / Concurrency

### TC-BE-006: Concurrent Booking ID Generation
**Objective:** Prevent race conditions in custom Booking ID prefix generation.
**Steps:**
1. Using an automated script, fire 50 concurrent `POST /api/bookings` requests for the same customer.
**Expected Result:** All 50 bookings receive uniquely sequential IDs (e.g., `EM-XXX1`, `EM-XXX2`). Database constraints prevent duplicate inserts.

### TC-BE-007: WebSocket Stream Resiliency
**Objective:** Verify Telematics socket handles reconnections gracefully.
**Steps:**
1. Connect to `/telematics` namespace.
2. Emit location stream.
3. Forcefully sever TCP connection without clean disconnect.
4. Reconnect immediately with same Driver ID.
**Expected Result:** System cleans up old socket session and accepts the new one without duplicating the driver icon on tracking map.
