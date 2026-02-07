# ⚡ QUICK FIX - Do This Now (5 Minutes)

## Step 1: Fix DATABASE_URL on Koyeb (2 min)

### Go to Koyeb Dashboard:
1. Click on your app
2. Click **"Settings"**
3. Click **"Environment Variables"**

### Find your DATABASE_URL variable:
- **Current value** (WRONG): `postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres`
- **New value** (CORRECT): `postgresql+psycopg://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres`

**What to change**: Add `+psycopg` after `postgresql://`

### Update it:
1. Click on the DATABASE_URL variable
2. Edit it to add `+psycopg`
3. Click **"Save"**

**Example:**
```
BEFORE: postgresql://postgres.abcdef:mypass@db.supabase.co:5432/postgres
AFTER:  postgresql+psycopg://postgres.abcdef:mypass@db.supabase.co:5432/postgres
```

---

## Step 2: Push New Code (2 min)

Open terminal and run:

```bash
cd "c:\Users\HP\Downloads\khata app\khata app"
git add .
git commit -m "Fix PostgreSQL pooling and error handling"
git push origin main
```

---

## Step 3: Redeploy on Koyeb (1 min)

1. Go to Koyeb dashboard
2. Click your app
3. Click **"Redeploy"** button
4. Wait for green "Running" status

---

## Step 4: Test (You're Done!)

1. Open your app at `https://your-app-name.koyeb.app`
2. Click "Add Sale"
3. Add a sale
4. **Should work now WITHOUT 500 error!** ✅

---

## If Error Still Shows:

1. Check **Koyeb Logs** for the actual error message
2. Verify DATABASE_URL has `+psycopg` in it
3. Make sure no typos in password
4. Redeploy again

---

That's it! Should be fixed now. 🎉

