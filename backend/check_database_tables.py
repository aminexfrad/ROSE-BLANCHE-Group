#!/usr/bin/env python
"""
Script to check database tables and their structure
"""
import os
import sys
import django

# Add the gateway directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'gateway'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.db import connection

def check_database_tables():
    """Check what tables exist in the database"""
    print("=== Database Tables ===")
    
    with connection.cursor() as cursor:
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            
            # Get table structure
            try:
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                for column in columns:
                    print(f"  Column: {column}")
            except Exception as e:
                print(f"  Error describing table: {e}")
    
    print("\n=== User Table Structure ===")
    try:
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE custom_user")
            columns = cursor.fetchall()
            for column in columns:
                print(f"Column: {column}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n=== Candidat Table Structure ===")
    try:
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE candidat")
            columns = cursor.fetchall()
            for column in columns:
                print(f"Column: {column}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_database_tables()
