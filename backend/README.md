# Election Integrity & Voter Registry System Backend

Government-grade backend system for election integrity, voter registry management, and post-election audit.

## Key System Statement

> "This system digitises statutory election records and voter registry workflows to assist audit and administrative review, without interfering in voting or vote counting."

## Architecture

- **Backend Framework**: Node.js + Express
- **Real-time Layer**: Socket.IO (WebSocket)
- **Language**: TypeScript
- **Data Storage**: In-memory (JSON-based synthetic datasets)
- **AI/ML Integration**: Risk Engine (rule-based with ML hooks)

## Data Domains (Strict Separation)

### 🟦 Voter Registry Domain (Pre-Election)
- EPIC registration
- Corrections
- Transfers (address/constituency/state)
- Deletions (death/migration)
- Lost EPIC reissue

### 🟩 Election Audit Domain (Post-Election)
- Form 17A-like records (digitized statutory records)
- Form 17C summaries (booth-wise aggregated totals)
- Election results (read-only, aggregated)
- **NO vote choice tracking**
- **NO voter-to-vote linkage**

## Risk & Flagging Engine

- **Risk Levels**: Normal, Needs Review, High Risk
- **Flagging Rules**:
  - Duplicate EPIC detection
  - Multiple transfers in short window
  - Incomplete demographic data
  - Form 17A vs Form 17C count mismatches
  - Cross-booth EPIC duplication
- **Flags include explanations but never auto-correct or delete data**

## Installation

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Voter Registry Domain

- `POST /api/voter/request` - Submit voter request
- `POST /api/voter/track-status` - Track EPIC application status
- `GET /api/voter/epic/:epicId` - Get voter by EPIC ID

### Election Audit Domain

- `POST /api/audit/form17a/upload` - Upload Form 17A records
- `POST /api/audit/form17c/upload` - Upload Form 17C summary
- `GET /api/election/results` - Get election results (read-only)

### Authority Dashboard

- `GET /api/authority/voter-requests` - Get all voter requests
- `POST /api/authority/voter-request/:requestId/status` - Update request status
- `GET /api/authority/flags` - Get all flags
- `POST /api/authority/flag/:flagId/resolve` - Resolve flag
- `GET /api/authority/booth/:boothId/risk` - Get booth risk summary
- `GET /api/authority/stats` - Get dashboard statistics

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

### Backend → Citizen
- `citizen:voter_request_submitted`
- `citizen:epic_status_update`
- `citizen:live_results`
- `citizen:epic_download_ready`
- `citizen:error`

## Security & Compliance

- ✅ No vote tracking
- ✅ No voter-to-vote linkage
- ✅ Biometric data stored as hashes only
- ✅ AI provides recommendations only
- ✅ Final authority always human
- ✅ Flags never auto-correct or delete data

## Build

```bash
npm run build
npm start
```
