// Core Type Definitions

export type RiskLevel = 'Normal' | 'Needs Review' | 'High Risk' | 'Critical';

export type RequestStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'On Hold';

export type RequestType = 
  | 'registration' 
  | 'correction' 
  | 'transfer' 
  | 'deletion' 
  | 'lost_card';

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
  created_at: string;
  updated_at: string;
}

export interface VoterRequest {
  request_id: string;
  voter_record_id: string;
  request_type: RequestType;
  epic_id?: string;
  submitted_data: Record<string, any>;
  status: RequestStatus;
  risk_level: RiskLevel; // Mapped from score
  risk_score: number;    // 0-100
  risk_explanation?: string;
  flags: Flag[];
  submitted_at: string;
  updated_at: string;
  ip_address?: string; // Added for velocity check
}

export interface Flag {
  flag_id: string;
  entity_type: 'voter_request' | 'form17a' | 'form17c' | 'booth';
  entity_id: string;
  risk_level: RiskLevel;
  risk_score: number; // 0-100 contribution
  rule_id: string;    // e.g., 'DUPLICATE_EPIC'
  reason: string;
  explanation: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

// Form 17A-like Record (Post-Election Audit Domain)
export interface Form17ARecord {
  record_id: string;
  booth_id: string;
  epic_id: string;
  serial_number: string;
  voter_name: string;
  thumb_impression_hash?: string; // Hashed, not raw biometric
  signature_hash?: string; // Hashed, not raw biometric
  form17a_upload_id: string;
  uploaded_at: string;
}

// Form 17C Summary (Booth-wise aggregated totals)
export interface Form17CSummary {
  summary_id: string;
  booth_id: string;
  constituency: string;
  total_electors: number;
  total_votes_polled: number;
  valid_votes: number;
  rejected_votes: number;
  uploaded_at: string;
}

// Election Results (Aggregated, Read-only)
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

// WebSocket Event Types
export interface CitizenEvents {
  'submit_voter_request': (data: any) => void;
  'track_epic_status': (data: { request_id?: string; epic_id?: string; mobile?: string }) => void;
  'fetch_live_results': (data: { constituency?: string }) => void;
  'download_epic': (data: { epic_id: string; security_code: string }) => void;
  'request_status_updated': VoterRequest;
}

export interface AuthorityEvents {
  'new_voter_request_received': VoterRequest;
  'risk_score_updated': { request_id: string; risk_score: RiskLevel; explanation: string };
  'request_status_updated': VoterRequest;
  'flag_generated': Flag;
  'audit_alert_raised': { alert_id: string; type: string; message: string; severity: RiskLevel };
  'request_queue_updated': { pending_count: number; high_risk_count: number };
  'form17a_uploaded': { upload_id: string; booth_id: string; record_count: number };
  'audit_flag_detected': Flag;
  'count_mismatch_alert': { booth_id: string; form17a_count: number; form17c_count: number };
  'booth_risk_updated': { booth_id: string; risk_level: RiskLevel; flag_count: number };
}
// ========== INTEGRITY & AUDIT TYPES ==========

export interface RollRiskScore {
  total_voters: number;
  high_risk_detected: number;
  duplicate_probability: number; // 0-100
  cluster_size_alerts: number;   // >10 voters per household
  final_score: number;           // 0-100 (100 = Clean)
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface PollingConsistency {
  total_booths: number;
  matched_booths: number;
  mismatched_booths: number;
  total_votes_form17a: number; // Voters marked
  total_votes_form17c: number; // Votes stored
  deviation_percentage: number;
  status: 'MATCH' | 'MINOR_DEVIATION' | 'CRITICAL_MISMATCH';
}

export interface TurnoutAnalytics {
  current_turnout: number;
  historical_average: number; // Mocked baseline
  deviation_from_baseline: number;
  spike_detected: boolean;
}

export interface ScoreBreakdown {
  roll_risk_weight: number;
  polling_consistency_weight: number;
  turnout_analytics_weight: number;
  roll_score_contribution: number;
  polling_score_contribution: number;
  turnout_score_contribution: number;
}

export interface IntegrityCertificate {
  constituency_id: string;
  generated_at: string; // ISO Date
  roll_risk: RollRiskScore;
  polling_consistency: PollingConsistency;
  turnout_analytics: TurnoutAnalytics;
  final_confidence_index: number; // 0-100%
  score_breakdown: ScoreBreakdown;
  status: 'PROVISIONAL' | 'VERIFIED' | 'FLAGGED';
}
