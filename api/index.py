import os
import sys

# Add the backend directory to sys.path so we can import modules from it
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from main import app as app

# Vercel needs a variable named 'app' (or handler)
