# Full Stack Test Cases (Assigned to: Pranay)

## Overview
This document outlines a mix of cross-platform testing scenarios assigned to Pranay.

## Part 1: Web Portal Tests (Frontend)

### TC-PRA-001: Keyboard Navigation via Tab Index (a11y)
**Objective:** Ensure a user can fully book a ride using only the keyboard.
**Steps:**
1. Navigate to the Web Booking page.
2. Use `Tab` to navigate through input fields, select menus, and the "Proceed" button.
**Expected Result:** Every interactive element has a visible focus state. Dropdowns can be interacted with using `Enter` or `Space`, and form submits properly on `Enter`.

### TC-PRA-002: Stale State Invalidation
**Objective:** Verify that old user data is completely cleared from the Web Portal when switching accounts.
**Steps:**
1. Login as User A and view profile/wallet data.
2. Logout.
3. Login as User B.
**Expected Result:** Profile and wallet data immediately reflect User B's state without displaying User A's cached data for a few seconds.

## Part 2: Mobile App Tests (Driver Companion)

### TC-PRA-003: Background Location Throttling
**Objective:** Verify that GPS is properly gated and throttled when driver is active vs inactive.
**Steps:**
1. Login to Mobile App as Driver. Toggle status to "Inactive".
2. Background the app. Verify via proxy that location packets are NOT sent.
3. Toggle status to "On Trip". Background the app.
4. Drive for 5 minutes.
**Expected Result:** GPS points are batched and sent via background tasks every 5-10 seconds, not continuously (saving battery), but accurately tracking route.

### TC-PRA-004: Camera / WMS Barcode Simulation
**Objective:** Ensure barcode scanner falls back gracefully if lighting is poor or camera is obstructed.
**Steps:**
1. During a simulated trip on the Mobile App, tap "Scan PoD Barcode".
2. Cover the physical camera lens entirely.
**Expected Result:** After 10 seconds of failing to focus/find a code, a manual "Enter Code" fallback UI appears.
