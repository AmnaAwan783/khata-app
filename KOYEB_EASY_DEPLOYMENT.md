# 🚀 Easy Koyeb Deployment for Khata App

This guide will help you deploy the Khata App on Koyeb with full data persistence using PostgreSQL.

---

## ✅ What You Need

1. **GitHub Account** - Your code repository
2. **Koyeb Account** - Free at https://koyeb.com
3. **15 minutes** - To complete the setup

---

## Step 1: Push Your Code to GitHub

Make sure all the latest changes are committed:

```bash
git add .
git commit -m "Add wholesaler category/unit fields and real-time stock display"
git push origin main
```

---

## Step 2: Create PostgreSQL Database on Koyeb

### 2a. Go to Koyeb Dashboard
1. Login to https://koyeb.com
2. Click **"Create App"** or **"New Service"**

### 2b. Create PostgreSQL Add-on
1. In the **"Add-ons"** section, click **"Create Add-on"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Database Name**: `khata_app`
   - **Username**: `khata_user` (or your preferred name)
   - **Password**: Koyeb generates this automatically (save it!)
4. Click **"Create"** and wait 2-3 minutes

### 2c. Copy Connection String
1. Once PostgreSQL is created, go to **"Add-ons"** → **"PostgreSQL"**
2. Find the connection string that looks like:
   ```
   postgresql://khata_user:password@host:port/khata_app
   ```
3. **Copy the entire connection string** and save it somewhere safe

---

## Step 3: Connect Your Flask App to PostgreSQL

### 3a. Create Koyeb Service
1. Click **"Create Service"** (if you have an app already, go to its settings)
2. Select **"GitHub"** as the source
3. Connect your GitHub account and select your `khata app` repository
4. Choose the branch: `main`

### 3b. Configure Environment Variables
1. Scroll down to **"Environment Variables"**
2. Click **"Add Variable"** and add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste your PostgreSQL connection string from Step 2c |
| `SECRET_KEY` | Generate a random string (at least 32 characters): `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FLASK_DEBUG` | `False` |
| `PORT` | `5000` |

Example:
```
DATABASE_URL=postgresql://khata_user:superSecurePassword@db.koyeb.example.com:5432/khata_app
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
FLASK_DEBUG=False
PORT=5000
```

### 3c. Configure App Settings
1. **Build Command**: (leave empty)
2. **Run Command**: `gunicorn app:app`
3. **Port**: `5000`
4. **Instance Type**: KovPress (free tier is fine for development)

### 3d. Deploy
1. Click **"Create Service"**
2. Wait for the app to deploy (2-5 minutes)
3. Once deployed, you'll see a URL: `https://your-app-name.koyeb.app`

---

## Step 4: Test Your Deployment

1. Open your app URL in a browser
2. Add some **customers**, **items**, and **sales**
3. **Refresh the page** - data should still be there
4. **Wait 1 hour**, then refresh again - data persists!
5. Go to Koyeb dashboard and click **"Redeploy"** - data still persists!

✅ **If data persists, you're done!**

---

## Step 5: Fix Common Issues

### Issue: "No items" or "No sales" appear after refresh

**Solution**: Check if `DATABASE_URL` is set correctly
```bash
# In Koyeb dashboard:
1. Go to your app → "Settings" → "Environment Variables"
2. Verify DATABASE_URL is set to PostgreSQL connection string
3. NOT any SQLite path
4. Click "Redeploy"
```

### Issue: Database connection error

**Solution**: Verify PostgreSQL is running
```bash
# In Koyeb dashboard:
1. Go to "Add-ons" → "PostgreSQL"
2. Check status (should be "Running")
3. Copy the connection string again
4. Paste into DATABASE_URL environment variable
5. Redeploy
```

### Issue: App won't start

**Solution**: Check the logs
```bash
# In Koyeb dashboard:
1. Go to your app → "Logs"
2. Look for error messages
3. Common issues:
   - Missing DATABASE_URL env variable
   - Wrong PostgreSQL connection string
   - Python syntax errors (update your code and push again)
```

---

## Important: Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Flask security key | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `FLASK_DEBUG` | Debug mode (always False in production) | `False` |
| `PORT` | Port number | `5000` |

---

## Troubleshooting Checklist

- [ ] GitHub repository is up to date with latest code
- [ ] PostgreSQL add-on is created and running
- [ ] `DATABASE_URL` env variable is set correctly
- [ ] `SECRET_KEY` env variable is set
- [ ] App shows green "Running" status in Koyeb
- [ ] HTTPS is working (green lock icon in browser)
- [ ] Data persists after page refresh
- [ ] Data persists after app redeploy

---

## Local Development (If Needed)

To test locally before deploying:

```bash
# Install dependencies
pip install -r requirements.txt

# Don't set DATABASE_URL (it will use SQLite locally)
# Run the app
python app.py

# Open http://localhost:5000
```

Your local data will be in `instance/database.db`

---

## Next Steps

1. **Monitor your app**: Check Koyeb logs regularly for errors
2. **Backup data**: Set up PostgreSQL backups in Koyeb (optional but recommended)
3. **Custom domain**: Add your own domain in Koyeb settings
4. **SSL/HTTPS**: Already automatically enabled by Koyeb!

---

## Need Help?

**Error in logs?** 
- Share the error message
- Check if DATABASE_URL is set correctly
- Try redeploying

**Data disappearing?**
- Verify PostgrSQL connection string in DATABASE_URL
- Check that app is using PostgreSQL (not SQLite)

**Still stuck?**
- Check Koyeb documentation: https://docs.koyeb.com
- Flask-SQLAlchemy docs: https://flask-sqlalchemy.palletsprojects.com/

---

## Summary

✅ Push code to GitHub  
✅ Create PostgreSQL on Koyeb  
✅ Add DATABASE_URL environment variable  
✅ Deploy and test  
✅ Data persists! 🎉  

**You're done! Your Khata App is now live with persistent data.**

