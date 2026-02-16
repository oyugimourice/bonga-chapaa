# Admin Dashboard Setup Guide

## Quick Start

### 1. Initial Setup (First Time Only)
Run this command to set up everything:
```bash
npm run setup
```

This will:
- Generate Prisma client
- Apply database migrations
- Create admin user
- Seed sample transactions

### 2. Access the Admin Dashboard

1. Start the development server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/admin`

3. Login with credentials from `.env`:
   - **Username**: `admin` (or value of `ADMIN_USER`)
   - **Password**: `SecureAdmin@2026!` (or value of `ADMIN_PASSWORD`)

## Individual Commands

### Create Admin User Only
```bash
npm run admin:create
```

### Seed Sample Transactions
```bash
npm run db:seed
```

### View Database in Browser
```bash
npm run db:studio
```

## Admin Features

### Dashboard Overview
- **Total Revenue**: Sum of all payouts
- **Total Transactions**: Count of all transactions
- **Pending Actions**: Transactions awaiting processing
- **System Status**: Real-time operational status

### Recent Transactions Table
View the latest 10 transactions with:
- M-PESA receipt number
- Customer phone number
- Amount received (in Bonga Points equivalent)
- Payout amount sent
- Status badges (Completed/Pending/Failed)
- Timestamp

## Security Notes

⚠️ **Important**: Change the default admin password in production!

1. Update `.env`:
```env
ADMIN_PASSWORD="YourStrongPasswordHere"
```

2. The admin area uses HTTP Basic Authentication
3. For production, consider implementing:
   - Session-based authentication
   - Two-factor authentication
   - IP whitelisting

## Troubleshooting

### "No transactions found"
Run the seed command:
```bash
npm run db:seed
```

### Authentication not working
1. Check `.env` file has `ADMIN_USER` and `ADMIN_PASSWORD`
2. Clear browser cache/cookies
3. Try incognito mode

### Database connection errors
1. Verify `DATABASE_URL` in `.env`
2. Check database is accessible
3. Run migrations: `npm run db:migrate`

## Next Steps

After verifying the admin dashboard works:

1. **Implement M-PESA Integration**
   - Set up C2B validation/confirmation endpoints
   - Configure B2C payout system
   - Test with Safaricom sandbox

2. **Add Transaction Management**
   - Retry failed payouts
   - View detailed transaction logs
   - Export reports

3. **Deploy to Production**
   - Set up environment variables
   - Configure webhook URLs
   - Enable SSL/HTTPS
