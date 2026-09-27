# Eminence - Advanced Feature Test Cases

This document outlines the test cases for the "heavy" and complex features of the Eminence Smart Transport & Logistics platform. These tests go beyond basic authentication to validate core business logic, real-time tracking, and enterprise-grade telematics.

## 1. Real-Time Telematics & Driver Tracking
**Objective**: Ensure the WebSocket connection correctly streams live vehicle telemetry to both the customer and admin dashboards.

- **TC-H001: Live Location Broadcasting**
  - **Pre-condition**: Driver is assigned to an active trip and has location permissions enabled.
  - **Steps**:
    1. Driver moves physically (or via mock GPS) by 500 meters.
    2. Customer opens the "Track Ride" screen.
  - **Expected Result**: Customer sees the vehicle marker move smoothly on the map with < 2 seconds latency. WebSocket emits `trip:location_update`.

- **TC-H002: Admin Fleet Telematics Dials**
  - **Pre-condition**: Vehicle is in-transit.
  - **Steps**:
    1. Admin navigates to the Fleet Telematics Dashboard.
    2. Simulate high engine RPM (e.g., 4500 RPM) and Speed (85 km/h) via the backend telematics simulator.
  - **Expected Result**: Admin dashboard live-updates the gauge dials. If RPM > 4000, the UI should indicate a warning state (yellow/red).

## 2. Dynamic Surge Pricing Engine
**Objective**: Validate that the platform correctly adjusts pricing based on supply/demand and geographic zones.

- **TC-H003: High Demand Multiplier Application**
  - **Pre-condition**: Set active drivers in a specific zone (e.g., Koregaon Park) to 1, and pending requests to 5.
  - **Steps**:
    1. Customer attempts to book a "Small Tempo" in the high-demand zone.
  - **Expected Result**: The estimated fare should display a surge multiplier (e.g., `1.5x Surge Applied`) and the final price should mathematically reflect the base fare * 1.5.

- **TC-H004: Driver Heatmap Generation**
  - **Pre-condition**: Backend registers a demand surge.
  - **Steps**:
    1. Driver opens the "Demand Heatmap" tab.
  - **Expected Result**: The map renders a red/orange overlay over the high-demand zone, prompting the driver to navigate there for higher payouts.

## 3. Advanced Booking & Routing
**Objective**: Test logistics-specific booking constraints, particularly multi-stop route optimization.

- **TC-H005: Multi-Stop Route Optimization**
  - **Pre-condition**: Customer is logged in and creating a B2B logistics order.
  - **Steps**:
    1. Customer enters 1 Pickup address and 4 scattered Drop-off addresses.
    2. Submit the booking request.
  - **Expected Result**: The backend should re-order the drop-off waypoints based on the most efficient path (shortest distance/time) rather than the order they were entered.

- **TC-H006: ESG Emissions Calculation**
  - **Pre-condition**: A trip of exactly 15km is completed using an Electric Vehicle (EV).
  - **Steps**:
    1. View the completed ride receipt.
  - **Expected Result**: The receipt should display an "ESG Badge" calculating the exact CO2 saved compared to a standard diesel truck (e.g., ~4.5 KG CO2 saved).

## 4. Driver Logistics & Proof of Delivery (PoD)
**Objective**: Ensure drivers can properly process commercial goods and complete the trip lifecycle.

- **TC-H007: WMS Barcode Scanning**
  - **Pre-condition**: Driver arrives at the pickup warehouse.
  - **Steps**:
    1. Driver opens the scanner module and scans a package barcode (e.g., `EMN-BOX-001`).
  - **Expected Result**: System verifies the barcode against the manifest. Status changes from `Pending` to `Loaded`.

- **TC-H008: Secure Proof of Delivery (PoD)**
  - **Pre-condition**: Driver arrives at the final drop-off location.
  - **Steps**:
    1. Driver requests the 4-digit Drop-off OTP from the receiver.
    2. Driver inputs the OTP and captures an image of the delivered goods.
  - **Expected Result**: Trip status changes to `Completed`. The backend generates a cryptographic PoD Hash and updates the B2B invoice.

## 5. Enterprise & Predictive Maintenance
**Objective**: Validate B2B workflows and AI-driven vehicle health alerts.

- **TC-H009: Predictive Maintenance Anomaly Trigger**
  - **Pre-condition**: A vehicle's simulated engine temperature exceeds 105°C for more than 3 minutes.
  - **Steps**:
    1. Admin views the "Asset Health" panel.
  - **Expected Result**: The system automatically generates a `MAINTENANCE_REQUIRED` alert, and the vehicle is temporarily removed from the active dispatch pool.

- **TC-H010: B2B Consolidated Invoicing**
  - **Pre-condition**: A B2B corporate account (e.g., Tata AutoComp) completes 5 trips in a week.
  - **Steps**:
    1. Corporate Admin navigates to the "Invoices & Contracts" page at the end of the billing cycle.
  - **Expected Result**: A single, consolidated GST-compliant invoice is generated aggregating all 5 trips, rather than 5 individual receipts.
