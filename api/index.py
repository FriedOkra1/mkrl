import sys
import os

# Add the 'backend' directory to sys.path
# This assumes the structure:
# root/
#   api/index.py
#   backend/app/
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app

