// Voter Registry Domain (Pre-Election)
// Handles EPIC registration, corrections, transfers, deletions, lost card requests

import { VoterRecord, VoterRequest, RequestType, RequestStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateVoterRecord } from '../data/synthetic';
import { RiskEngine } from '../engine/riskEngine';

export class VoterRegistryDomain {
  private records: Map<string, VoterRecord> = new Map();
  private requests: Map<string, VoterRequest> = new Map();
  private riskEngine: RiskEngine;

  constructor(riskEngine: RiskEngine) {
    this.riskEngine = riskEngine;
    // Initialize with some synthetic records
    this.initializeSyntheticData();
  }

  private initializeSyntheticData(): void {
    // Generate some initial voter records
    for (let i = 0; i < 100; i++) {
      const record = generateVoterRecord();
      this.records.set(record.voter_record_id, record);
      this.riskEngine.registerVoterRecord(record);
    }
  }

  // Submit a new voter request
  submitVoterRequest(
    requestType: RequestType,
    submittedData: Record<string, any>,
    epicId?: string
  ): VoterRequest {
    const request_id = uuidv4();
    const voter_record_id = epicId 
      ? this.findVoterByEpic(epicId)?.voter_record_id || uuidv4()
      : uuidv4();

    const request: VoterRequest = {
      request_id,
      voter_record_id,
      request_type: requestType,
      epic_id: epicId,
      submitted_data: submittedData,
      status: 'Pending',
      risk_score: 'Normal',
      flags: [],
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Score the request
    const existingRecord = this.records.get(voter_record_id);
    const existingRecords = existingRecord ? [existingRecord] : [];
    const riskAssessment = this.riskEngine.scoreVoterRequest(request, existingRecords);
    
    request.risk_score = riskAssessment.risk_level;
    request.risk_explanation = riskAssessment.explanation;
    request.flags = riskAssessment.flags;

    this.requests.set(request_id, request);
    return request;
  }

  // Get request by ID
  getRequest(request_id: string): VoterRequest | undefined {
    return this.requests.get(request_id);
  }

  // Get request by EPIC ID or mobile
  getRequestByEpicOrMobile(epicId?: string, mobile?: string): VoterRequest | undefined {
    for (const request of this.requests.values()) {
      if (epicId && request.epic_id === epicId) {
        return request;
      }
      if (mobile && request.submitted_data.mobile === mobile) {
        return request;
      }
    }
    return undefined;
  }

  // Get all requests with filtering
  getAllRequests(filters?: {
    status?: RequestStatus;
    risk_level?: string;
    request_type?: RequestType;
  }): VoterRequest[] {
    let requests = Array.from(this.requests.values());

    if (filters) {
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.risk_level) {
        requests = requests.filter(r => r.risk_score === filters.risk_level);
      }
      if (filters.request_type) {
        requests = requests.filter(r => r.request_type === filters.request_type);
      }
    }

    return requests.sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  }

  // Get pending requests count
  getPendingRequestsCount(): { total: number; high_risk: number } {
    const allPending = this.getAllRequests({ status: 'Pending' });
    return {
      total: allPending.length,
      high_risk: allPending.filter(r => r.risk_score === 'High Risk').length
    };
  }

  // Update request status (Authority action)
  updateRequestStatus(
    request_id: string,
    status: RequestStatus,
    updated_by?: string
  ): VoterRequest | null {
    const request = this.requests.get(request_id);
    if (!request) {
      return null;
    }

    request.status = status;
    request.updated_at = new Date().toISOString();

    // If approved and it's a registration, create/update the voter record
    if (status === 'Approved' && request.request_type === 'registration') {
      const epicId = request.epic_id || this.generateEpicId();
      request.epic_id = epicId;

      const voterRecord: VoterRecord = {
        voter_record_id: request.voter_record_id,
        epic_id: epicId,
        name: request.submitted_data.name,
        guardian_name: request.submitted_data.guardian_name,
        relation: request.submitted_data.relation,
        gender: request.submitted_data.gender,
        age: parseInt(request.submitted_data.age),
        dob: request.submitted_data.dob,
        address: request.submitted_data.address,
        constituency: request.submitted_data.constituency,
        assembly_constituency: request.submitted_data.assembly_constituency,
        polling_station: request.submitted_data.polling_station,
        part_no: request.submitted_data.part_no,
        serial_no: request.submitted_data.serial_no,
        state: request.submitted_data.state,
        mobile: request.submitted_data.mobile,
        email: request.submitted_data.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.records.set(voterRecord.voter_record_id, voterRecord);
      this.riskEngine.registerVoterRecord(voterRecord);
    }

    this.requests.set(request_id, request);
    return request;
  }

  // Get voter by EPIC ID
  findVoterByEpic(epicId: string): VoterRecord | undefined {
    for (const record of this.records.values()) {
      if (record.epic_id === epicId) {
        return record;
      }
    }
    return undefined;
  }

  // Generate EPIC ID
  private generateEpicId(): string {
    const stateCode = 'DL';
    const random = Math.floor(Math.random() * 10000000000);
    return `${stateCode}${random.toString().padStart(10, '0')}`;
  }

  // Get all voter records (for authority dashboard)
  getAllVoterRecords(): VoterRecord[] {
    return Array.from(this.records.values());
  }
}
