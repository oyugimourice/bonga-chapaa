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

1) Clone and install

```bash
git clone https://github.com/your-org/bonga-chapaa
cd bonga-chapaa
npm install
```

1) Configure Neon and push schema

- Create a Neon project and grab pooled + direct connection strings.
- Add `.env` (template below), then run:

```bash
npx prisma db push
```

1) Run the app

```bash
npm run dev
```

## 🔑 Environment

Create `.env` in project root:

```env
# Database
DATABASE_URL="postgresql://user:pass@ep-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-direct.region.aws.neon.tech/dbname?sslmode=require"

# Daraja API
MPESA_ENVIRONMENT="sandbox" # or "production"
MPESA_CONSUMER_KEY="your_key"
MPESA_CONSUMER_SECRET="your_secret"

# B2C Credentials
B2C_SHORTCODE="your_paybill"
B2C_INITIATOR_NAME="your_api_username"
B2C_SECURITY_CREDENTIAL="your_encrypted_password"

# Business Logic
USER_PAYOUT_RATE="0.20" # Cash per point (Safaricom pays 0.30)
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

- POST `/api/mpesa/c2b/validate` — validate Bonga receipt before accepting. Example request body:

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

- POST `/api/mpesa/c2b/confirm` — acknowledge and log confirmed C2B payments. Example response you send:

```json
{"ResultCode": 0, "ResultDesc": "Accepted"}
```

- POST `/api/mpesa/b2c/result` — handle payout results from M-PESA B2C. Sample callback payload:

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

- POST `/api/mpesa/b2c/timeout` — log and retry/alert on payout timeouts. Typical response from you: `{ "ResultCode": 0, "ResultDesc": "Received" }`.

Keep request/response bodies strict to Daraja spec; sign any required headers; persist full payloads for audit and reconciliation.
