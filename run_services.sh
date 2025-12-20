#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting AI Radar Services Setup & Run...${NC}"

# ------------------------------------------------------------------
# 1. Python Backend Setup (Flask)
# ------------------------------------------------------------------
echo -e "${GREEN}Setting up Python Backend...${NC}"

# Check for Mac-compatible venv
if [ ! -d "backend/venv_mac" ]; then
    echo "Creating new Python virtual environment (backend/venv_mac)..."
    python3 -m venv backend/venv_mac
else
    echo "Virtual environment exists."
fi

# Activate venv
source backend/venv_mac/bin/activate

# Install dependencies
# Install dependencies
echo "Installing Python dependencies..."
pip install flask flask-cors pymongo pandas openpyxl requests python-dotenv langchain

# ------------------------------------------------------------------
# 2. Node Backend Setup (Express)
# ------------------------------------------------------------------
echo -e "${GREEN}Setting up Node Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing Node backend dependencies..."
    npm install
else
    echo "Node backend dependencies already installed."
fi
cd ..

# ------------------------------------------------------------------
# 3. Frontend Setup (Vite)
# ------------------------------------------------------------------
echo -e "${GREEN}Setting up Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed."
fi
cd ..

# ------------------------------------------------------------------
# 4. Start All Services
# ------------------------------------------------------------------
echo -e "${BLUE}Starting all services...${NC}"

trap 'kill 0' SIGINT

# Start Python Backend
echo "Starting Python Backend (Port 8000)..."
export FLASK_APP=backend/app.py
export FLASK_ENV=development
backend/venv_mac/bin/python backend/app.py &

# Start Node Backend
echo "Starting Node Backend (Port 5001)..."
cd backend
if npx --no-install nodemon -v >/dev/null 2>&1; then
    npx nodemon server.js &
else
    node server.js &
fi
cd ..

# Start Frontend
echo "Starting Frontend (Port 8081)..."
cd frontend
npm run dev -- --port 8081 &
cd ..

echo -e "${GREEN}All services are running!${NC}"
echo "Frontend: http://localhost:8081"
echo "Python Backend: http://localhost:8000"
echo "Node Backend: http://localhost:5001"
echo "Press Ctrl+C to stop all services."

wait
