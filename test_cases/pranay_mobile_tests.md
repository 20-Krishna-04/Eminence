# Advanced Mobile Test Cases (Assigned to: Pranay)

## Overview
This document covers advanced test cases for the Eminence React Native (Expo) Mobile App, primarily focusing on hardware integrations, background task reliability, and battery impact.

## 1. Hardware & Sensor Integrity

### TC-MO-001: Background Location Throttling
**Objective:** Verify that GPS is properly gated and throttled when driver is active vs inactive.
**Steps:**
1. Login as Driver. Toggle status to "Inactive".
2. Background the app. Verify via proxy that location packets are NOT sent.
3. Toggle status to "On Trip". Background the app.
4. Drive for 5 minutes.
**Expected Result:** GPS points are batched and sent via background tasks every 5-10 seconds, not continuously (saving battery), but accurately tracking route.

### TC-MO-002: Camera / WMS Barcode Simulation
**Objective:** Ensure barcode scanner falls back gracefully if lighting is poor or camera is obstructed.
**Steps:**
1. During a simulated trip, tap "Scan PoD Barcode".
2. Cover the physical camera lens entirely.
**Expected Result:** After 10 seconds of failing to focus/find a code, a manual "Enter Code" fallback UI appears.

## 2. Cryptographic PoD

### TC-MO-003: SHA-256 Hash Tamper Resistance
**Objective:** Validate that proof-of-delivery hashes cannot be manipulated client-side before transmission.
**Steps:**
1. Complete a drop-off, capturing a signature on the device.
2. Intercept the outbound `/api/bookings/:id/pod` request via Charles Proxy.
3. Modify the `podHash` payload by 1 character.
**Expected Result:** The backend rejects the request, logging a cryptographic integrity failure in AuditLogs.

## 3. UI/UX and Offline Behavior

### TC-MO-004: Offline Document Generation (PDF Payslips)
**Objective:** Validate payslip generation when the driver is in a dead zone.
**Steps:**
1. Put the mobile device in Airplane Mode.
2. Go to "Earnings" tab.
3. Try to view/download a past payslip PDF.
**Expected Result:** App displays cached version of the payslip or clearly indicates "No internet connection" instead of crashing or endlessly loading.

### TC-MO-005: Thermal Degradation Warnings (Simulated)
**Objective:** Ensure the app warns the driver if the simulated IoT engine temperature goes above safe thresholds.
**Steps:**
1. Connect to WebSocket as driver.
2. Inject a mock telemetry packet with `temperature: 110` (Celsius).
**Expected Result:** A high-priority red alert overlay appears on the driver's screen warning of "Coolant Overheating Risk", with a distinct haptic vibration.
