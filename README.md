# Crea∞X

> Where Creators Build Together — AI-powered creative platform

## Tech Stack
- **Frontend**: React 19 (Vite), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcrypt
- **AI**: Google Gemini 2.0 Flash

## Setup

### 1. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment
Create `server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

### 3. Run
```bash
# Backend
cd server && node server.js

# Frontend (separate terminal)
cd client && npm run dev
```

## Features
- 🚀 Project showcase with like system
- 🤖 AI description & bio generation (Gemini)
- 🎯 Skill-based member recommendations
- 📊 AI skill gap insights
- 🔍 Search & filter creators by skills
