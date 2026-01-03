// API Service for Citizen Dashboard

import { API_BASE } from '../config/api';
import { endpoints } from '../config/endpoints';

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
  flags: any[];
  submitted_at: string;
  updated_at: string;
}

export interface VoterRecord {
  voter_record_id: string;
  epic_id?: string;
  name: string;
  guardian_name?: string;
  relation?: string;
  gender: string;
  age: number;
  dob: string;
  address: string;
  constituency: string;
  assembly_constituency?: string;
  polling_station?: string;
  part_no?: string;
  serial_no?: string;
  state: string;
  mobile?: string;
  email?: string;
}

export interface ElectionResult {
  constituency: string;
  state: string;
  booth_id?: string;
  candidate_name: string;
  party: string;
  votes: number;
  status: 'Won' | 'Leading' | 'Trailing';
  margin?: number;
}

// Submit voter request
export async function submitVoterRequest(
  requestType: string,
  submittedData: Record<string, any>,
  epicId?: string
): Promise<VoterRequest> {
  const response = await fetch(`${API_BASE_URL}${endpoints.submitVoterRequest}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_type: requestType,
      submitted_data: submittedData,
      epic_id: epicId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit request');
  }

  const result = await response.json();
  return result.request;
}

// Track EPIC status
export async function trackEpicStatus(
  requestId?: string,
  epicId?: string,
  mobile?: string
): Promise<VoterRequest> {
  const response = await fetch(`${API_BASE_URL}${endpoints.trackStatus}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      epic_id: epicId,
      mobile: mobile,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track status');
  }

  const result = await response.json();
  return result.request;
}

// Get voter by EPIC ID
export async function getVoterByEpic(epicId: string): Promise<VoterRecord> {
  const response = await fetch(`${API_BASE_URL}${endpoints.getVoterByEpic(epicId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Voter not found');
  }

  const result = await response.json();
  return result.voter;
}

// Get election results
export async function getElectionResults(constituency?: string): Promise<ElectionResult[]> {
  const url = new URL(`${API_BASE_URL}${endpoints.electionResults}`);
  if (constituency) {
    url.searchParams.append('constituency', constituency);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch results');
  }

  const result = await response.json();
  return result.results;
}
