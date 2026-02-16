# 🔧 Troubleshooting Guide - BongaChapaa

## Database Connection Errors

### Error: "Can't reach database server"

This is the most common error and usually means your Neon database is paused or unreachable.

#### Quick Fix:

```bash
# Test the connection
npm run db:test
```

#### Solutions:

1. **Wake up your Neon database** (Most Common)
   - Visit [console.neon.tech](https://console.neon.tech)
   - Select your project
   - Check if the database shows as "Active"
   - If paused, click to wake it up
   - Wait 10-15 seconds for it to start
   - Retry your application

2. **Verify DATABASE_URL**
   ```bash
   # Check your .env file
   cat .env | grep DATABASE_URL
   ```
   - Ensure it matches the connection string from Neon console
   - Should include `?sslmode=require`
   - Should not have trailing spaces

3. **Check Internet Connection**
   - Ensure you have stable internet
   - Try pinging the database host:
   ```bash
   ping ep-dry-rain-agvhfe2g-pooler.c-2.eu-central-1.aws.neon.tech
   ```

4. **Regenerate Prisma Client**
   ```bash
   npm run db:generate
   ```

5. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Error: "Authentication failed"

Your database credentials are incorrect.

**Solution:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Navigate to your project → Connection Details
3. Copy the **pooled connection string**
4. Update `DATABASE_URL` in `.env`
5. Restart your dev server

### Error: "SSL connection required"

Your connection string is missing SSL configuration.

**Solution:**
Ensure your `DATABASE_URL` ends with:
```
?sslmode=require&channel_binding=require
```

Example:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&channel_binding=require"
```

## Admin Dashboard Errors

### Can't Login to Admin

**Symptoms:** Browser keeps asking for credentials

**Solutions:**

1. **Check credentials in .env**
   ```bash
   cat .env | grep ADMIN
   ```

2. **Clear browser cache**
   - Chrome: Ctrl+Shift+Delete
   - Try incognito mode

3. **Verify middleware is working**
   - Check `src/middleware.ts` exists
   - Restart dev server

4. **Check environment variables are loaded**
   ```bash
   # In your terminal where dev server runs
   echo $ADMIN_USER
   echo $ADMIN_PASSWORD
   ```

### Dashboard Shows "No transactions found"

**Solution:**
```bash
npm run db:seed
```

### Dashboard Won't Load / White Screen

**Solutions:**

1. **Check browser console** (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check server logs**
   - Look at terminal where `npm run dev` is running
   - Look for error messages

3. **Verify Prisma client**
   ```bash
   npm run db:generate
   ```

## TypeScript Errors

### Error: "Parameter 'tx' implicitly has an 'any' type"

**Solution:**
```bash
npm run db:generate
```

This regenerates the Prisma client with proper types.

### Error: "Cannot find module '@/lib/prisma'"

**Solution:**
1. Check `tsconfig.json` has path mapping:
   ```json
   "paths": {
     "@/*": ["./src/*"]
   }
   ```

2. Restart TypeScript server in your editor
   - VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

## Migration Errors

### Error: "Migration failed"

**Solutions:**

1. **Check database is accessible**
   ```bash
   npm run db:test
   ```

2. **Reset database** (⚠️ Deletes all data!)
   ```bash
   npx prisma migrate reset
   ```

3. **Deploy migrations manually**
   ```bash
   npx prisma migrate deploy
   ```

### Error: "Migration is already applied"

**Solution:**
```bash
# Mark migration as applied without running it
npx prisma migrate resolve --applied <migration_name>
```

## Seed Script Errors

### Error: "Unique constraint failed"

Data already exists in the database.

**Solution:**
This is normal! The seed script uses `upsert` to avoid duplicates. The error can be ignored, or you can:

```bash
# Clear database and reseed
npx prisma migrate reset
npm run db:seed
```

### Error: "Cannot find module"

**Solution:**
```bash
# Ensure ts-node is installed
npm install -D ts-node

# Regenerate Prisma client
npm run db:generate
```

## Build Errors

### Error: "Prisma Client not found"

**Solution:**
```bash
# Generate Prisma client before building
npm run db:generate
npm run build
```

### Error: "Environment variable not found"

**Solution:**
1. Ensure `.env` file exists in project root
2. Check all required variables are set
3. For production, set environment variables in your hosting platform

## Performance Issues

### Dashboard Loads Slowly

**Solutions:**

1. **Check database location**
   - Neon databases in different regions may be slower
   - Consider upgrading to paid tier for better performance

2. **Optimize queries**
   - The dashboard uses `Promise.all` for parallel queries
   - Consider adding indexes to frequently queried fields

3. **Enable connection pooling**
   - Already enabled if using Neon pooled connection string
   - Ensure URL includes `-pooler` in the hostname

## Still Having Issues?

### Run Full Diagnostic

```bash
# Test database connection
npm run db:test

# Verify setup
npm run admin:verify

# Check Prisma status
npx prisma validate

# View database in GUI
npm run db:studio
```

### Check Logs

1. **Server logs**: Terminal where `npm run dev` is running
2. **Browser console**: F12 → Console tab
3. **Network requests**: F12 → Network tab

### Common Checklist

- [ ] Database is active in Neon console
- [ ] `.env` file exists and has correct values
- [ ] `npm install` completed successfully
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Migrations applied (`npm run db:migrate`)
- [ ] Dev server restarted after .env changes
- [ ] No firewall blocking database connection
- [ ] Internet connection is stable

### Get Help

If you're still stuck:

1. Check the error message carefully
2. Search for the error in:
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Neon Docs](https://neon.tech/docs)
3. Run diagnostics: `npm run admin:verify`
4. Check database status in Neon console

---

**Most Common Fix:** Wake up your Neon database at [console.neon.tech](https://console.neon.tech) 🚀
