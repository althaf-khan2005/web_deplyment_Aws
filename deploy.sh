#!/bin/bash

# EC2 Deployment Script
# Instance: 54.251.136.134
# Key: login.pem

echo "=== Deploying to EC2 ==="

# 1. Upload files to EC2
echo "Uploading files..."
scp -i login.pem -r /mnt/d/Full-stack-deployment ubuntu@54.251.136.134:~/

# 2. SSH and setup
ssh -i login.pem ubuntu@54.251.136.134 << 'EOF'
cd ~/Full-stack-deployment

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# Install backend dependencies
cd backend
npm install
pm2 stop backend || true
pm2 start server.js --name backend
pm2 save

# Install frontend dependencies
cd ../frontend
npm install
pm2 stop frontend || true
pm2 start npm --name frontend -- start
pm2 save

echo "=== Deployment Complete ==="
pm2 list
EOF
