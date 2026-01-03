// API Service for Authority Dashboard

import { endpoints } from '../config/endpoints';
import { API_BASE } from '../config/api';

const API_BASE_URL = API_BASE;

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
  const url = new URL(`${API_BASE_URL}${endpoints.voterRequests}`);
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
  const response = await fetch(`${API_BASE_URL}${endpoints.requestStatus(requestId)}`, {
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
  const url = new URL(`${API_BASE_URL}${endpoints.flags}`);
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
  const response = await fetch(`${API_BASE_URL}${endpoints.resolveFlag(flagId)}`, {
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
  const response = await fetch(`${API_BASE_URL}${endpoints.boothRisk(boothId)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booth risk');
  }

  const result = await response.json();
  return result.summary;
}

// Get dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}${endpoints.authorityStats}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch stats');
  }

  const result = await response.json();
  return result.stats;
}
// Get election results
// Get Integrity Certificate
export async function getIntegrityCertificate(constituencyId: string): Promise<IntegrityCertificate> {
  const response = await fetch(`${API_BASE_URL}${endpoints.integrityCertificate(constituencyId)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch certificate');
  }

  const result = await response.json();
  return result.certificate;
}

export interface IntegrityCertificate {
  constituency_id: string;
  generated_at: string;
  roll_risk: {
    total_voters: number;
    high_risk_detected: number;
    duplicate_probability: number;
    cluster_size_alerts: number;
    final_score: number;
    risk_level: 'Low' | 'Medium' | 'High';
  };
  polling_consistency: {
    total_booths: number;
    matched_booths: number;
    mismatched_booths: number;
    total_votes_form17a: number;
    total_votes_form17c: number;
    deviation_percentage: number;
    status: 'MATCH' | 'MINOR_DEVIATION' | 'CRITICAL_MISMATCH';
  };
  turnout_analytics: {
    current_turnout: number;
    historical_average: number;
    deviation_from_baseline: number;
    spike_detected: boolean;
  };
  final_confidence_index: number;
  score_breakdown: {
    roll_risk_weight: number;
    polling_consistency_weight: number;
    turnout_analytics_weight: number;
    roll_score_contribution: number;
    polling_score_contribution: number;
    turnout_score_contribution: number;
  };
  status: 'PROVISIONAL' | 'VERIFIED' | 'FLAGGED';
}
