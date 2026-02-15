# Non-Mock Implementation Plan for BongaChapaa

This plan outlines the steps to build a fully functional, production-ready Bonga Points to Cash application. We will use the existing Prisma schema and Next.js structure.

## Phases

### Phase 1: M-PESA Integration Implementation (Backend Core)
**Goal:** robust handling of money. Securely process callbacks and trigger payouts.

1.  **Fix & Harden Utility Functions (`src/lib`)**
    *   **Refactor `daraja.ts`**:
        *   Implement robust caching for the access token (don't request a new token for every request).
        *   Fix hardcoded URLs to use `MPESA_ENVIRONMENT` (sandbox/production).
    *   **Refactor `mpesa-tasks.ts`**:
        *   Fix the B2C URL logic.
        *   Enhance `initiateB2CPayout` to handle queue timeouts and connection errors gracefully.

2.  **Implement API Routes (`src/app/api/mpesa/...`)**
    *   **Validation (`/c2b/validation`)**:
        *   Receive payload from Safaricom.
        *   Validate account number (if using customized account numbers) or simplified "Accept All" for Paybill.
        *   Return appropriate XML/JSON response to Safaricom to accept/reject the transaction.
    *   **Confirmation (`/c2b/confirmation`)**:
        *   **CRITICAL**: This is where money enters the system.
        *   Verifys signatures (if possible) or IP restrictions.
        *   Check for duplicate `TransID` (Idempotency).
        *   Write `Transaction` to DB with status `PENDING`.
        *   **Trigger**: Immediately call `initiateB2CPayout` (async) to send cash.
    *   **B2C Result (`/b2c/result`)**:
        *   Receive final status of the payout (Success/Fail).
        *   Update `Transaction` status.
        *   Store `rawCallbackData` for audit.
    *   **B2C Timeout (`/b2c/timeout`)**:
        *   Mark transaction as `FAILED` or `MANUAL_INTERVENTION_NEEDED`.

### Phase 2: Public UI (User Interface)
**Goal:** High-conversion, trust-building interface for users.

1.  **Design System Setup**
    *   Define colors (Safaricom Green/Black/White theme) in `globals.css`.
    *   Create reusable UI components: `Button`, `Card`, `Input`, `Badge`, `Alert`.
2.  **Landing Page (`src/app/(user)/page.tsx`)**
    *   **Hero Section**: Clear value prop ("Turn Bonga Points to Cash instantly").
    *   **Live Calculator**: Input Bonga Points -> See KES Amount (using `USER_PAYOUT_RATE` from env).
    *   **Instructions**: Step-by-step guide (Go to M-PESA -> Lipa na Bonga -> Paybill...).
    *   **Testimonials/Trust Signals**: "Processed KES 5M+ today".
3.  **Transaction Tracker**
    *   A component where users enter their M-PESA receipt (e.g., `QW12...`) to check if their payout has been processed.

### Phase 3: Admin Dashboard
**Goal:** Full visibility and control for the business owner.

1.  **Auth & Protection**
    *   Implement Basic Auth middleware for `/admin` routes (simplest for single admin) or use a hardcoded admin session.
2.  **Dashboard Home (`src/app/admin/page.tsx`)**
    *   **KPI Cards**: Total Float, Total Payouts, Net Profit (Margin), Failed Transactions.
    *   **Recent Transactions Table**: List of latest events with Status badges (Success/Pending/Failed).
3.  **Transaction Management**
    *   Ability to retry a failed B2C payout manually.
    *   View raw JSON logs for debugging disputes.

### Phase 4: Reliability & Deployment
1.  **Cron/Safety Net**
    *   Create a script/endpoint to poll for "stuck" transactions (Pending > 5 mins) and attempt retry or alert.
2.  **SEO & Metadata**
    *   Configure `layout.tsx` for social sharing (OpenGraph).
3.  **Environment Validation**
    *   Ensure strict validation of all `process.env` variables on startup.
