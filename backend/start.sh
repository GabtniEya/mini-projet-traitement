#!/bin/bash
# Install dependencies and start the FastAPI backend
cd "$(dirname "$0")"
pip install -r requirements.txt -q
python main.py
