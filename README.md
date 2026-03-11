# Full Stack Authentication App

## Environment Setup

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/authdb
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   npm install
   ```

2. Make sure MongoDB is running on localhost:27017

3. Start backend server:
   ```bash
   npm start
   ```
   Server will run on http://localhost:5000

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   npm install
   ```

2. Start frontend:
   ```bash
   npm start
   ```
   App will run on http://localhost:3000

## Features
- User Registration
- User Login
- JWT Authentication
- Welcome Dashboard showing user email
- Spotify-style dark UI with sidebar navigation
- MongoDB integration

## Usage
1. Open http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Navigate using sidebar (Home, Search, Profile)
5. Logout when done

## For Production Deployment
Update frontend/.env:
```
VITE_API_URL=http://your-ec2-ip:5000
```
