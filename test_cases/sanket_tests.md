# Full Stack Test Cases (Assigned to: Sanket)

## Overview
This document outlines a mix of cross-platform testing scenarios assigned to Sanket.

## Part 1: Web Portal Tests (Frontend)

### TC-SAN-001: ESG Emission UI Calculation Accuracy
**Objective:** Ensure carbon emissions display correctly in the Web Booking flow based on vehicle type and distance.
**Steps:**
1. On the Web Portal, book a `small` tempo for `20km`. Expected ESG: `2.4 KG CO2`.
2. Book a `large` tempo for `20km`. Expected ESG: `7.0 KG CO2`.
**Expected Result:** The web UI immediately updates the ESG footprint badge before proceeding to payment.

### TC-SAN-002: Dynamic Demand Surge Visualization
**Objective:** Verify that surge pricing multipliers visually map to the demand heatmap.
**Steps:**
1. Login to the Web Portal as Customer.
2. Select a high-demand zone during peak hours (e.g., Friday 6 PM in a commercial district).
**Expected Result:** The UI displays a clear "Surge Active" badge and updates the estimated fare exactly in line with the `1.5x` backend multiplier.

## Part 2: Mobile App Tests (Driver Companion)

### TC-SAN-003: Push Notification Deep Linking
**Objective:** Verify that tapping a push notification routes the driver to the correct screen.
**Steps:**
1. Put the Expo Mobile app in the background.
2. Dispatch a push notification: "New Ride Request: Andheri to Bandra".
3. Tap the notification from the OS notification center.
**Expected Result:** The app opens directly to the "Active Trip / Accept" screen with the specific booking details loaded, bypassing the home screen.

### TC-SAN-004: Offline Document Generation (PDF Payslips)
**Objective:** Validate payslip generation when the driver is in a dead zone.
**Steps:**
1. Put the mobile device in Airplane Mode.
2. Go to the "Earnings" tab.
3. Try to view/download a past payslip PDF.
**Expected Result:** App displays a cached version of the payslip or clearly indicates "No internet connection" instead of crashing or endlessly loading.
