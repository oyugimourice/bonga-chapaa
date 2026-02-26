# 🚀 BongaChapaa

Instant Bonga Points ➜ M-PESA cash bridge built with **Next.js 15**, **Prisma**, and **Neon Postgres**.

---

## ✨ Highlights

- 📱 Real-time calculator for Bonga Points → cash
- ⚡ Automated disbursement via M-PESA B2C API (no manual steps)
- 🛡️ Double-spend protection and strict receipt uniqueness
- 📊 Admin dashboard for float, revenue, and success KPIs
- 🔍 Full JSON audit logs for Safaricom callbacks
- 🚀 Serverless-ready for Vercel + Neon

## 🧭 How It Works

- User submits Bonga Points receipt.
- Service validates uniqueness and computes payout using configurable rate.
- M-PESA B2C sends cash to the user; callbacks are logged and reconciled.
- Admin view tracks float, payouts, and error states.

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- Prisma + Neon Postgres
- Safaricom Daraja (C2B/B2C)
- Tailwind CSS + Lucide React
- Zod for validation

## 🚀 Quickstart

### 1. Clone and Install

```bash
git clone https://github.com/your-org/bonga-chapaa
cd bonga-chapaa
npm install
```

### 2. Configure Database

- Create a [Neon](https://neon.tech) project
- Copy connection string to `.env`:

```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

### 3. Setup Database & Admin

```bash
# Run migrations, create admin user, and seed sample data
npm run setup

# Verify everything is working
npm run admin:verify
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Admin Dashboard

- Navigate to: `http://localhost:3000/admin`
- Login with credentials from `.env`:
  - Username: `admin` (or your `ADMIN_USER`)
  - Password: `SecureAdmin@2026!` (or your `ADMIN_PASSWORD`)

📖 **Detailed admin setup**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md)


## 🔑 Environment

Create `.env` in project root:

```env
# Database
DATABASE_URL="postgresql://user:pass@ep-pooler.region.aws.neon.tech/dbname?sslmode=require"

# Daraja API
MPESA_ENVIRONMENT="sandbox" # or "production"
MPESA_CONSUMER_KEY="your_key"
MPESA_CONSUMER_SECRET="your_secret"

# B2C Credentials
B2C_SHORTCODE="your_paybill"
B2C_INITIATOR_NAME="your_api_username"
B2C_SECURITY_CREDENTIAL="your_encrypted_password"
B2C_TIMEOUT_URL="https://yourdomain.com/api/callbacks/b2c/timeout"
B2C_RESULT_URL="https://yourdomain.com/api/callbacks/b2c/result"

# Business Logic
USER_PAYOUT_RATE="0.20" # Cash per point (Your payout to user)
SAFARICOM_PAYOUT_RATE="0.30" # Cash per point (Safaricom pays you)

# Admin Access
ADMIN_USER="admin"
ADMIN_PASSWORD="SecureAdmin@2026!" # Change in production!

# Frontend
NEXT_PUBLIC_PAYBILL="123456"
```

## 🗂️ Project Structure

```sh
src/
├─ app/
│  ├─ (user)/      # Public UI (calculator, tracker)
│  ├─ (admin)/     # Protected dashboard
│  └─ api/         # M-PESA webhooks
├─ components/     # UI components
├─ lib/            # Prisma client + M-PESA logic
└─ types/          # TypeScript definitions
```

## 🔒 Security Notes

- Restrict inbound callbacks to official Safaricom IP ranges.
- Log only required transaction metadata to stay DP Act compliant.
- Enforce idempotency via unique `mpesaReceiptNumber`.

## 📜 License

MIT — built with ❤️ for the Kenyan fintech ecosystem.

## ☁️ Deployment (Vercel + Neon)

- Provision Neon: create project + branch; enable pooled and direct connection strings; keep them in `.env` as `DATABASE_URL` and `DIRECT_URL`.
- Vercel project settings: set all env vars from the `.env` template; add `NEXT_PUBLIC_*` if you expose client-side config.
- Build settings: framework Next.js; install runs `npm install`; build command `npm run build`; output `.vercel/output` (default for App Router).
- Prisma: ensure `prisma generate` runs during build (Next does this automatically when importing the client). For schema changes, run `npx prisma migrate deploy` against Neon outside of the Vercel build step.
- Webhooks: allow Vercel Edge/Functions URLs in your Safaricom callback allowlist/IP rules; keep a direct Neon connection (`DIRECT_URL`) for migrations/maintenance only.

## 🌐 Webhook Endpoints

Suggested endpoints to mirror Safaricom Daraja flows:

- POST `/api/callbacks/c2b/validation` — validate Bonga receipt before accepting. Example request body:

```json
{
 "TransactionType": "Pay Bill",
 "TransID": "QW123ABC",
 "TransTime": "20250131210101",
 "TransAmount": "500",
 "MSISDN": "254712345678",
 "BillRefNumber": "BONGA12345"
}
```

- POST `/api/callbacks/c2b/confirmation` — acknowledge and log confirmed C2B payments. Example response you send:

```json
{"ResultCode": 0, "ResultDesc": "Accepted"}
```

- POST `/api/callbacks/b2c/result` — handle payout results from M-PESA B2C. Sample callback payload:

```json
{
 "Result": {
  "ResultType": 0,
  "ResultCode": 0,
  "ResultDesc": "The service request is processed successfully.",
  "OriginatorConversationID": "12345-67890-1",
  "ConversationID": "AG_20250131_123456789",
  "TransactionID": "QW12ER34",
  "ResultParameters": {
   "ResultParameter": [
    {"Key": "TransactionAmount", "Value": 500},
    {"Key": "TransactionReceipt", "Value": "QW12ER34"},
    {"Key": "B2CRecipientIsRegisteredCustomer", "Value": "Y"},
    {"Key": "TransactionCompletedDateTime", "Value": "20250131210101"}
   ]
  }
 }
}
```

- POST `/api/callbacks/b2c/timeout` — log and retry/alert on payout timeouts. Typical response from you: `{ "ResultCode": 0, "ResultDesc": "Received" }`.

Keep request/response bodies strict to Daraja spec; sign any required headers; persist full payloads for audit and reconciliation.
