# Daraja API Credentials Guide

This guide explains how to obtain the necessary credentials from the Safaricom Daraja Portal to integrate M-PESA into BongaChapaa.

## 1. Register on Daraja Portal
1.  Go to the [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
2.  Click **Login/Register** and create an account if you don't have one.

## 2. Create a Sandbox App (For Testing)
1.  Navigate to **My Apps** in the top menu.
2.  Click **Create New App**.
3.  Enter an **App Name** (e.g., `BongaChapaa-Test`).
4.  Select the following products (minimum required):
    *   **Lipa na M-Pesa Sandbox**
    *   **M-Pesa Daraja API**
5.  Click **Create App**.
6.  Once created, you will see your **Consumer Key** and **Consumer Secret**. These go into:
    *   `MPESA_CONSUMER_KEY`
    *   `MPESA_CONSUMER_SECRET`

## 3. Configure C2B (To Receive Payments)
C2B allows you to receive payments via your Paybill or Till Number.
1.  **Shortcode**: Your Business Paybill number.
2.  **Register URLs**: You must register your `ConfirmationURL` and `ValidationURL` so Safaricom knows where to send payment notifications.
    - **Step 1**: Update `.env` with `C2B_SHORTCODE` and `NEXT_PUBLIC_APP_URL` (use your Ngrok URL for testing).
    - **Step 2**: Run the registration script:
      ```bash
      npm run mpesa:register-urls
      ```

## 4. Configure B2C (To Send Cash Payouts)
B2C allows the system to send money to your users.
1.  **Initiator Name**: 
    - **Sandbox**: Found in **Test Credentials** on the portal.
    - **Production**: This is usually the username of the user who will be initiating payments on the portal.
2.  **Security Credential**: 
    - **Sandbox**: A pre-generated credential is provided in **Test Credentials**.
    - **Production**: You must generate this by encrypting your API password with Safaricom's public key (we can help with this if needed).
3.  **Shortcode**: 
    - **Sandbox**: A test shortcode provided in **Test Credentials**.
    - **Production**: Your B2C shortcode provided by Safaricom.

## 5. Environment Variables Checklist
Update your `.env` file with these values:

```env
MPESA_ENVIRONMENT="sandbox" # Change to "production" for live
MPESA_CONSUMER_KEY="your_key"
MPESA_CONSUMER_SECRET="your_secret"
C2B_SHORTCODE="your_paybill"
B2C_SHORTCODE="your_b2c_shortcode"
B2C_INITIATOR_NAME="your_initiator"
B2C_SECURITY_CREDENTIAL="your_encrypted_password"
B2C_TIMEOUT_URL="https://your-domain.com/api/mpesa/b2c/timeout"
B2C_RESULT_URL="https://your-domain.com/api/mpesa/b2c/result"
```

## 6. Going Live (Production)
1.  Go to **Go Live** on the Daraja portal.
2.  Fill in the required business details (Company name, CR12, etc.).
3.  Once Safaricom approves (usually 24-48 hours), you will get production keys.
4.  Switch `MPESA_ENVIRONMENT` to `production` and update all keys.
