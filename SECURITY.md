# Security Policy

Eminence is an enterprise-grade commercial logistics, telematics, and transport booking platform. We treat the confidentiality, integrity, and availability of our users' personal data, fleet telematics, and payment transactions with the highest priority.

---

## Reporting a Vulnerability

If you discover a security vulnerability or potential threat in this codebase, please report it responsibly rather than opening a public issue on GitHub.

- **Primary Contact**: Project Maintainers via GitHub Security Advisories or private email.
- **Reporting Information**:
  - Detailed description of the vulnerability.
  - Reproducible steps or Proof of Concept (PoC) script.
  - Potential impact and affected components (Backend, Frontend, or Mobile).
  - Any suggested mitigations.

### Response Timeline

| Milestone | Expected SLA |
|---|---|
| Initial Acknowledgment | Within 24–48 hours |
| Vulnerability Assessment & Confirmation | Within 3–5 business days |
| Security Patch & Release | Within 7–14 days (or expedited for critical flaws) |
| Public Disclosure / Credit | Following full deployment of the remediation |

---

## Vulnerability Scope

We encourage reports covering:

- **Authentication & Authorization**: Token tampering, session fixation, privilege escalation (e.g., customer $\to$ admin), IDOR across customer or driver bookings.
- **Data Protection & Privacy**: Sensitive personal data exposure (DPDP Act compliance, unmasked government IDs, customer phone numbers, live GPS leakage).
- **Payment & Webhook Security**: Razorpay HMAC signature evasion, order tampering, payment status manipulation.
- **API & Transport Security**: Injection attacks (SQL injection, stored/reflected XSS), SSRF, CORS misconfigurations.
- **Mobile Security**: Insecure local data storage, token leakage in plaintext, background telemetry abuses.
- **Denial of Service**: Algorithmic complexity vulnerabilities (ReDoS), socket connection exhaustion, rate-limit bypasses.

---

## Security Architecture & Defense-in-Depth

The Eminence platform implements comprehensive, multi-layer security controls across the entire monorepo:

### 1. Authentication & Session Management
- **Role-Based Access Control (RBAC)**: Enforces distinct access boundaries for `customer`, `driver`, and `admin` roles across all protected API routes and WebSocket connections.
- **Stateless JWTs with Secure HttpOnly Cookies**: Access tokens are signed using HMAC-SHA256 with mandatory startup validation of `JWT_SECRET`. Tokens are transported via `HttpOnly`, `SameSite=Lax`, and `Secure` cookies to protect against client-side script theft (XSS).
- **Mobile Hardware Biometrics**: Mobile authentication supports `expo-local-authentication` backed by encrypted hardware keychains via `expo-secure-store`.
- **OTP Verification Safeguards**: Phone verification OTPs are single-use, time-bounded (5 minutes), and rate-limited.

### 2. Transport & Network Security
- **HTTP Security Headers (`helmet`)**: Configures hardened Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and Referrer-Policy headers.
- **Strict CORS Policy**: Whitelists authorized origins in production with credential support enabled; rejects wildcard origin configurations on credentialed endpoints.
- **PostgreSQL TLS Verification**: NeonDB/PostgreSQL database pools require TLS with verified CA certificates (`rejectUnauthorized: true`).

### 3. Input Validation & Injection Mitigation
- **Linear-Time Safe Regex Validators**: Email and phone number formats are validated using linear $O(N)$ string verification to prevent polynomial Regular Expression Denial of Service (CodeQL `js/polynomial-redos`).
- **Comprehensive XSS Sanitization**: Sanitization middleware neutralizes script tags, dangerous HTML pseudo-protocols (`javascript:`, `vbscript:`, `data:text/html`), and inline event handlers across all request bodies.
- **ORM Parameterization**: All database queries utilize Sequelize parameterized prepared statements to prevent SQL injection.

### 4. WebSocket & Real-Time Telematics Hardening
- **Handshake Authentication**: Socket.io middleware validates JWT credentials before admitting connections.
- **Server-Side Room Authorization**: Client-specified room join requests (e.g. driver chat, customer support, live tracking) are verified against the authenticated user's verified token claims to prevent IDOR snooping.
- **Socket Rate Limiting**: WebSocket event frequencies are tracked per socket instance to mitigate message flooding.

### 5. Payment & Financial Integrity
- **Mandatory Webhook Secrets**: Razorpay webhook endpoints require `RAZORPAY_WEBHOOK_SECRET` and verify the cryptographic HMAC-SHA256 signature against the raw unparsed request payload.
- **Order Signature Verification**: Dual-phase payment verification confirms order IDs, payment IDs, and signatures against server-side secret keys before updating booking status.

### 6. Audit Logging & Compliance Trails
- **Immutable Audit Trail**: Administrative and mission-critical actions are recorded in an append-only `AuditLog` table with client IP, timestamp, user identity, and action metadata.
- **Data Minimization (DPDP Compliance)**: User profile endpoints filter out sensitive identifiers (such as raw `governmentId`), and password hashes are purged from all serialization layers.

### 7. Background Telematics & Battery/Privacy Isolation
- **Role-Restricted Telemetry**: Mobile background GPS tracking is restricted exclusively to authenticated users with the `driver` role. Customer accounts never engage persistent background location tasks.

---

## Best Practices for Developers & Contributors

1. Never commit `.env` files or real credentials (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `DATABASE_URL`).
2. Always execute `node run_all_tests.js` before submitting pull requests to ensure no regressions in security unit tests or static analysis.
3. Keep third-party dependencies updated and resolve any alerts reported by GitHub Dependabot or CodeQL.
