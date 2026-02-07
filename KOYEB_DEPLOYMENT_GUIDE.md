# Deploying Khata App on Koyeb with PostgreSQL

## Why PostgreSQL Instead of SQLite?

**Problem with SQLite on Koyeb:**
- Koyeb's filesystem is **ephemeral** (temporary)
- Data stored in `instance/database.db` gets **deleted on every restart/redeploy**
- Your items and sales disappear after every deployment

**Solution: Use PostgreSQL**
- Data persists across restarts and redeployments
- Fully managed by Koyeb
- No data loss

---

## Step 1: Create a PostgreSQL Database on Koyeb

1. Go to your Koyeb dashboard
2. Click **"Create App"** or **"Services"**
3. Under **"Add-ons"** or **"Services"**, select **PostgreSQL**
4. Configure:
   - Database Name: `khata_app`
   - Username: `khata_user` (or your choice)
   - Password: (Koyeb generates one)
5. **Copy the connection string** - looks like:
   ```
   postgresql://khata_user:password@host:port/khata_app
   ```

---

## Step 2: Add Environment Variables to Your Koyeb App

1. Go to your app's **Settings**
2. Find **"Environment Variables"**
3. Add these variables:
   ```
   DATABASE_URL=postgresql://khata_user:password@host:port/khata_app
   SECRET_KEY=khata-app-production-secret-key-change-this
   FLASK_DEBUG=False
   ```

4. **Replace the values** with your actual PostgreSQL credentials

---

## Step 3: Deploy

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL for Koyeb deployment"
   git push origin main
   ```

2. Trigger a new deployment on Koyeb:
   - Go to your app in the Koyeb dashboard
   - Click **"Redeploy"** or wait for auto-deployment
   - Koyeb will automatically:
     - Install dependencies (including `psycopg2-binary`)
     - Create database tables
     - Start the app with your PostgreSQL database

---

## Step 4: Verify It Works

1. Open your Koyeb app URL in a browser
2. Add some customers, items, and sales
3. **Close the app and reopen it** - your data should still be there!
4. **Redeploy the app** - your data should still persist!

---

## Local Development (Using SQLite)

If you want to develop locally with SQLite:

1. Don't set the `DATABASE_URL` environment variable
2. The app will use `instance/database.db` automatically
3. Your data persists locally

To switch back to SQLite:
1. Remove `DATABASE_URL` from `.env`
2. Restart your local app

---

## Troubleshooting

### Data Still Disappearing?
- Check that `DATABASE_URL` is set in Koyeb environment variables
- Check app logs: Go to **Logs** in Koyeb dashboard
- Look for messages about which database is being used

### Still Using SQLite on Koyeb?
- The app logs will show: `Using sqlite:///...`
- Add the `DATABASE_URL` environment variable (see Step 2)
- Redeploy

### PostgreSQL Connection Error?
- Verify the connection string is correct
- Make sure PostgreSQL service is running in Koyeb
- Check that the database name, user, and password are correct

---

## After This Fix

✅ Your data persists across app restarts  
✅ Your data persists across Koyeb redeployments  
✅ No more "No items" or "No sales" messages  
✅ Full production-ready setup  

---

## Additional Tips

1. **Backup your data**: Set up regular PostgreSQL backups in Koyeb (optional but recommended)
2. **Monitor database size**: PostgreSQL usage is included in Koyeb's free tier up to a limit
3. **Use strong secrets**: In production, use a strong SECRET_KEY and database password

