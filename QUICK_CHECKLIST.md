# ✅ Quick Reference Checklist

Copy this and save it for your deployment process.

---

## Pre-Deployment Checklist (Do These FIRST)

- [ ] Read `VISUAL_CHANGES_GUIDE.md` to see what changed
- [ ] Test app locally: `python app.py`
- [ ] Can add customers/items/sales without errors
- [ ] Wholesaler page shows category & unit fields
- [ ] Stock display shows when selecting items in add sale
- [ ] Data persists after closing and reopening browser

---

## Git Commit Checklist

```bash
# Run these commands in order
git add .
git commit -m "Add wholesaler category/unit fields, real-time stock display, PostgreSQL support"
git push origin main
```

- [ ] Code pushed to GitHub
- [ ] No git errors
- [ ] Latest code visible on GitHub website

---

## Koyeb Deployment Checklist

### Step 1: Create Database (5 min)
- [ ] Go to Koyeb.com and login
- [ ] Go to Add-ons → Create Add-on
- [ ] Select PostgreSQL
- [ ] Set Database Name: `khata_app`
- [ ] Set Username: `khata_user`
- [ ] Create and wait 2-3 minutes
- [ ] Copy connection string (looks like: `postgresql://user:pass@host:port/db`)

### Step 2: Create Service (5 min)
- [ ] Go to Services → Create Service
- [ ] Select GitHub and connect
- [ ] Select your `khata app` repository
- [ ] Select branch: `main`
- [ ] Set Port: `5000`
- [ ] Set Run Command: `gunicorn app:app`

### Step 3: Set Environment Variables (3 min)
- [ ] Add `DATABASE_URL` = your PostgreSQL connection string
- [ ] Add `SECRET_KEY` = random 32-character string (use: `python -c "import secrets; print(secrets.token_hex(32))"`)
- [ ] Add `FLASK_DEBUG` = False
- [ ] Add `PORT` = 5000 (or leave empty)

### Step 4: Deploy (2 min)
- [ ] Click "Create Service" or "Deploy"
- [ ] Wait for green "Running" status
- [ ] Note your app URL: `https://your-app-name.koyeb.app`

### Step 5: Test (5 min)
- [ ] Open app URL in browser
- [ ] Add a customer
- [ ] Add an item
- [ ] Add a sale
- [ ] Refresh page → data still there ✅
- [ ] Wait 1 hour and check again ✅
- [ ] Go to Koyeb and click "Redeploy"
- [ ] Data still there ✅

---

## Troubleshooting Checklist

### If Data Disappears

**Check 1: DATABASE_URL**
- [ ] Go to Settings → Environment Variables
- [ ] Confirm `DATABASE_URL` is set
- [ ] Check it starts with `postgresql://` (NOT `sqlite://`)
- [ ] Redeploy

**Check 2: PostgreSQL Connection**
- [ ] Go to Add-ons → PostgreSQL
- [ ] Check status is "Running" (green)
- [ ] Copy fresh connection string
- [ ] Update `DATABASE_URL` env variable
- [ ] Redeploy

**Check 3: Logs**
- [ ] Go to Logs tab in Koyeb
- [ ] Look for errors
- [ ] Search for "sqlite" (should NOT appear)
- [ ] Search for "postgresql" (SHOULD appear)

### If App Won't Start

**Check 1: Environment Variables**
- [ ] All required variables present (DATABASE_URL, SECRET_KEY)
- [ ] No typos in variable names
- [ ] Redeploy

**Check 2: Python Errors**
- [ ] Check Logs tab
- [ ] Look for Python error messages
- [ ] Could mean code has syntax error - fix and push to GitHub

**Check 3: Port**
- [ ] Confirm PORT is set to 5000
- [ ] Or leave PORT empty (Koyeb sets it automatically)

---

## What Should Work

✅ App loads without errors
✅ Can add customers
✅ Can add items with prices and stock
✅ Can add sales with items and quantities
✅ Can see wholesaler transactions with category & unit
✅ Stock display updates when selecting items
✅ Data persists after browser refresh
✅ Data persists after app redeploy
✅ HTTPS works (green lock icon)
✅ Mobile view works
✅ Offline mode works (if previously set up)

---

## Support Resources

1. **Deployment help**: `KOYEB_EASY_DEPLOYMENT.md`
2. **Quick fixes**: `KOYEB_QUICK_FIX.md`
3. **Visual changes**: `VISUAL_CHANGES_GUIDE.md`
4. **All changes**: `CHANGES_COMPLETED.md`

---

## Emergency Support

If something goes wrong:

1. Check Logs in Koyeb dashboard
2. Look for error messages
3. Search in the documentation files above
4. Check these key things:
   - Is PostgreSQL running? (Add-ons → PostgreSQL)
   - Is DATABASE_URL set correctly? (Settings → Env Variables)
   - Does app show "Running" status? (Green)

---

## Success Indicator

You'll know it's working when:

1. ✅ App loads at your Koyeb URL
2. ✅ Can add data
3. ✅ Data exists after browser refresh
4. ✅ Data exists after Redeploy
5. ✅ No errors in Logs tab
6. ✅ Category/Unit show in wholesaler
7. ✅ Stock display shows in add sale

---

**Estimated total time: 20-30 minutes**

🎉 You're ready to deploy!

