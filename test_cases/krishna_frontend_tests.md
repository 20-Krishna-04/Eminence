# Advanced Frontend Test Cases (Assigned to: Krishna)

## Overview
This document outlines advanced UI/UX, state management, and API integration testing scenarios for the Eminence React Web Portal.

## 1. AI Voice Booking & Modality

### TC-FE-001: Web Speech API Interruption
**Objective:** Verify AI voice booking logic handles abrupt interruptions or mic permission denials.
**Steps:**
1. Navigate to Booking Page. Click "AI Voice Booking".
2. Deny Microphone permission in the browser.
**Expected Result:** Graceful error message ("Microphone access denied"). UI fallback to manual text entry.

### TC-FE-002: Contextual Form Auto-fill accuracy
**Objective:** Verify that transcribed speech maps accurately to Zod validated schemas.
**Steps:**
1. Speak: "Book a large tempo from Mumbai Central to Andheri West."
2. Observe form fields.
**Expected Result:** 
- Pickup: Mumbai Central
- Drop: Andheri West
- Tempo: Large
- ESG Footprint calculates immediately based on 'Large' tempo logic.

## 2. Dynamic Real-Time Dashboards

### TC-FE-003: Socket Reconnection Strategy
**Objective:** Ensure UI reflects correct state if Socket.io disconnects.
**Steps:**
1. Navigate to Live Tracking (`/tracking/:id`).
2. Simulate offline mode in Chrome DevTools.
3. Observe UI.
4. Disable offline mode.
**Expected Result:** UI shows "Reconnecting..." spinner when offline. Re-fetches latest telemetry state (Speed, Location) upon reconnection without requiring manual refresh.

### TC-FE-004: Explicit State Management Fallbacks
**Objective:** Verify `addressState`, `walletState`, and `profileState` in CustomerDashboard gracefully handle 500 API errors.
**Steps:**
1. Block the `/api/auth/profile` request via DevTools Network request blocking.
2. Load Dashboard.
**Expected Result:** Dashboard doesn't crash. Displays a generic "Failed to load profile data" in the profile widget, while other widgets (wallet, addresses) continue to load and function normally.

## 3. Client-Side Validation

### TC-FE-005: Zod Schema Completeness
**Objective:** Ensure client-side Zod validation mirrors backend constraints exactly.
**Steps:**
1. Open Booking Page (Manual mode).
2. Enter negative values for weight or distances via DOM manipulation.
3. Click Proceed.
**Expected Result:** Zod schema catches negative weight and stops form submission before making a network request.

### TC-FE-006: Responsive Grid Degradation
**Objective:** Verify multi-column tracking dashboards on tablets/smaller web screens.
**Steps:**
5. Resize window to 768px (iPad portrait).
2. View `Tracking.jsx`.
**Expected Result:** ESG badges, Telematics Dials, and the Map collapse from side-by-side flexbox layout to a single column vertical stack seamlessly.

## 4. State Hydration and Persistence

### TC-FE-007: Redux/Context Persistence on Reload
**Objective:** Verify that critical state like Auth token and user role persists correctly after a hard page refresh.
**Steps:**
1. Login as Admin.
2. Navigate to Admin Dashboard.
3. Hard refresh the page (`Ctrl+F5` or `Cmd+Shift+R`).
**Expected Result:** User remains logged in. Role remains "admin". UI does not flicker to the login screen or customer dashboard.

### TC-FE-008: Stale State Invalidation
**Objective:** Verify that old user data is completely cleared when switching accounts.
**Steps:**
1. Login as User A and view profile/wallet data.
2. Logout.
3. Login as User B.
**Expected Result:** Profile and wallet data immediately reflect User B's state without displaying User A's cached data for a few seconds.

## 5. Web Accessibility (a11y)

### TC-FE-009: Keyboard Navigation via Tab Index
**Objective:** Ensure a user can fully book a ride using only the keyboard.
**Steps:**
1. Navigate to the Booking page.
2. Use `Tab` to navigate through input fields, select menus, and the "Proceed" button.
**Expected Result:** Every interactive element has a visible focus state. Dropdowns can be interacted with using `Enter` or `Space`, and form submits properly on `Enter`.

### TC-FE-010: Screen Reader Compatibility
**Objective:** Verify that critical notifications and dynamic updates are read by screen readers.
**Steps:**
1. Enable VoiceOver (Mac) or NVDA (Windows).
2. Complete a booking flow until the "Booking Successful" toast appears.
**Expected Result:** The screen reader announces the success toast immediately via `aria-live="polite"` or `aria-live="assertive"` tags.
