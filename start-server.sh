#!/bin/bash
# MGPS Backend Server Startup Script for Linux/Mac

echo ""
echo "============================================"
echo "    MGPS - Management and GPS System"
echo "    Node.js Backend Server"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

# Check if npm modules are installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install npm packages"
        exit 1
    fi
fi

echo ""
echo "Starting MGPS Server..."
echo ""
echo "============================================"
npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Server failed to start"
    echo "Check your .env file configuration"
    exit 1
fi
