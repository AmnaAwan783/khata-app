# DigiKhata App - Run Instructions

## ✅ All Functionalities Implemented

1. ✅ **Customer Contacts Integration** - Manual entry + Browse Contacts button
2. ✅ **Cash vs Credit Sales** - Separate sale types with proper handling
3. ✅ **Daily Sales Page** - Date selector with summary (Total, Paid, Unpaid)
4. ✅ **Customer Ledger** - Shows all credit sales with outstanding balance
5. ✅ **Stock Auto-Update** - Stock validation and automatic reduction
6. ✅ **Invoice Generation** - Professional invoices with WhatsApp sharing
7. ✅ **UI/UX Consistency** - Bootstrap styling throughout
8. ✅ **Input Validation** - Duplicate customers, stock checks, etc.

## 🚀 How to Run the Application

### Step 1: Activate Virtual Environment (if using one)

If you have a virtual environment:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows Command Prompt
venv\Scripts\activate.bat
```

### Step 2: Install Dependencies (if needed)

Make sure Flask and Flask-SQLAlchemy are installed:
```bash
pip install flask flask-sqlalchemy
```

### Step 3: Run the Application

```bash
python app.py
```

The application will start on: **http://127.0.0.1:5000**

### Step 4: Access the Application

Open your web browser and go to:
```
http://127.0.0.1:5000
```

## 📱 Testing the Application

### Test Flow:

1. **Add Items (Stock Management)**
   - Go to "Items" from navigation
   - Add a few items with stock quantities
   - Example: "Rice", Unit: "kg", Stock Quantity: 100

2. **Add Customers**
   - Go to "Customers" from navigation
   - Add customers manually (Name + Phone required)
   - Try the "Browse Contacts" button (works in supported browsers)
   - Try adding duplicate phone - should show error

3. **Add Sales**
   - Go to "Add Sale"
   - Test Cash Sale:
     - Select "Cash Sale"
     - Select item, enter quantity and price
     - Paid amount auto-fills to total
   - Test Credit Sale:
     - Select "Credit Sale"
     - Select customer and item
     - Enter quantity, price, and partial payment
     - Should redirect to invoice page

4. **View Daily Sales**
   - Go to "Daily Sales"
   - Select today's date (default)
   - See summary: Total Sales, Total Paid, Total Unpaid
   - View all sales for the day (cash and credit)

5. **View Customer Ledger**
   - Go to "Customers"
   - Click on a customer name
   - See all credit sales with outstanding balance
   - Cash sales should NOT appear here

6. **View Stock**
   - Go to "Stock"
   - See remaining stock after sales
   - Stock automatically decreases when items are sold

7. **Generate Invoice**
   - After a credit sale, invoice is shown automatically
   - Click "Copy Message" to copy invoice text
   - Click "Send via WhatsApp" to share with customer

## 🔍 Key Features to Test

- ✅ Stock validation (try selling more than available stock)
- ✅ Duplicate customer phone validation
- ✅ Cash sales don't appear in customer ledger
- ✅ Credit sales appear in customer ledger
- ✅ Daily sales shows both cash and credit
- ✅ Invoice generation for credit sales only
- ✅ Stock automatically reduces on sale

## 📝 Notes

- The app works offline (except for contact browsing and WhatsApp sharing)
- Database is automatically created on first run
- All data is stored in `instance/database.db`
- The app is mobile-responsive (works on phones and laptops)
