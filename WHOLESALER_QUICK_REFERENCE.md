# Wholesaler Transactions - Quick Reference

## Navigation
- **Main App Menu** → Click "Wholesalers" link in navbar

## Main Pages

### 1. Wholesaler Transactions (Main Page)
**URL:** `/wholesaler-transactions`
**What to do:**
- ➕ Add new transactions
- 🔍 Search wholesalers
- 📊 See all wholesalers and their balance

**Quick Actions:**
- Search wholesaler by name or phone
- Click wholesaler name to select
- Fill item, quantity, price
- Total and balance calculate automatically
- Click "Save Transaction"

### 2. Wholesaler Details
**URL:** `/wholesaler/<id>`
**What to do:**
- 📊 View all transactions for one wholesaler
- 💰 See total bill, paid amount, balance
- 📋 Check payment status for each transaction
- 🗑️ Delete transactions

### 3. Manage Wholesalers
**URL:** `/wholesalers`
**What to do:**
- ➕ Add new wholesalers
- 📋 View all wholesalers
- 💼 See transaction counts and balances
- 🗑️ Delete wholesalers

## Quick Actions

### Add a New Transaction
```
1. Go to Wholesaler Transactions page
2. Search for wholesaler name (or phone)
3. Click wholesaler in dropdown
4. Enter:
   - Item name (e.g., "Medicine Box")
   - Quantity (e.g., 10)
   - Price per unit (e.g., 50)
5. Enter amount paid (or leave 0)
6. Add optional notes
7. Click "Save Transaction"
```
✅ Total Price and Remaining Balance calculate automatically!

### Check Wholesaler Balance
```
1. Go to Wholesaler Transactions page
2. Look at wholesaler list on the right
3. See balance badge:
   - 🔴 Red: Amount due to wholesaler
   - 🟢 Green: Amount wholesaler owes you
   - 🔵 Blue: All settled
```

### View Complete History
```
1. Go to Wholesaler Transactions page
2. Find wholesaler in list
3. Click "View Details"
4. See all transactions in table format
5. Check payment status for each
```

### Add New Wholesaler
```
Option A (Quick Add):
1. Go to Wholesaler Transactions
2. Click "Add New Wholesaler" button
3. Fill name, phone, address
4. Click "Add Wholesaler"
5. Wholesaler selected automatically

Option B (Management Page):
1. Go to Wholesalers page
2. Click "Add New Wholesaler" tab
3. Fill name, phone, address
4. Click "Add Wholesaler"
```

### Delete Transaction
```
1. Go to Wholesaler Details page (click "View Details")
2. Find transaction in table
3. Click "Delete" button in last column
4. Confirm deletion
```

### Delete Wholesaler
```
1. Go to Wholesalers page
2. Find wholesaler card
3. Click "Delete" button
⚠️ This also deletes all transactions!
```

## Understanding Calculations

### Total Price
**Formula:** Quantity × Price per Unit
**Example:** 10 items × Rs 50 each = Rs 500
**When calculated:** Automatically when you change quantity or price

### Remaining Balance
**Formula:** Total Price - Amount Paid
**Example:** Rs 500 - Rs 300 paid = Rs 200 remaining
**When calculated:** Automatically when you change amount paid

### Wholesaler Total Balance
**Formula:** Sum of (Total Price - Amount Paid) for all transactions
**Shows on:** Wholesaler card and detail page

## Understanding Balance Status

| Balance Amount | Status | Color | Meaning |
|---|---|---|---|
| Rs 100 | "Due" | 🔴 Red | You owe wholesaler |
| Rs -50 | "Paid" | 🟢 Green | Wholesaler owes you |
| Rs 0 | "Settled" | 🔵 Blue | All even |

## Transaction Status Badges

| Status | When | Color |
|---|---|---|
| ✅ PAID | Remaining = 0 | Green |
| ⚠️ PARTIAL | 0 < Remaining < Total | Yellow |
| ❌ UNPAID | Amount Paid = 0 | Red |

## Common Scenarios

### Scenario 1: Full Payment
```
Total Price: Rs 500
Amount Paid: Rs 500
Remaining: Rs 0 ✅ PAID
```

### Scenario 2: Partial Payment
```
Total Price: Rs 500
Amount Paid: Rs 300
Remaining: Rs 200 ⚠️ PARTIAL
```

### Scenario 3: No Payment Yet
```
Total Price: Rs 500
Amount Paid: Rs 0
Remaining: Rs 500 ❌ UNPAID
```

### Scenario 4: Overpaid
```
Total Price: Rs 500
Amount Paid: Rs 600
Remaining: Rs -100 (Credit to wholesaler)
```

## Keyboard Shortcuts

| Field | Input Type | Notes |
|---|---|---|
| Quantity | Decimal | Use . for decimals (e.g., 10.5) |
| Price | Decimal | Use . for decimals (e.g., 50.50) |
| Phone | Numeric | Numbers only |

## Tips & Tricks

💡 **Use Item Names Consistently**
- "Medicine Box" not "med box" or "box meds"
- Helps with searching and reporting

💡 **Add Notes for Reference**
- Add invoice number
- Add delivery date
- Add any special terms

💡 **Check Balance Regularly**
- Go to Wholesaler Details page
- See payment status per transaction
- Know exactly what's due

💡 **Mobile Entry**
- All fields optimized for mobile
- Decimal keyboard appears automatically
- All calculations instant

💡 **Search Anytime**
- Start typing wholesaler name
- Or search by phone number
- Results appear in real-time

## What Gets Calculated Automatically

✅ **These update automatically as you type:**
- Total Price (from quantity × price)
- Remaining Balance (from total - paid)
- Wholesaler total balance

❌ **These you must enter:**
- Wholesaler name
- Item name
- Quantity
- Price per unit
- Amount paid

## Data That's Stored

For each transaction, stored:
- ✓ Wholesaler ID
- ✓ Item name
- ✓ Quantity purchased
- ✓ Price per unit
- ✓ Total price
- ✓ Amount paid
- ✓ Date and time
- ✓ Optional notes

For each wholesaler, stored:
- ✓ Name
- ✓ Phone (optional)
- ✓ Address (optional)
- ✓ All their transactions

## Troubleshooting Quick Tips

**Problem:** Wholesaler not in search results
**Solution:** 
- Make sure you saved the wholesaler first
- Try searching by phone instead of name
- Check exact spelling

**Problem:** Calculations not updating
**Solution:**
- Click outside the field after typing
- Wait 2 seconds for calculation
- Refresh page if needed

**Problem:** Wrong balance showing
**Solution:**
- Go to Wholesaler Details page
- Check each transaction amount
- Verify paid amounts
- Add up manually to double-check

**Problem:** Can't delete wholesaler
**Solution:**
- Make sure not using it in active transaction
- If "Delete" button disabled, try again after saving

---

## Getting Help

1. Read the **transaction guide** for detailed instructions
2. Check **implementation summary** for technical details
3. Look at **this quick reference** for common tasks
4. Test with a practice wholesaler first

---

**Last Updated:** January 29, 2026
**Version:** 1.0
