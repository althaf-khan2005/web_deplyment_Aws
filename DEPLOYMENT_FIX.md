# Quick Fix for EC2 Deployment

## Problem
Your EC2 instance is running but your Node.js apps (frontend/backend) are not started.

## Solution

### Option 1: SSH and Start Manually
```bash
# SSH into your instance
ssh -i login.pem ubuntu@54.251.136.134

# Go to your project
cd Full-stack-deployment

# Start backend
cd backend
npm install
node server.js &

# Start frontend (in new terminal)
cd ../frontend
npm install
npm start
```

### Option 2: Use the deploy script
```bash
cd /mnt/d/Full-stack-deployment
chmod +x deploy.sh
./deploy.sh
```

## What's Wrong
- ✅ EC2 instance is running
- ✅ Security group ports 3000, 5000 are open
- ❌ Node.js apps are NOT running on the server

## Your EC2 Details
- **IP:** 54.251.136.134
- **Region:** Singapore (ap-southeast-1)
- **Instance ID:** i-05d25889fb3c266b2
- **Key:** login.pem

## After Starting Apps
- Frontend: http://54.251.136.134:3000
- Backend: http://54.251.136.134:5000
