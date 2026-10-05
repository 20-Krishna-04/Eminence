# Full Stack Test Cases (Assigned to: Krishna)

## Overview
This document outlines cross-platform testing scenarios assigned to Krishna, covering Web Portal resilient communication and Mobile Driver telemetry & wake lock management.

## Part 1: Web Portal Tests (Frontend)

### TC-KRI-001: Web Speech API Interruption
**Objective:** Verify AI voice booking logic handles abrupt interruptions or mic permission denials.
**Steps:**
1. Navigate to Booking Page on the Web Portal. Click "AI Voice Booking".
2. Deny Microphone permission in the browser.
**Expected Result:** Graceful error message ("Microphone access denied"). UI fallback to manual text entry.

### TC-KRI-002: Socket Reconnection Strategy
**Objective:** Ensure UI reflects correct state if Socket.io disconnects.
**Steps:**
1. Navigate to Live Tracking (`/tracking/:id`).
2. Simulate offline mode in Chrome DevTools.
3. Observe UI.
4. Disable offline mode.
**Expected Result:** Web UI shows "Reconnecting..." spinner when offline. Re-fetches latest telemetry state (Speed, Location) upon reconnection without requiring manual refresh.

## Part 2: Mobile App Tests (Driver Companion)

### TC-KRI-003: Device Wake Lock Management
**Objective:** Verify that the screen stays awake while the driver is actively navigating an ongoing trip.
**Steps:**
1. Start an active trip in the Mobile app.
2. Leave the device untouched for 5 minutes.
**Expected Result:** Screen does not turn off or dim. `expo-keep-awake` correctly maintains the wake lock during the trip, but releases it when the trip finishes.

### TC-KRI-004: Thermal Degradation Warnings (Simulated)
**Objective:** Ensure the app warns the driver if the simulated IoT engine temperature goes above safe thresholds.
**Steps:**
1. Connect to WebSocket as driver via Mobile App.
2. Inject a mock telemetry packet with `temperature: 110` (Celsius).
**Expected Result:** A high-priority red alert overlay appears on the driver's screen warning of "Coolant Overheating Risk", with a distinct haptic vibration.
