# Election Integrity System - Setup Guide

## Overview

This is a Government-grade Election Integrity & Voter Registry System with strict domain separation between:
- **Voter Registry Domain** (Pre-Election): EPIC registration, corrections, transfers, deletions
- **Election Audit Domain** (Post-Election): Form 17A/17C records, audit flagging, read-only results

## System Architecture

- **Backend**: Node.js + Express + Socket.IO (TypeScript)
- **Frontend 1**: Citizen Voter Services Dashboard (React + TypeScript)
- **Frontend 2**: Election Authority Dashboard (React + TypeScript)

## Key System Statement

> "This system digitises statutory election records and voter registry workflows to assist audit and administrative review, without interfering in voting or vote counting."

## Prerequisites

- Node.js 18+ and npm
- Two terminal windows for running frontends and backend

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Citizen Dashboard Setup

```bash
cd "Citizen Voter Services Dashboard (2)"
npm install
npm run dev
```

Citizen Dashboard will run on `http://localhost:3000` (or next available port)

### 3. Authority Dashboard Setup

```bash
cd "Election Authority Dashboard 2"
npm install
npm run dev
```

Authority Dashboard will run on `http://localhost:3001` (or next available port)

## Environment Variables (Optional)

Create `.env` files in each project root if you need to customize:

**Citizen Dashboard (.env):**
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

**Authority Dashboard (.env):**
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

**Backend (.env):**
```
PORT=5000
```

## Features

### Citizen Dashboard
- ✅ EPIC ID verification and details
- ✅ Submit voter requests (registration, correction, transfer, deletion, lost card)
- ✅ Track application status
- ✅ View live election results (read-only, aggregated)
- ✅ Download EPIC card
- ✅ Real-time updates via WebSocket

### Authority Dashboard
- ✅ View all voter requests in real-time
- ✅ See risk scores and explanations
- ✅ Review and approve/reject/escalate requests
- ✅ View flagged cases with explanations
- ✅ Monitor Form 17A/17C audit data
- ✅ Booth-wise risk analysis
- ✅ Real-time alerts and notifications

### Backend APIs

**Voter Registry:**
- `POST /api/voter/request` - Submit voter request
- `POST /api/voter/track-status` - Track EPIC status
- `GET /api/voter/epic/:epicId` - Get voter by EPIC

**Election Audit:**
- `POST /api/audit/form17a/upload` - Upload Form 17A records
- `POST /api/audit/form17c/upload` - Upload Form 17C summary
- `GET /api/election/results` - Get election results

**Authority:**
- `GET /api/authority/voter-requests` - Get all requests
- `POST /api/authority/voter-request/:id/status` - Update request status
- `GET /api/authority/flags` - Get all flags
- `POST /api/authority/flag/:id/resolve` - Resolve flag
- `GET /api/authority/stats` - Get dashboard stats

## WebSocket Events

### Citizen → Backend
- `submit_voter_request`
- `track_epic_status`
- `fetch_live_results`
- `download_epic`

### Backend → Authority Dashboard
- `authority:new_voter_request_received`
- `authority:risk_score_updated`
- `authority:flag_generated`
- `authority:audit_alert_raised`
- `authority:request_queue_updated`
- `authority:form17a_uploaded`
- `authority:audit_flag_detected`
- `authority:count_mismatch_alert`
- `authority:booth_risk_updated`

## Risk & Flagging System

The system uses a rule-based risk engine that flags:
- **Normal**: No risk factors detected
- **Needs Review**: Some anomalies detected (e.g., incomplete data, rapid transfers)
- **High Risk**: Significant anomalies (e.g., duplicate EPIC, count mismatches)

**Important**: Flags provide explanations but never auto-correct or delete data. All final decisions are made by human authorities.

## Security & Compliance

- ✅ No vote tracking
- ✅ No voter-to-vote linkage
- ✅ Biometric data stored as hashes only
- ✅ AI provides recommendations only
- ✅ Final authority always human
- ✅ Flags never auto-correct or delete data

## Testing the System

1. **Submit a Voter Request:**
   - Open Citizen Dashboard
   - Go to "My EPIC ID" or "Profile Updates"
   - Submit a request (registration, correction, etc.)
   - Check Authority Dashboard for real-time notification

2. **View Risk Flags:**
   - Authority Dashboard → "Flagged Cases"
   - See risk scores and explanations

3. **Track Application Status:**
   - Citizen Dashboard → "My EPIC ID" → "Check Application Status"
   - Enter application ID or EPIC number

4. **View Live Results:**
   - Citizen Dashboard → "Results"
   - Results are read-only, aggregated data

## Notes

- All data is synthetic and stored in-memory (restarts clear data)
- For production, integrate with proper database (PostgreSQL/MongoDB)
- WebSocket connections auto-reconnect
- CORS is configured for local development ports

## Troubleshooting

- **Backend won't start**: Check if port 5000 is available
- **WebSocket connection failed**: Ensure backend is running first
- **CORS errors**: Verify frontend ports match backend CORS config
- **API 404 errors**: Check API_BASE_URL in frontend services
