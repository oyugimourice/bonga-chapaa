# 🎯 Quick Reference - BongaChapaa Admin

## 🚀 Common Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:generate            # Generate Prisma client
npm run db:migrate             # Create new migration
npm run db:push                # Push schema without migration
npm run db:studio              # Open Prisma Studio (GUI)

# Admin & Setup
npm run setup                  # Complete setup (first time)
npm run admin:create           # Create/update admin user
npm run admin:verify           # Verify setup is working
npm run db:seed                # Add sample transactions

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors
npm run type-check             # TypeScript check
```

## 🔐 Admin Access

**URL**: `http://localhost:3000/admin`

**Default Credentials**:
- Username: `admin`
- Password: `SecureAdmin@2026!`

**Change in `.env`**:
```env
ADMIN_USER="your_username"
ADMIN_PASSWORD="your_secure_password"
```

## 📊 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Total Revenue** | Sum of all completed payouts |
| **Total Transactions** | Count of all transactions |
| **Pending Actions** | Transactions awaiting processing |
| **System Status** | Real-time operational status |
| **Recent Transactions** | Last 10 transactions with details |

## 🗂️ Key Files

```
src/
├── app/admin/
│   ├── layout.tsx             # Sidebar navigation
│   └── page.tsx               # Dashboard page
├── lib/
│   └── prisma.ts              # Database client
├── middleware.ts              # Auth protection
prisma/
├── schema.prisma              # Database schema
├── migrations/                # Migration history
└── seed.ts                    # Sample data
scripts/
├── create-admin.ts            # Admin user setup
└── verify-setup.ts            # Setup verification
```

## 🎨 Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| ✅ COMPLETED | Green | Payout successful |
| ⏳ PENDING | Yellow | Awaiting processing |
| ❌ FAILED | Red | Payout failed |
| 🔄 PROCESSING | Blue | B2C request sent |
| ↩️ REVERSED | Gray | Transaction reversed |

## 🔧 Troubleshooting

### Can't access admin
```bash
# 1. Check credentials in .env
cat .env | grep ADMIN

# 2. Verify middleware is working
npm run dev
# Visit http://localhost:3000/admin
```

### No data showing
```bash
# Run seed script
npm run db:seed

# Verify with Prisma Studio
npm run db:studio
```

### Database errors
```bash
# Regenerate Prisma client
npm run db:generate

# Check connection
npm run admin:verify

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### TypeScript errors
```bash
# Regenerate types
npm run db:generate

# Check for errors
npm run type-check
```

## 📱 Mobile View

The admin dashboard is responsive:
- **Desktop**: Full sidebar + content
- **Tablet**: Collapsible sidebar
- **Mobile**: Hidden sidebar (hamburger menu recommended)

## 🌙 Dark Mode

Automatically follows system preference. Toggle in your OS settings.

## 🔗 Useful Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Safaricom Daraja](https://developer.safaricom.co.ke)
- [Neon Database](https://neon.tech/docs)

## 📚 Documentation

- `README.md` - Main project documentation
- `ADMIN_SETUP.md` - Detailed admin setup guide
- `ADMIN_COMPLETE.md` - Complete feature summary
- `implementation_plan.md` - Development roadmap

---

**Need help?** Check the troubleshooting section or run `npm run admin:verify`
