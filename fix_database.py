"""
Database Fix Script
This script will recreate the database with the updated schema.
WARNING: This will delete all existing data!
"""

from app import app, db
import os

with app.app_context():
    # Delete the old database
    db_path = 'instance/database.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Deleted old database: {db_path}")
    
    # Create all tables with new schema
    db.create_all()
    print("Database recreated with updated schema!")
    print("All tables created successfully!")
    print("\nYou can now run: python app.py")
