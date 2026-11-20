#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================="
echo " Starting BillBooky CCTV Vision Bridge & Signal Booster"
echo "=========================================================="
echo "Port: 5050 | WebSocket: ws://127.0.0.1:5050/ws/stream"
echo ""

if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed. Please install Python 3.9+ to continue."
    read -p "Press enter to exit..."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "Setting up Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Checking requirements..."
pip install -q -r requirements.txt

echo "Starting Vision Bridge on port 5050..."
python3 server.py
