# Wholesaler Transactions System

## Overview
A complete wholesaler transaction management system integrated into your Khata app. Track purchases from wholesalers, manage payments, and automatically calculate balances.

## Features

### 1. **Wholesaler Management**
- Add, view, and delete wholesalers
- Store wholesaler contact information (name, phone, address)
- View all transactions for each wholesaler
- Track total balance per wholesaler

### 2. **Transaction Recording**
- Add transactions quickly with a form-based interface
- Record:
  - Item name
  - Quantity purchased
  - Price per unit
  - Amount paid

### 3. **Automatic Calculations**
- **Total Price** = Quantity × Price per Unit (calculated automatically)
- **Remaining Balance** = Total Price - Amount Paid (calculated in real-time)
- All calculations update instantly as you type

### 4. **Balance Tracking**
- View outstanding balance for each wholesaler
- Track total bill amount vs. amount paid
- See payment status (Paid, Partial, Unpaid)
- Remaining balance updates automatically

### 5. **Quick Access Features**
- Search and select existing wholesalers
- Add new wholesaler inline without leaving the transaction form
- Autocomplete suggestions
- View wholesaler details and transaction history

## Database Schema

### Wholesaler Model
```python
class Wholesaler(db.Model):
    id              - Primary Key
    name            - Wholesaler name (required)
    phone           - Contact phone number
    address         - Business address
    transactions    - Relationship to transactions
```

### WholesalerTransaction Model
```python
class WholesalerTransaction(db.Model):
    id              - Primary Key
    wholesaler_id   - Foreign key to Wholesaler
    item_name       - Name of item purchased
    quantity        - Quantity purchased
    price_per_unit  - Cost per unit
    total_price     - Quantity × Price per unit
    paid_amount     - Amount paid so far
    date            - Transaction date/time
    notes           - Optional notes/reference
```

## Pages and Routes

### Main Transaction Page
**Route:** `/wholesaler-transactions`
**Features:**
- Add new transactions
- Select/search wholesalers
- Quick add new wholesaler
- View all wholesalers with balance status
- Real-time calculations

### Wholesaler Details Page
**Route:** `/wholesaler/<id>`
**Features:**
- Summary cards showing:
  - Total bill amount
  - Total paid
  - Remaining balance
  - Number of transactions
- Full transaction history table
- View each transaction's status (Paid/Partial/Unpaid)
- Delete individual transactions

### Wholesaler Management Page
**Route:** `/wholesalers`
**Features:**
- Add new wholesalers
- View all wholesalers in card/grid layout
- See total transactions and balance for each
- Quick access to details page
- Delete wholesalers

## API Endpoints

### Create Wholesaler
```
POST /api/wholesalers
Content-Type: application/json

{
    "name": "ABC Pharmaceuticals",
    "phone": "+92-300-1234567",
    "address": "Street, City"
}

Response: { id, name, phone, address } [201 Created]
```

### Get All Wholesalers
```
GET /api/wholesalers
Response: [{ id, name, phone, address }, ...]
```

### Search Wholesalers
```
GET /api/wholesalers/search?q=abc
Response: [{ id, name, phone, address }, ...]
```

## Usage Guide

### Adding a Transaction

1. **Navigate** to Wholesalers > Wholesaler Transactions (from menu)

2. **Select/Search Wholesaler:**
   - Type wholesaler name or phone in the search box
   - Click on a result to select
   - Or click "Add New Wholesaler" to add one first

3. **Enter Transaction Details:**
   - **Item Name:** Type the name of item purchased (e.g., "Medicine Box", "Syrup Bottles")
   - **Quantity:** Enter quantity purchased
   - **Price per Unit:** Enter the cost per unit
   - **Total Price:** Automatically calculated
   - **Amount Paid:** Enter amount paid (optional)
   - **Remaining Balance:** Automatically calculated

4. **Add Notes (Optional):**
   - Add any reference info or notes about the transaction

5. **Save Transaction:**
   - Click "Save Transaction" button
   - Transaction is recorded and balance updates immediately

### Viewing Wholesaler Details

1. **From Main Page:**
   - Click "View Details" on any wholesaler card

2. **On Detail Page:**
   - See summary cards with total bill, paid, balance
   - Browse full transaction history table
   - See payment status for each transaction
   - Delete individual transactions if needed

### Adding Wholesalers

**Option 1: From Main Transaction Page**
- Click "Add New Wholesaler" button
- Fill in name, phone, address
- Click "Add Wholesaler"
- Wholesaler is added to dropdown and selected

**Option 2: From Wholesalers Management Page**
- Click "Wholesalers" → "Add New Wholesaler" tab
- Fill in details
- Click "Add Wholesaler"

## Calculation Examples

### Example Transaction

**Input:**
- Quantity: 10 units
- Price per Unit: Rs 50
- Amount Paid: Rs 400

**Automatic Calculations:**
- Total Price = 10 × 50 = **Rs 500**
- Remaining Balance = 500 - 400 = **Rs 100**

### Balance Status

| Remaining Balance | Status | Display |
|------------------|--------|---------|
| > 0 | Due Amount | Red badge "Due: Rs XXX" |
| < 0 | Overpaid | Green badge "Paid: Rs XXX" |
| = 0 | Settled | Blue badge "Settled" |

## UI Features

### Real-time Calculations
All calculations update instantly as you type:
- Change quantity → Total updates immediately
- Change price → Total updates immediately
- Change paid amount → Remaining balance updates immediately

### Color-coded Status
- **Green:** Payment received/settled
- **Yellow:** Partial payment
- **Red:** Unpaid/Due amount

### Responsive Design
- Works perfectly on desktop, tablet, and mobile
- Touch-friendly buttons and inputs
- Optimized for offline use (PWA compatible)

## Integration with Existing App

### Database
- New models added to existing database
- No existing data affected
- Uses same SQLAlchemy ORM

### Navigation
- Added "Wholesalers" link to main navigation menu
- Accessible from any page
- Consistent with existing UI/UX

### Styling
- Uses existing Bootstrap 5.3.2 theme
- Matches existing color scheme and fonts
- Responsive design consistent with app

## Tips & Best Practices

1. **Recording Transactions:**
   - Always record the full amount before payment if possible
   - You can update "Amount Paid" separately later
   - Add notes for reference (invoice #, delivery date, etc.)

2. **Managing Balance:**
   - Remaining balance updates automatically
   - Negative balance means wholesaler owes you money
   - Positive balance means you owe the wholesaler

3. **Data Organization:**
   - Keep wholesaler names consistent (exact same spelling)
   - Include area/city in address for clarity
   - Use notes field for important references

4. **Reporting:**
   - View wholesaler details page for complete transaction history
   - See payment status for each transaction
   - Track outstanding balance easily

## Troubleshooting

### Wholesaler Not Appearing in Search
- Make sure you've saved the wholesaler first
- Check exact spelling of name
- Try searching by phone number instead

### Calculations Not Updating
- Make sure to click outside the field after typing
- Or wait 1-2 seconds after typing
- Reload page if issues persist

### Balance Showing Wrong Amount
- Check that all transactions are recorded correctly
- Verify paid amounts are accurate
- View detail page to see transaction breakdown

## Future Enhancements

Potential features to add:
- Payment history and tracking
- Due date reminders
- Bulk payment recording
- Export transaction reports
- Recurring orders
- Price history tracking
- SMS/Email notifications

---

**Created:** January 2026
**Version:** 1.0
**Compatible with:** Python 3.7+, Flask 2.0+, SQLite 3.0+
