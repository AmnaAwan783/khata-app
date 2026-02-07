# DATABASE_URL Format - Visual Guide

## The Issue You're Having

- ❌ Current: `postgresql://...` → Doesn't work with psycopg[binary]==3.1.15
- ✅ Correct: `postgresql+psycopg://...` → Works perfectly

---

## Visual Conversion

### Take Your Supabase Connection String:

```
┌─────────────────────────────────────────────────────────────────────┐
│ postgresql://postgres.abcdefgh:myPassword123@db.xyz123.supabase.co:5432/postgres │
└─────────────────────────────────────────────────────────────────────┘
```

### Add `+psycopg` after `postgresql://`:

```
┌──────────────────────────────────────────────────────────────────────┐
│ postgresql+psycopg://postgres.abcdefgh:myPassword123@db.xyz123.supabase.co:5432/postgres │
└──────────────────────────────────────────────────────────────────────┘
            ↑ ADD THIS
```

### Result:

```
postgresql+psycopg://postgres.abcdefgh:myPassword123@db.xyz123.supabase.co:5432/postgres
```

---

## Breaking Down the Connection String

```
postgresql+psycopg://postgres.abcdefgh:myPassword123@db.xyz123.supabase.co:5432/postgres
│                     │                 │              │                      │        │
│                     │                 │              │                      │        └─ Database name
│                     │                 │              │                      └────── Port (always 5432)
│                     │                 │              └────────────────────────── Host from Supabase
│                     │                 └───────────────────────────────────────── Password
│                     └────────────────────────────────────────────────────────── Username
└─────────────────────────────────────────────────────────────────────────────── Driver (IMPORTANT!)
```

---

## Real Examples

### Example 1: Simple Password
```
Supabase gives you:
postgresql://postgres.abc123def:simplepass@db.supabase.co:5432/postgres

Add +psycopg:
postgresql+psycopg://postgres.abc123def:simplepass@db.supabase.co:5432/postgres

✅ Use this on Koyeb
```

### Example 2: Complex Password with Special Characters
```
Supabase gives you:
postgresql://postgres.xyz789:Pass@word#2024!@db.supabase.co:5432/postgres

You might need to URL encode:
postgresql://postgres.xyz789:Pass%40word%232024%21@db.supabase.co:5432/postgres

Add +psycopg:
postgresql+psycopg://postgres.xyz789:Pass%40word%232024%21@db.supabase.co:5432/postgres

✅ Use this on Koyeb
```

### Example 3: Different Username
```
Supabase gives you (with non-default username):
postgresql://myapp_user:secretpass@db.supabase.co:5432/postgres

Add +psycopg:
postgresql+psycopg://myapp_user:secretpass@db.supabase.co:5432/postgres

✅ Use this on Koyeb
```

---

## Step-by-Step: Find and Update on Koyeb

### Step 1: Get String from Supabase
1. Go to supabase.com → Your project
2. Settings → Database
3. Find "Connection string"
4. Copy the entire string starting with `postgresql://`

### Step 2: Add `+psycopg`
- Find: `postgresql://`
- Change to: `postgresql+psycopg://`

### Step 3: Put on Koyeb
1. Koyeb dashboard → Your app
2. Settings → Environment Variables
3. Find `DATABASE_URL`
4. Replace value with your updated string (with +psycopg)
5. Click Save

### Step 4: Redeploy
1. Go back to app page
2. Click "Redeploy"
3. Wait for green "Running"

---

## Common Mistakes

| ❌ WRONG | ✅ RIGHT | Why |
|---------|---------|-----|
| `postgresql://...` | `postgresql+psycopg://...` | Tells SQLAlchemy which driver to use |
| `postgres://...` | `postgresql+psycopg://...` | Old format, not supported |
| `postgresql+psycopg2://...` | `postgresql+psycopg://...` | psycopg2 is old, psycopg is v3 |
| Missing `:5432` | `...@host:5432/postgres` | Port is required |
| Missing `/postgres` | `...@host:5432/postgres` | Database name required |
| `sqlite:///...` | `postgresql+psycopg://...` | SQLite doesn't work on Koyeb |

---

## How to Test Your String

### Before Deploying (Optional)

```bash
pip install psycopg[binary]==3.1.15

python << 'EOF'
import psycopg

# Replace with your string
db_string = "postgresql+psycopg://postgres.abc123:password@db.supabase.co:5432/postgres"

try:
    conn = psycopg.connect(db_string)
    print("✓ Connection successful!")
    
    # Test it works
    with conn.cursor() as cur:
        cur.execute("SELECT 1")
    
    conn.close()
    print("✓ Database is working!")
except Exception as e:
    print(f"✗ Connection failed: {e}")
EOF
```

If both show ✓, you're good!

---

## Check Your Current DATABASE_URL

Go to Koyeb dashboard:
1. Click your app
2. Settings → Environment Variables
3. Look for `DATABASE_URL`

### If it shows:
```
postgresql://postgres.abcdef:password@db.supabase.co:5432/postgres
```

**You need to update it to:**
```
postgresql+psycopg://postgres.abcdef:password@db.supabase.co:5432/postgres
```

---

## Special Characters in Password

If your password has these characters, encode them:

| Character | Encode As |
|-----------|-----------|
| `@` | `%40` |
| `:` | `%3A` |
| `#` | `%23` |
| `%` | `%25` |
| `/` | `%2F` |
| ` ` (space) | `%20` |
| `!` | `%21` |

### Example:
```
Password: yourPass@word#2024
Encoded:  yourPass%40word%232024

Full string:
postgresql+psycopg://postgres.abcdef:yourPass%40word%232024@db.supabase.co:5432/postgres
```

---

## Summary

### What to do right now:

1. Get string from Supabase ✅
2. Add `+psycopg` after `postgresql://` ✅
3. Paste into Koyeb DATABASE_URL ✅
4. Redeploy ✅
5. Test ✅

### The ONE critical change:
```
postgresql://  →  postgresql+psycopg://
```

That's literally it! Everything else stays the same.

---

## Still Not Working?

1. **Double-check DATABASE_URL** - Does it have `+psycopg`?
2. **Check password** - Is it correct? Any special chars need encoding?
3. **Check host** - Does it say `.supabase.co`?
4. **Port is 5432** - Always 5432 for Supabase
5. **Database is postgres** - Always `postgres` for Supabase

If all ✓, then deploy and check Koyeb logs for the real error.

---

**Key Point**: The `+psycopg` part tells SQLAlchemy to use the psycopg v3 driver you installed in requirements.txt. Without it, SQLAlchemy won't know which driver to use, and you'll get database errors.

