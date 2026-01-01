// API Service for Authority Dashboard

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface VoterRequest {
  request_id: string;
  voter_record_id: string;
  request_type: 'registration' | 'correction' | 'transfer' | 'deletion' | 'lost_card';
  epic_id?: string;
  submitted_data: Record<string, any>;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'On Hold';
  risk_score: 'Normal' | 'Needs Review' | 'High Risk';
  risk_explanation?: string;
  flags: Flag[];
  submitted_at: string;
  updated_at: string;
}

export interface Flag {
  flag_id: string;
  entity_type: 'voter_request' | 'form17a' | 'form17c' | 'booth';
  entity_id: string;
  risk_level: 'Normal' | 'Needs Review' | 'High Risk';
  reason: string;
  explanation: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface DashboardStats {
  pending_requests: number;
  high_risk_requests: number;
  total_flags: number;
  high_risk_flags: number;
  voters_registered: number;
}

export interface BoothRiskSummary {
  booth_id: string;
  risk_level: string;
  flag_count: number;
  high_risk_flags: number;
}

// Get all voter requests
export async function getVoterRequests(filters?: {
  status?: string;
  risk_level?: string;
  request_type?: string;
}): Promise<VoterRequest[]> {
  const url = new URL(`${API_BASE_URL}/authority/voter-requests`);
  if (filters?.status) url.searchParams.append('status', filters.status);
  if (filters?.risk_level) url.searchParams.append('risk_level', filters.risk_level);
  if (filters?.request_type) url.searchParams.append('request_type', filters.request_type);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch requests');
  }

  const result = await response.json();
  return result.requests;
}

// Update request status
export async function updateRequestStatus(
  requestId: string,
  status: string,
  updatedBy?: string
): Promise<VoterRequest> {
  const response = await fetch(`${API_BASE_URL}/authority/voter-request/${requestId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      updated_by: updatedBy || 'Authority User',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update status');
  }

  const result = await response.json();
  return result.request;
}

// Get all flags
export async function getFlags(filters?: {
  risk_level?: string;
  entity_type?: string;
  resolved?: boolean;
  booth_id?: string;
}): Promise<Flag[]> {
  const url = new URL(`${API_BASE_URL}/authority/flags`);
  if (filters?.risk_level) url.searchParams.append('risk_level', filters.risk_level);
  if (filters?.entity_type) url.searchParams.append('entity_type', filters.entity_type);
  if (filters?.resolved !== undefined) url.searchParams.append('resolved', filters.resolved.toString());
  if (filters?.booth_id) url.searchParams.append('booth_id', filters.booth_id);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch flags');
  }

  const result = await response.json();
  return result.flags;
}

// Resolve flag
export async function resolveFlag(flagId: string, resolvedBy: string): Promise<Flag> {
  const response = await fetch(`${API_BASE_URL}/authority/flag/${flagId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resolved_by: resolvedBy,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resolve flag');
  }

  const result = await response.json();
  return result.flag;
}

// Get booth risk summary
export async function getBoothRiskSummary(boothId: string): Promise<BoothRiskSummary> {
  const response = await fetch(`${API_BASE_URL}/authority/booth/${boothId}/risk`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booth risk');
  }

  const result = await response.json();
  return result.summary;
}

// Get dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/authority/stats`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch stats');
  }

  const result = await response.json();
  return result.stats;
}
// Get election results
export async function getElectionResults(constituency?: string): Promise<any[]> {
  const url = new URL(`${API_BASE_URL}/election/results`);
  if (constituency) url.searchParams.append('constituency', constituency);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch election results');
  }

  const result = await response.json();
  return result.results;
}
