# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
# Citizen Dashboard
cd "../Citizen Voter Services Dashboard (2)"
npm install

# Authority Dashboard
cd "../Election Authority Dashboard 2"
npm install
```

### Step 3: Start All Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Citizen Dashboard:**
```bash
cd "Citizen Voter Services Dashboard (2)"
npm run dev
```
✅ Citizen Dashboard running on http://localhost:3000

**Terminal 3 - Authority Dashboard:**
```bash
cd "Election Authority Dashboard 2"
npm run dev
```
✅ Authority Dashboard running on http://localhost:3001

## 🧪 Test the System

1. **Open Citizen Dashboard** → http://localhost:3000
2. **Go to "My EPIC ID" tab**
3. **Try validating with EPIC ID** (use any string for demo)
4. **Submit a request** (e.g., Lost EPIC Card)
5. **Open Authority Dashboard** → http://localhost:3001
6. **See real-time notification** of the new request with risk score

## 📋 What's Implemented

✅ Complete backend with Express + Socket.IO
✅ Voter Registry Domain (EPIC registration, corrections, transfers, deletions)
✅ Election Audit Domain (Form 17A/17C, audit flagging)
✅ Risk & Flagging Engine (Normal/Needs Review/High Risk)
✅ WebSocket real-time updates
✅ REST APIs for all operations
✅ Citizen Dashboard integration (MyEpicIdTab, LiveResults)
✅ Authority Dashboard API services ready
✅ Synthetic data generation
✅ CORS configuration

## 📚 Full Documentation

- `SETUP.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `backend/README.md` - Backend API documentation

## 🔧 Troubleshooting

**Port already in use?**
- Backend: Change PORT in backend/.env or backend/src/server.ts
- Frontend: Vite will auto-select next available port

**WebSocket not connecting?**
- Ensure backend is running first
- Check browser console for connection errors
- Verify CORS settings match your ports

**API calls failing?**
- Check backend is running on port 5000
- Verify API_BASE_URL in frontend services (defaults to http://localhost:5000/api)

## 🎯 Key Features

- **Real-time Updates**: WebSocket events for instant notifications
- **Risk Scoring**: Automatic flagging with explanations
- **Domain Separation**: Strict separation between Voter Registry and Election Audit
- **Security Compliant**: No vote tracking, no voter-to-vote linkage
- **Human Authority**: AI provides recommendations, humans make decisions

## 📝 Note

All data is stored in-memory and will be cleared on backend restart. For production, integrate with a database (PostgreSQL/MongoDB recommended).
