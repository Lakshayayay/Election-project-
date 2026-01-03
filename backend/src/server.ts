// Main Server Entry Point
// Express + Socket.IO Backend for Election Integrity System

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { VoterRegistryDomain } from './domains/voterRegistry';
import { ElectionAuditDomain } from './domains/electionAudit';
import { RiskEngine } from './engine/riskEngine';
import { RequestType, RequestStatus } from './types';

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

// Add production origins from ENV
if (process.env.ALLOWED_ORIGINS) {
  const productionOrigins = process.env.ALLOWED_ORIGINS.split(',');
  allowedOrigins.push(...productionOrigins);
}
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// Initialize Domains
const riskEngine = new RiskEngine();
const voterRegistry = new VoterRegistryDomain(riskEngine);
const electionAudit = new ElectionAuditDomain(riskEngine);

// Helper: Emit to authority dashboard
function emitToAuthority(event: string, data: any) {
  io.emit('authority:' + event, data);
}

// Helper: Emit to citizen
function emitToCitizen(socketId: string, event: string, data: any) {
  io.to(socketId).emit('citizen:' + event, data);
}

// ========== REST API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== VOTER REGISTRY DOMAIN (Pre-Election) ==========

// Submit voter request
app.post('/api/voter/request', (req, res) => {
  try {
    const { request_type, submitted_data, epic_id } = req.body;

    if (!request_type || !['registration', 'correction', 'transfer', 'deletion', 'lost_card'].includes(request_type)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    const request = voterRegistry.submitVoterRequest(
      request_type as RequestType,
      submitted_data || {},
      epic_id
    );

    // Emit to authority dashboard
    emitToAuthority('new_voter_request_received', request);
    
    if (request.flags.length > 0) {
      for (const flag of request.flags) {
        emitToAuthority('flag_generated', flag);
      }
    }

    emitToAuthority('risk_score_updated', {
      request_id: request.request_id,
      risk_score: request.risk_score,
      explanation: request.risk_explanation
    });

    const queueStats = voterRegistry.getPendingRequestsCount();
    emitToAuthority('request_queue_updated', queueStats);

    emitToAuthority('request_status_updated', request);
    io.emit('citizen:request_status_updated', { request });

    res.json({ success: true, request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Track EPIC status
app.post('/api/voter/track-status', (req, res) => {
  try {
    const { request_id, epic_id, mobile } = req.body;
    
    let request;
    if (request_id) {
      request = voterRegistry.getRequest(request_id);
    } else {
      request = voterRegistry.getRequestByEpicOrMobile(epic_id, mobile);
    }

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get voter by EPIC ID (for EPIC verification)
app.get('/api/voter/epic/:epicId', (req, res) => {
  try {
    const { epicId } = req.params;
    const voter = voterRegistry.findVoterByEpic(epicId);

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    res.json({ success: true, voter });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ELECTION AUDIT DOMAIN (Post-Election) ==========

// Upload Form 17A records
app.post('/api/audit/form17a/upload', (req, res) => {
  try {
    const { booth_id, records } = req.body;

    if (!booth_id || !Array.isArray(records)) {
      return res.status(400).json({ error: 'booth_id and records array required' });
    }

    const result = electionAudit.uploadForm17ARecords(booth_id, records);

    // Emit to authority dashboard
    emitToAuthority('form17a_uploaded', {
      upload_id: result.upload_id,
      booth_id,
      record_count: result.record_count
    });

    if (result.flags.length > 0) {
      for (const flag of result.flags) {
        emitToAuthority('audit_flag_detected', flag);
        emitToAuthority('flag_generated', flag);
      }
    }

    const boothRisk = electionAudit.getBoothRiskSummary(booth_id);
    emitToAuthority('booth_risk_updated', boothRisk);

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Form 17C summary
app.post('/api/audit/form17c/upload', (req, res) => {
  try {
    const summary = electionAudit.uploadForm17CSummary(req.body);

    const form17aRecords = electionAudit.getForm17ARecordsByBooth(summary.booth_id);
    
    // Check for count mismatch
    const form17aCount = form17aRecords.length;
    if (Math.abs(form17aCount - summary.total_votes_polled) > 5) {
      emitToAuthority('count_mismatch_alert', {
        booth_id: summary.booth_id,
        form17a_count: form17aCount,
        form17c_count: summary.total_votes_polled
      });
    }

    res.json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Integrity Certificate (Provisional)
// NOTE: Replaces old "Election Results" endpoint to avoid exposing vote counts.
app.get('/api/audit/certificate/:constituencyId', (req, res) => {
  try {
    const { constituencyId } = req.params;
    const certificate = electionAudit.generateIntegrityCertificate(constituencyId);

    // Simulate signing delay
    setTimeout(() => {
        // In real system, this would be cryptographically signed
    }, 100);

    res.json({ success: true, certificate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== AUTHORITY DASHBOARD APIs ==========

// Get all voter requests
app.get('/api/authority/voter-requests', (req, res) => {
  try {
    const { status, risk_level, request_type } = req.query;
    const requests = voterRegistry.getAllRequests({
      status: status as RequestStatus,
      risk_level: risk_level as string,
      request_type: request_type as RequestType
    });

    res.json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
app.post('/api/authority/voter-request/:requestId/status', (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, updated_by } = req.body;

    if (!['Pending', 'Under Review', 'Approved', 'Rejected', 'On Hold'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = voterRegistry.updateRequestStatus(
      requestId,
      status as RequestStatus,
      updated_by
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const queueStats = voterRegistry.getPendingRequestsCount();
    emitToAuthority('request_queue_updated', queueStats);

    res.json({ success: true, request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all flags
app.get('/api/authority/flags', (req, res) => {
  try {
    const { risk_level, entity_type, resolved, booth_id } = req.query;
    const flags = electionAudit.getAllFlags({
      risk_level: risk_level as string,
      entity_type: entity_type as string,
      resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
      booth_id: booth_id as string
    });

    res.json({ success: true, flags });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve flag
app.post('/api/authority/flag/:flagId/resolve', (req, res) => {
  try {
    const { flagId } = req.params;
    const { resolved_by } = req.body;

    if (!resolved_by) {
      return res.status(400).json({ error: 'resolved_by required' });
    }

    const flag = electionAudit.resolveFlag(flagId, resolved_by);

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json({ success: true, flag });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get booth risk summary
app.get('/api/authority/booth/:boothId/risk', (req, res) => {
  try {
    const { boothId } = req.params;
    const summary = electionAudit.getBoothRiskSummary(boothId);

    res.json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
app.get('/api/authority/stats', (req, res) => {
  try {
    const pendingRequests = voterRegistry.getPendingRequestsCount();
    const allFlags = electionAudit.getAllFlags({ resolved: false });
    const highRiskFlags = allFlags.filter(f => f.risk_level === 'High Risk');

    res.json({
      success: true,
      stats: {
        pending_requests: pendingRequests.total,
        high_risk_requests: pendingRequests.high_risk,
        total_flags: allFlags.length,
        high_risk_flags: highRiskFlags.length,
        voters_registered: voterRegistry.getAllVoterRecords().length
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== WEBSOCKET HANDLERS ==========

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Citizen events
  socket.on('submit_voter_request', (data) => {
    try {
      const { request_type, submitted_data, epic_id } = data;
      const request = voterRegistry.submitVoterRequest(
        request_type,
        submitted_data,
        epic_id
      );

      // Emit back to citizen
      emitToCitizen(socket.id, 'voter_request_submitted', { request });

      // Emit to authority
      emitToAuthority('new_voter_request_received', request);
      
      if (request.flags.length > 0) {
        for (const flag of request.flags) {
          emitToAuthority('flag_generated', flag);
        }
      }

      emitToAuthority('risk_score_updated', {
        request_id: request.request_id,
        risk_score: request.risk_score,
        explanation: request.risk_explanation
      });

      const queueStats = voterRegistry.getPendingRequestsCount();
      emitToAuthority('request_queue_updated', queueStats);
    } catch (error: any) {
      emitToCitizen(socket.id, 'error', { message: error.message });
    }
  });

  socket.on('track_epic_status', (data) => {
    try {
      const { request_id, epic_id, mobile } = data;
      
      let request;
      if (request_id) {
        request = voterRegistry.getRequest(request_id);
      } else {
        request = voterRegistry.getRequestByEpicOrMobile(epic_id, mobile);
      }

      if (request) {
        emitToCitizen(socket.id, 'epic_status_update', { request });
      } else {
        emitToCitizen(socket.id, 'error', { message: 'Request not found' });
      }
    } catch (error: any) {
      emitToCitizen(socket.id, 'error', { message: error.message });
    }
  });



  socket.on('download_epic', (data) => {
    try {
      const { epic_id, security_code } = data;
      const voter = voterRegistry.findVoterByEpic(epic_id);

      if (voter) {
        // In real system, validate security_code
        emitToCitizen(socket.id, 'epic_download_ready', { 
          epic_id,
          download_url: `/api/voter/epic/${epic_id}/download` // Mock URL
        });
      } else {
        emitToCitizen(socket.id, 'error', { message: 'EPIC not found' });
      }
    } catch (error: any) {
      emitToCitizen(socket.id, 'error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

