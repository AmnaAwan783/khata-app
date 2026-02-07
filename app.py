from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from datetime import date
from sqlalchemy import extract

# ------------------
# App Setup
# ------------------
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'
db = SQLAlchemy(app)

# ------------------
# Database Models
# ------------------
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))

    sales = db.relationship('Sale', backref='customer', lazy=True)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    unit = db.Column(db.String(20))
    purchase_price = db.Column(db.Float)
    sale_price = db.Column(db.Float)
    stock_quantity = db.Column(db.Float, default=0.0)

    sales = db.relationship('Sale', backref='item', lazy=True)
    
class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)

    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    paid_amount = db.Column(db.Float, default=0.0)
    date = db.Column(db.DateTime, default=datetime.utcnow)

class Wholesaler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

    transactions = db.relationship('WholesalerTransaction', backref='wholesaler', lazy=True, cascade='all, delete-orphan')

class WholesalerTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wholesaler_id = db.Column(db.Integer, db.ForeignKey('wholesaler.id'), nullable=False)
    
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    
    paid_amount = db.Column(db.Float, default=0.0)
    
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.String(500))

# ------------------
# Database Initialization
# ------------------

# Create all tables if they don't exist
def init_db():
    """Initialize database tables on app startup"""
    with app.app_context():
        try:
            db.create_all()
            print("✓ Database tables initialized successfully")
        except Exception as e:
            print(f"✗ Error initializing database: {e}")

# Call init_db before handling requests
init_db()

# ------------------
# Routes
# ------------------

@app.route("/")
def home():
    # Instead of redirecting to customers, show a dashboard
    total_customers = Customer.query.count()
    total_items = Item.query.count()
    # Placeholder for earnings; we can calculate later
    total_sales = 0
    return render_template("dashboard.html",
                           total_customers=total_customers,
                           total_items=total_items,
                           total_sales=total_sales)

# Customers page
@app.route("/customers", methods=["GET", "POST"])
def customers():
    if request.method == "POST":
        name = request.form["name"]
        phone = request.form["phone"]
        
        # Validate phone number is mandatory
        if not phone:
            flash("Phone number is required", "error")
            return redirect(url_for("customers"))
        
        # Check for duplicate phone number
        existing_customer = Customer.query.filter_by(phone=phone).first()
        if existing_customer:
            flash(f"Customer with phone number {phone} already exists: {existing_customer.name}", "error")
            return redirect(url_for("customers"))
        
        db.session.add(Customer(name=name, phone=phone))
        db.session.commit()
        flash("Customer added successfully", "success")
        return redirect(url_for("customers"))
    all_customers = Customer.query.all()
    return render_template("customers.html", customers=all_customers)

# ============================================
# API Endpoints
# ============================================

# API endpoint for contact integration
@app.route("/api/contacts", methods=["GET"])
def get_contacts():
    # This endpoint can be used by frontend to access contacts
    # In a real implementation, this would integrate with browser Contact API
    return jsonify({"message": "Contact API endpoint - use browser Contact API on client side"})

# API endpoint to get all customers (for offline sync)
@app.route("/api/customers", methods=["GET"])
def api_customers():
    """Get all customers as JSON"""
    customers = Customer.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'phone': c.phone
    } for c in customers])

# API endpoint to search customers
@app.route("/api/customers/search", methods=["GET"])
def api_customers_search():
    """Search customers by name or phone"""
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 1:
        return jsonify([])
    
    # Search by name or phone using LIKE (SQLite compatible)
    # SQLite doesn't support ILIKE, so we use LIKE with lower() or case-insensitive search
    query_lower = query.lower()
    customers = Customer.query.filter(
        db.or_(
            db.func.lower(Customer.name).like(f'%{query_lower}%'),
            Customer.phone.like(f'%{query}%')
        )
    ).limit(10).all()
    
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'phone': c.phone
    } for c in customers])

# API endpoint to get all items (for offline sync)
@app.route("/api/items", methods=["GET"])
def api_items():
    """Get all items as JSON"""
    items = Item.query.all()
    return jsonify([{
        'id': i.id,
        'name': i.name,
        'category': i.category,
        'unit': i.unit,
        'purchase_price': i.purchase_price,
        'sale_price': i.sale_price,
        'stock_quantity': i.stock_quantity
    } for i in items])

# API endpoint to create customer (for inline add)
@app.route("/api/customers", methods=["POST"])
def api_create_customer():
    """Create a new customer via API"""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('phone'):
        return jsonify({'error': 'Name and phone are required'}), 400
    
    # Check for duplicate phone
    existing = Customer.query.filter_by(phone=data['phone']).first()
    if existing:
        return jsonify({'error': f'Customer with phone {data["phone"]} already exists'}), 400
    
    customer = Customer(name=data['name'], phone=data['phone'])
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'phone': customer.phone
    }), 201

@app.route("/customer/<int:id>")
def customer_detail(id):
    customer = Customer.query.get_or_404(id)

    # Get all credit sales for this customer (exclude cash sales)
    all_sales = Sale.query.filter(
        Sale.customer_id == id
    ).order_by(Sale.date.desc()).all()

    # Calculations for all time
    total_bill = sum(s.total_price for s in all_sales)
    total_paid = sum(s.paid_amount for s in all_sales)
    balance = total_bill - total_paid

    return render_template(
        "customer_detail.html",
        customer=customer,
        sales=all_sales,
        total_bill=total_bill,
        total_paid=total_paid,
        balance=balance
    )

@app.route("/customer-bills")
def customer_bills():
    customers = Customer.query.all()

    now = datetime.now()
    this_month = now.month
    this_year = now.year

    # Last month handling (January edge case)
    if this_month == 1:
        last_month = 12
        last_year = this_year - 1
    else:
        last_month = this_month - 1
        last_year = this_year

    customer_data = []

    for c in customers:
        # This month sales
        this_sales = Sale.query.filter(
            Sale.customer_id == c.id,
            extract('month', Sale.date) == this_month,
            extract('year', Sale.date) == this_year
        ).all()

        this_total = sum(s.total_price for s in this_sales)
        this_paid = sum(s.paid_amount for s in this_sales)
        this_unpaid = this_total - this_paid

        # Last month sales
        last_sales = Sale.query.filter(
            Sale.customer_id == c.id,
            extract('month', Sale.date) == last_month,
            extract('year', Sale.date) == last_year
        ).all()

        last_total = sum(s.total_price for s in last_sales)
        last_paid = sum(s.paid_amount for s in last_sales)
        last_unpaid = last_total - last_paid

        customer_data.append({
            "customer": c,
            "this_total": this_total,
            "this_paid": this_paid,
            "this_unpaid": this_unpaid,
            "last_total": last_total,
            "last_paid": last_paid,
            "last_unpaid": last_unpaid
        })

    return render_template("customer_bills.html", customer_data=customer_data)

@app.route('/customers/summary')
def customer_summary():
    today = date.today()
    this_month = today.month
    this_year = today.year

    # calculate last month properly
    if this_month == 1:
        last_month = 12
        last_year = this_year - 1
    else:
        last_month = this_month - 1
        last_year = this_year

    customers = Customer.query.all()
    summary = []

    for customer in customers:
        # THIS MONTH
        this_month_sales = Sale.query.filter(
            Sale.customer_id == customer.id,
            extract('month', Sale.date) == this_month,
            extract('year', Sale.date) == this_year
        ).all()

        this_month_total = sum(s.total_price for s in this_month_sales)
        this_month_paid = sum(s.paid_amount for s in this_month_sales)

        # LAST MONTH
        last_month_sales = Sale.query.filter(
            Sale.customer_id == customer.id,
            extract('month', Sale.date) == last_month,
            extract('year', Sale.date) == last_year
        ).all()

        last_month_total = sum(s.total_price for s in last_month_sales)
        last_month_paid = sum(s.paid_amount for s in last_month_sales)

        # ALL TIME
        all_sales = Sale.query.filter_by(customer_id=customer.id).all()
        total_bill = sum(s.total_price for s in all_sales)
        total_paid = sum(s.paid_amount for s in all_sales)

        summary.append({
            "customer": customer.name,
            "this_month_bill": this_month_total,
            "this_month_unpaid": this_month_total - this_month_paid,
            "last_month_bill": last_month_total,
            "last_month_unpaid": last_month_total - last_month_paid,
            "total_unpaid": total_bill - total_paid
        })

    return render_template("customer_summary.html", summary=summary)

# Items page
@app.route("/items", methods=["GET", "POST"])
def items():
    if request.method == "POST":
        name = request.form["name"]
        category = request.form.get("category")
        unit = request.form.get("unit")
        purchase_price = request.form.get("purchase_price")
        sale_price = request.form.get("sale_price")
        stock_quantity = request.form.get("stock_quantity")

        # Convert prices to float safely
        try:
            purchase_price = float(purchase_price) if purchase_price else 0.0
            sale_price = float(sale_price) if sale_price else 0.0
            stock_quantity = float(stock_quantity) if stock_quantity else 0.0
        except ValueError:
            purchase_price = 0.0
            sale_price = 0.0
            stock_quantity = 0.0

        db.session.add(Item(
            name=name,
            category=category,
            unit=unit,
            purchase_price=purchase_price,
            sale_price=sale_price,
            stock_quantity=stock_quantity
        ))
        db.session.commit()
        flash("Item added successfully", "success")
        return redirect(url_for("items"))
    all_items = Item.query.all()
    return render_template("items.html", items=all_items)

@app.route('/stock')
def stock():
    items = Item.query.all()
    stock_data = []

    for item in items:
        sold_qty = db.session.query(
            db.func.sum(Sale.quantity)
        ).filter(Sale.item_id == item.id).scalar() or 0

        # Calculate remaining stock
        remaining = item.stock_quantity - sold_qty
        if remaining < 0:
            remaining = 0

        stock_data.append({
            "name": item.name,
            "purchased": item.stock_quantity,
            "sold": sold_qty,
            "remaining": remaining,
            "unit": item.unit
        })

    return render_template("stock.html", stock_data=stock_data)

# Add Sale page
@app.route("/add-sale", methods=["GET", "POST"])
def add_sale():
    customers = Customer.query.all()
    items = Item.query.all()

    if request.method == "POST":
        sale_type = request.form.get("sale_type")  # "cash" or "credit"
        item_id = request.form["item_id"]
        quantity = float(request.form["quantity"])
        unit_price = float(request.form["unit_price"])
        paid_amount = float(request.form.get("paid_amount", 0))

        # Get item and check stock
        item = Item.query.get_or_404(item_id)
        
        # Calculate sold quantity so far
        sold_qty = db.session.query(
            db.func.sum(Sale.quantity)
        ).filter(Sale.item_id == item_id).scalar() or 0
        
        available_stock = item.stock_quantity - sold_qty
        
        # Check if stock is sufficient
        if quantity > available_stock:
            flash(f"Insufficient stock. Available: {available_stock} {item.unit}", "error")
            return redirect(url_for("add_sale"))

        total_price = quantity * unit_price

        # For cash sales: customer_id is NULL, paid_amount equals total_price
        # For credit sales: customer_id is set, paid_amount can be partial
        customer_id = None
        if sale_type == "credit":
            customer_id = request.form.get("customer_id")
            if not customer_id:
                flash("Please select a customer for credit sale", "error")
                return redirect(url_for("add_sale"))
        else:
            # Cash sale - paid amount must equal total
            paid_amount = total_price

        sale = Sale(
            customer_id=customer_id,
            item_id=item_id,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price,
            paid_amount=paid_amount
        )

        db.session.add(sale)
        db.session.commit()

        # Redirect to invoice if credit sale, otherwise to daily sales
        if sale_type == "credit" and customer_id:
            return redirect(url_for("invoice", sale_id=sale.id))
        else:
            flash("Cash sale recorded successfully", "success")
            return redirect(url_for("sales"))

    return render_template(
        "add_sale.html",
        customers=customers,
        items=items
    )

# Daily Sales page
@app.route("/sales")
def sales():
    # Get date from query parameter or use today
    date_str = request.args.get("date")
    if date_str:
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            selected_date = date.today()
    else:
        selected_date = date.today()

    # Get all sales for the selected date
    start_datetime = datetime.combine(selected_date, datetime.min.time())
    end_datetime = datetime.combine(selected_date, datetime.max.time())
    
    daily_sales = Sale.query.filter(
        Sale.date >= start_datetime,
        Sale.date <= end_datetime
    ).order_by(Sale.date.desc()).all()

    # Calculate summaries
    total_sales = sum(s.total_price for s in daily_sales)
    total_paid = sum(s.paid_amount for s in daily_sales)
    total_unpaid = total_sales - total_paid

    return render_template(
        "sales.html",
        sales=daily_sales,
        selected_date=selected_date,
        total_sales=total_sales,
        total_paid=total_paid,
        total_unpaid=total_unpaid
    )

@app.route("/delete-sale/<int:id>")
def delete_sale(id):
    sale = Sale.query.get_or_404(id)
    db.session.delete(sale)
    db.session.commit()
    flash("Sale deleted successfully", "success")
    return redirect(url_for("sales"))

@app.route("/delete-customer/<int:id>")
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return redirect(url_for("customers"))

@app.route("/delete-item/<int:id>")
def delete_item(id):
    item = Item.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    flash("Item deleted successfully", "success")
    return redirect(url_for("items"))

# ============================================
# WHOLESALER TRANSACTIONS ROUTES
# ============================================

# Wholesaler Transactions page
@app.route("/wholesaler-transactions", methods=["GET", "POST"])
def wholesaler_transactions():
    wholesalers = Wholesaler.query.all()
    
    if request.method == "POST":
        wholesaler_id = request.form.get("wholesaler_id")
        item_name = request.form.get("item_name")
        quantity = float(request.form.get("quantity", 0))
        price_per_unit = float(request.form.get("price_per_unit", 0))
        paid_amount = float(request.form.get("paid_amount", 0))
        notes = request.form.get("notes", "")
        
        if not wholesaler_id:
            flash("Please select or add a wholesaler", "error")
            return redirect(url_for("wholesaler_transactions"))
        
        if not item_name or quantity <= 0 or price_per_unit <= 0:
            flash("Please fill all required fields with valid values", "error")
            return redirect(url_for("wholesaler_transactions"))
        
        total_price = quantity * price_per_unit

        # Ensure corresponding Item exists and update stock_quantity
        # Try to match item by case-insensitive name
        item = Item.query.filter(db.func.lower(Item.name) == item_name.strip().lower()).first()
        if item:
            # Update purchase price to latest wholesaler price
            item.purchase_price = price_per_unit
            # If sale_price is not set, keep it same as purchase price
            if not item.sale_price:
                item.sale_price = price_per_unit
            # Increase total purchased (stock_quantity) by purchased amount
            item.stock_quantity = (item.stock_quantity or 0) + quantity
            db.session.add(item)
        else:
            # Create a new Item using wholesaler data
            new_item = Item(
                name=item_name,
                unit=None,
                purchase_price=price_per_unit,
                sale_price=price_per_unit,
                stock_quantity=quantity
            )
            db.session.add(new_item)

        # Create and save the wholesaler transaction
        transaction = WholesalerTransaction(
            wholesaler_id=wholesaler_id,
            item_name=item_name,
            quantity=quantity,
            price_per_unit=price_per_unit,
            total_price=total_price,
            paid_amount=paid_amount,
            notes=notes
        )

        db.session.add(transaction)
        db.session.commit()
        flash("Transaction added successfully", "success")
        return redirect(url_for("wholesaler_transactions"))
    
    return render_template("wholesaler_transactions.html", wholesalers=wholesalers)

# Get Wholesaler Detail
@app.route("/wholesaler/<int:id>")
def wholesaler_detail(id):
    wholesaler = Wholesaler.query.get_or_404(id)
    transactions = WholesalerTransaction.query.filter_by(wholesaler_id=id).order_by(WholesalerTransaction.date.desc()).all()
    
    # Calculate totals - handle empty list
    if transactions:
        total_bill = sum(t.total_price for t in transactions)
        total_paid = sum(t.paid_amount for t in transactions)
        balance = total_bill - total_paid
    else:
        total_bill = 0.0
        total_paid = 0.0
        balance = 0.0

    # Provide absolute balance value for templates to avoid calling Python builtins in Jinja
    abs_balance = abs(balance)
    
    return render_template(
        "wholesaler_detail.html",
        wholesaler=wholesaler,
        transactions=transactions,
        total_bill=total_bill,
        total_paid=total_paid,
        balance=balance,
        abs_balance=abs_balance
    )

# Add/Edit Wholesaler
@app.route("/wholesalers", methods=["GET", "POST"])
def wholesalers():
    if request.method == "POST":
        name = request.form.get("name")
        phone = request.form.get("phone")
        address = request.form.get("address", "")
        
        if not name:
            flash("Wholesaler name is required", "error")
            return redirect(url_for("wholesalers"))
        
        # Check for duplicate phone
        if phone:
            existing = Wholesaler.query.filter_by(phone=phone).first()
            if existing:
                flash(f"Wholesaler with phone {phone} already exists", "error")
                return redirect(url_for("wholesalers"))
        
        wholesaler = Wholesaler(name=name, phone=phone, address=address)
        db.session.add(wholesaler)
        db.session.commit()
        flash("Wholesaler added successfully", "success")
        return redirect(url_for("wholesalers"))
    
    all_wholesalers = Wholesaler.query.all()
    return render_template("wholesalers.html", wholesalers=all_wholesalers)


# Edit Wholesaler (update details)
@app.route("/wholesaler/<int:id>/edit", methods=["POST"])
def edit_wholesaler(id):
    wholesaler = Wholesaler.query.get_or_404(id)
    name = request.form.get('name')
    phone = request.form.get('phone')
    address = request.form.get('address', '')

    if not name:
        flash('Wholesaler name is required', 'error')
        return redirect(url_for('wholesaler_detail', id=id))

    # Check for duplicate phone (if changed)
    if phone and phone != wholesaler.phone:
        existing = Wholesaler.query.filter_by(phone=phone).first()
        if existing:
            flash(f'Wholesaler with phone {phone} already exists', 'error')
            return redirect(url_for('wholesaler_detail', id=id))

    wholesaler.name = name
    wholesaler.phone = phone
    wholesaler.address = address
    db.session.commit()
    flash('Wholesaler details updated successfully', 'success')
    return redirect(url_for('wholesaler_detail', id=id))

# API endpoint to create wholesaler (for inline add)
@app.route("/api/wholesalers", methods=["POST"])
def api_create_wholesaler():
    """Create a new wholesaler via API"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Wholesaler name is required'}), 400
    
    # Check for duplicate phone
    if data.get('phone'):
        existing = Wholesaler.query.filter_by(phone=data['phone']).first()
        if existing:
            return jsonify({'error': f'Wholesaler with phone {data["phone"]} already exists'}), 400
    
    wholesaler = Wholesaler(
        name=data['name'],
        phone=data.get('phone', ''),
        address=data.get('address', '')
    )
    db.session.add(wholesaler)
    db.session.commit()
    
    return jsonify({
        'id': wholesaler.id,
        'name': wholesaler.name,
        'phone': wholesaler.phone,
        'address': wholesaler.address
    }), 201

# API endpoint to get all wholesalers
@app.route("/api/wholesalers", methods=["GET"])
def api_wholesalers():
    """Get all wholesalers as JSON"""
    wholesalers = Wholesaler.query.all()
    return jsonify([{
        'id': w.id,
        'name': w.name,
        'phone': w.phone,
        'address': w.address
    } for w in wholesalers])

# API endpoint to search wholesalers
@app.route("/api/wholesalers/search", methods=["GET"])
def api_wholesalers_search():
    """Search wholesalers by name or phone"""
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 1:
        return jsonify([])
    
    query_lower = query.lower()
    wholesalers = Wholesaler.query.filter(
        db.or_(
            db.func.lower(Wholesaler.name).like(f'%{query_lower}%'),
            Wholesaler.phone.like(f'%{query}%')
        )
    ).limit(10).all()
    
    return jsonify([{
        'id': w.id,
        'name': w.name,
        'phone': w.phone,
        'address': w.address
    } for w in wholesalers])

# Delete Wholesaler
@app.route("/delete-wholesaler/<int:id>")
def delete_wholesaler(id):
    wholesaler = Wholesaler.query.get_or_404(id)
    db.session.delete(wholesaler)
    db.session.commit()
    flash("Wholesaler deleted successfully", "success")
    return redirect(url_for("wholesalers"))

# Delete Wholesaler Transaction
@app.route("/delete-wholesaler-transaction/<int:id>")
def delete_wholesaler_transaction(id):
    transaction = WholesalerTransaction.query.get_or_404(id)
    wholesaler_id = transaction.wholesaler_id
    # Adjust Item stock to reflect deletion of this purchase
    item = Item.query.filter(db.func.lower(Item.name) == transaction.item_name.strip().lower()).first()
    if item:
        item.stock_quantity = max(0, (item.stock_quantity or 0) - transaction.quantity)
        db.session.add(item)

    db.session.delete(transaction)
    db.session.commit()
    flash("Transaction deleted successfully", "success")
    return redirect(url_for("wholesaler_detail", id=wholesaler_id))


# Edit Wholesaler Transaction
@app.route('/wholesaler-transaction/<int:id>/edit', methods=['POST'])
def edit_wholesaler_transaction(id):
    transaction = WholesalerTransaction.query.get_or_404(id)
    old_item_name = transaction.item_name
    old_quantity = transaction.quantity
    item_name = request.form.get('item_name')
    try:
        quantity = float(request.form.get('quantity', transaction.quantity))
    except ValueError:
        flash('Invalid quantity value', 'error')
        return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))
    try:
        price_per_unit = float(request.form.get('price_per_unit', transaction.price_per_unit))
    except ValueError:
        flash('Invalid price value', 'error')
        return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))
    try:
        paid_amount = float(request.form.get('paid_amount', transaction.paid_amount))
    except ValueError:
        flash('Invalid paid amount value', 'error')
        return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))

    # Parse transaction date if provided (format: YYYY-MM-DD)
    date_str = request.form.get('date')
    if date_str:
        try:
            # Convert to datetime (time defaults to 00:00)
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
            transaction.date = parsed_date
        except Exception:
            flash('Invalid date format', 'error')
            return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))

    notes = request.form.get('notes', transaction.notes)

    if not item_name:
        flash('Item name is required', 'error')
        return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))

    # Adjust stock based on changes
    # If item name unchanged, adjust by delta
    if item_name.strip().lower() == old_item_name.strip().lower():
        item = Item.query.filter(db.func.lower(Item.name) == item_name.strip().lower()).first()
        if item:
            delta = quantity - old_quantity
            item.stock_quantity = (item.stock_quantity or 0) + delta
            # Update purchase price
            item.purchase_price = price_per_unit
            if not item.sale_price:
                item.sale_price = price_per_unit
            db.session.add(item)
        else:
            # No existing item found; create one with the new quantity
            created = Item(
                name=item_name,
                unit=None,
                purchase_price=price_per_unit,
                sale_price=price_per_unit,
                stock_quantity=quantity
            )
            db.session.add(created)
    else:
        # Item name changed: subtract from old item, add to (or create) new item
        old_item = Item.query.filter(db.func.lower(Item.name) == old_item_name.strip().lower()).first()
        if old_item:
            old_item.stock_quantity = max(0, (old_item.stock_quantity or 0) - old_quantity)
            db.session.add(old_item)

        new_item = Item.query.filter(db.func.lower(Item.name) == item_name.strip().lower()).first()
        if new_item:
            new_item.stock_quantity = (new_item.stock_quantity or 0) + quantity
            new_item.purchase_price = price_per_unit
            if not new_item.sale_price:
                new_item.sale_price = price_per_unit
            db.session.add(new_item)
        else:
            created = Item(
                name=item_name,
                unit=None,
                purchase_price=price_per_unit,
                sale_price=price_per_unit,
                stock_quantity=quantity
            )
            db.session.add(created)

    transaction.item_name = item_name
    transaction.quantity = quantity
    transaction.price_per_unit = price_per_unit
    transaction.total_price = quantity * price_per_unit
    transaction.paid_amount = paid_amount
    transaction.notes = notes

    db.session.commit()
    flash('Transaction updated successfully', 'success')
    return redirect(url_for('wholesaler_detail', id=transaction.wholesaler_id))

# Invoice page
@app.route("/invoice/<int:sale_id>")
def invoice(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    
    # Only show invoices for credit sales
    if not sale.customer_id:
        flash("This is a cash sale. No invoice available.", "error")
        return redirect(url_for("sales"))
    
    customer = sale.customer
    item = sale.item
    
    # Calculate remaining balance
    remaining_balance = sale.total_price - sale.paid_amount
    
    # Generate invoice message (basic version, enhanced in frontend)
    invoice_date = sale.date.strftime('%Y-%m-%d')
    invoice_message = f"Thank you for shopping with us.\nThis is your invoice dated {invoice_date}.\nTotal amount: Rs {sale.total_price}\nPaid: Rs {sale.paid_amount}\nRemaining balance: Rs {remaining_balance}"
    
    return render_template(
        "invoice.html",
        sale=sale,
        customer=customer,
        item=item,
        remaining_balance=remaining_balance,
        invoice_message=invoice_message
    )

# Route to serve service worker with correct MIME type
@app.route('/static/service-worker.js')
def service_worker():
    from flask import send_from_directory
    return send_from_directory('static', 'service-worker.js', mimetype='application/javascript')



# ------------------
# Run App
# ------------------
if __name__ == "__main__":
    import ssl
    import os
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    cert_file = 'cert.pem'
    key_file = 'key.pem'
    
    # Check if SSL certificates exist
    if os.path.exists(cert_file) and os.path.exists(key_file):
        # Create SSL context for HTTPS
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        
        print("Starting Flask app with HTTPS...")
        print(f"Access at: https://localhost:{port}")
        print(f"Access from phone: https://YOUR_IP:{port}")
        print("Note: Self-signed certificate - browser will show security warning")
        print("Click 'Advanced' -> 'Proceed' to continue\n")
        
        # Run on all interfaces (0.0.0.0) for mobile device access with HTTPS
        app.run(host='0.0.0.0', port=port, debug=debug_mode, ssl_context=context)
    else:
        print("SSL certificates not found!")
        print("Starting Flask app with HTTP...")
        print(f"Access at: http://localhost:{port}")
        print(f"Access from phone: http://YOUR_IP:{port}\n")
        
        # Fallback to HTTP if certificates don't exist
        # Run on all interfaces (0.0.0.0) for mobile device access
        app.run(host='0.0.0.0', port=port, debug=debug_mode)
