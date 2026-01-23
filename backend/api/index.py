import sys
import os

# Fix PYTHONPATH to ensure we can import 'app'
# This file is at /backend/api/index.py
# We want to add /backend to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

try:
    from app.main import app
except Exception as e:
    print(f"CRITICAL ERROR: Failed to import app.main: {e}")
    raise e
