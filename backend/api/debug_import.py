# backend/api/debug_import.py
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# No try-except to see full stack trace
from app.main import app
print("✅ SUCCESS")
