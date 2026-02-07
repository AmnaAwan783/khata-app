# Supabase + Koyeb Integration Guide

## 🎯 The Key Issue

Your connection string format must include `+psycopg` for SQLAlchemy to use the correct driver.

---

## 📋 Step-by-Step: Get Connection String from Supabase

### 1. Login to Supabase
- Go to https://supabase.com
- Click on your project

### 2. Go to Database Settings
- Left sidebar → **Settings**
- Click **"Database"**

### 3. Find Connection String
Look for a section called "Connection strings" or "Pooler"

You'll see something like:
```
postgresql://postgres.xxxxxxxxxxxx:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## 🔄 Convert for Koyeb

### The Conversion:
When Supabase gives you:
```
postgresql://postgres.xxxxxxxxxxxx:YourPassword123@db.xxxxxxxx.supabase.co:5432/postgres
```

Convert it for SQLAlchemy to:
```
postgresql+psycopg://postgres.xxxxxxxxxxxx:YourPassword123@db.xxxxxxxx.supabase.co:5432/postgres
```

**Change only this part:** `postgresql://` → `postgresql+psycopg://`

---

## ⚙️ Add to Koyeb

### 1. Koyeb Dashboard
1. Go to https://koyeb.com
2. Click on your app
3. Click **"Settings"**
4. Click **"Environment Variables"**

### 2. Update DATABASE_URL

If it already exists:
1. Click the edit icon
2. Replace entire value with your converted connection string
3. Click Save

If it doesn't exist:
1. Click **"Add Variable"**
2. **Name**: `DATABASE_URL`
3. **Value**: Your converted connection string (with +psycopg)
4. Click **"Create"**

### 3. Redeploy
1. Go back to app main page
2. Click **"Redeploy"**
3. Wait for green "Running"

---

## 🔍 Verify Connection String Parts

Your string should have all these parts:

```
postgresql+psycopg://username:password@host:port/database
                    │             │     │    │    └─ always "postgres"
                    │             │     │    └────── always 5432
                    │             │     └─────────── ends with .supabase.co
                    │             └──────────────── Your password
                    └──────────────────────────── postgres.xxxxx (your username)
```

### Example breakdown:
```
postgresql+psycopg://postgres.abcdefgh:MyPassword123@db.uvwxyz.supabase.co:5432/postgres
│                    └────────────────────────────┘ │                    │                └─ DB name
│                                                    │                    └─ Port (always 5432)
│                                                    └─ Host from Supabase
└─ Driver for Python (must have +psycopg)
```

---

## ✅ Quick Checklist

- [ ] Got connection string from Supabase
- [ ] Added `+psycopg` after `postgresql://`
- [ ] Pasted into Koyeb DATABASE_URL
- [ ] Clicked "Save" on Koyeb
- [ ] Clicked "Redeploy" on Koyeb app
- [ ] Waited for green "Running" status
- [ ] Tested app - no 500 error

---

## 🐛 Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|---------|
| `postgresql://...` (missing +psycopg) | `postgresql+psycopg://...` |
| `postgresql+psycopg2://...` (old driver) | `postgresql+psycopg://...` (new driver v3) |
| `postgres://...` (old prefix) | `postgresql+psycopg://...` (new prefix) |
| Forgetting `:5432` port | `...@host:5432/postgres` |
| Wrong database name | Database name is always `postgres` |
| Password with special chars not escaped | URL encode special chars (%, @, etc.) |

---

## 🔐 Password Special Characters

If your password has special characters like `@`, `%`, `#`, encode them:

| Character | Encoded As |
|-----------|-----------|
| `@` | `%40` |
| `:` | `%3A` |
| `#` | `%23` |
| `%` | `%25` |
| `/` | `%2F` |

**Example:**
```
Password: Pass@word#123
Encoded: Pass%40word%23123
```

---

## 🧪 Test Connection (Optional)

To verify connection works before deploying:

```bash
# Install psycopg
pip install psycopg[binary]==3.1.15

# Test in Python
python -c "
import psycopg
try:
    conn = psycopg.connect('postgresql+psycopg://your_connection_string_here')
    print('✓ Connection successful!')
    conn.close()
except Exception as e:
    print(f'✗ Connection failed: {e}')
"
```

---

## 📊 After Deployment

Once redeployed, check:

1. **Koyeb logs** should show:
   ```
   ✓ Database connection successful
   ✓ Database tables initialized successfully
   ✓ Using PostgreSQL database
   ```

2. **Try adding a sale**:
   - No 500 error ✅
   - Data saved ✅
   - Data persists after refresh ✅

---

## 🆘 Still Not Working?

Check these in order:

1. **Check DATABASE_URL on Koyeb**
   - Does it have `+psycopg`?
   - Are credentials correct?
   - No typos?

2. **Check Supabase**
   - Is project running?
   - Go to Supabase dashboard
   - Database should show "Healthy"

3. **Check Koyeb Logs**
   - Go to your app → Logs
   - Look for error messages
   - Search for "error" or "failed"

4. **Redeploy again**
   - Sometimes it needs 2 redeployments
   - Click "Redeploy" on Koyeb

---

## References

- Supabase docs: https://supabase.com/docs
- psycopg3 docs: https://www.psycopg.org/psycopg3/
- SQLAlchemy connection strings: https://docs.sqlalchemy.org/en/20/dialects/

---

**Key takeaway**: Always use `postgresql+psycopg://` (not just `postgresql://`) when connecting to Supabase from Koyeb with the fixed requirements.txt

