// Risk Scoring & Flagging Engine
// NOTE: This engine provides recommendations only. It never auto-corrects or deletes data.

import { RiskLevel, VoterRequest, Flag, VoterRecord, Form17ARecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class RiskEngine {
  private voterRegistry: Map<string, VoterRecord> = new Map();
  private epicIndex: Map<string, string[]> = new Map(); // EPIC -> voter_record_ids[]
  private transferHistory: Map<string, number[]> = new Map(); // voter_record_id -> timestamps[]

  // Register voter record for duplicate detection
  registerVoterRecord(record: VoterRecord): void {
    this.voterRegistry.set(record.voter_record_id, record);
    
    if (record.epic_id) {
      if (!this.epicIndex.has(record.epic_id)) {
        this.epicIndex.set(record.epic_id, []);
      }
      this.epicIndex.get(record.epic_id)!.push(record.voter_record_id);
    }
  }

  // Score a voter request
  scoreVoterRequest(request: VoterRequest, existingRecords?: VoterRecord[]): { risk_level: RiskLevel; explanation: string; flags: Flag[] } {
    const flags: Flag[] = [];
    let riskScore = 0;
    const reasons: string[] = [];

    // Check 1: Duplicate EPIC
    if (request.submitted_data.epic_id || request.epic_id) {
      const epicId = request.submitted_data.epic_id || request.epic_id;
      if (epicId && this.epicIndex.has(epicId)) {
        const existingRecords = this.epicIndex.get(epicId)!;
        if (existingRecords.length > 0) {
          riskScore += 30;
          reasons.push('Duplicate EPIC detected');
          
          flags.push({
            flag_id: uuidv4(),
            entity_type: 'voter_request',
            entity_id: request.request_id,
            risk_level: 'High Risk',
            reason: 'Duplicate EPIC',
            explanation: `EPIC ${epicId} is already associated with ${existingRecords.length} existing voter record(s)`,
            created_at: new Date().toISOString(),
            resolved: false
          });
        }
      }
    }

    // Check 2: Multiple transfers in short window
    if (request.request_type === 'transfer') {
      const voterId = request.voter_record_id;
      if (this.transferHistory.has(voterId)) {
        const transfers = this.transferHistory.get(voterId)!;
        const recentTransfers = transfers.filter(t => Date.now() - t < 30 * 24 * 60 * 60 * 1000); // 30 days
        if (recentTransfers.length >= 2) {
          riskScore += 25;
          reasons.push('Multiple state transfers within 30 days');
          
          flags.push({
            flag_id: uuidv4(),
            entity_type: 'voter_request',
            entity_id: request.request_id,
            risk_level: 'Needs Review',
            reason: 'Rapid Transfer Pattern',
            explanation: `Voter has ${recentTransfers.length + 1} transfers within the last 30 days`,
            created_at: new Date().toISOString(),
            resolved: false
          });
        }
      }
      // Record this transfer
      if (!this.transferHistory.has(voterId)) {
        this.transferHistory.set(voterId, []);
      }
      this.transferHistory.get(voterId)!.push(Date.now());
    }

    // Check 3: Incomplete demographic data
    const requiredFields = ['name', 'gender', 'age', 'dob', 'address', 'constituency'];
    const missingFields = requiredFields.filter(field => !request.submitted_data[field]);
    if (missingFields.length > 0) {
      riskScore += 15;
      reasons.push(`Incomplete demographic data: ${missingFields.join(', ')}`);
      
      flags.push({
        flag_id: uuidv4(),
        entity_type: 'voter_request',
        entity_id: request.request_id,
        risk_level: 'Needs Review',
        reason: 'Incomplete Data',
        explanation: `Missing required fields: ${missingFields.join(', ')}`,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    // Check 4: Age validation
    if (request.submitted_data.age) {
      const age = parseInt(request.submitted_data.age);
      if (age < 18 || age > 120) {
        riskScore += 20;
        reasons.push('Invalid age range');
        
        flags.push({
          flag_id: uuidv4(),
          entity_type: 'voter_request',
          entity_id: request.request_id,
          risk_level: 'High Risk',
          reason: 'Invalid Age',
          explanation: `Age ${age} is outside valid voting range (18-120)`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    // Determine risk level
    let risk_level: RiskLevel = 'Normal';
    if (riskScore >= 40) {
      risk_level = 'High Risk';
    } else if (riskScore >= 20) {
      risk_level = 'Needs Review';
    }

    const explanation = reasons.length > 0 
      ? reasons.join('; ')
      : 'No risk factors detected';

    return { risk_level, explanation, flags };
  }

  // Score Form 17A records for audit
  scoreForm17AAudit(records: Form17ARecord[]): Flag[] {
    const flags: Flag[] = [];
    const epicCounts = new Map<string, number>();
    const serialCounts = new Map<string, number>();
    const boothEpics = new Map<string, Set<string>>();

    // Count EPIC occurrences
    for (const record of records) {
      epicCounts.set(record.epic_id, (epicCounts.get(record.epic_id) || 0) + 1);
      serialCounts.set(record.serial_number, (serialCounts.get(record.serial_number) || 0) + 1);
      
      if (!boothEpics.has(record.booth_id)) {
        boothEpics.set(record.booth_id, new Set());
      }
      boothEpics.get(record.booth_id)!.add(record.epic_id);
    }

    // Flag 1: Same EPIC appearing multiple times
    for (const [epicId, count] of epicCounts.entries()) {
      if (count > 1) {
        flags.push({
          flag_id: uuidv4(),
          entity_type: 'form17a',
          entity_id: epicId,
          risk_level: 'High Risk',
          reason: 'Duplicate EPIC in Form 17A',
          explanation: `EPIC ${epicId} appears ${count} times in Form 17A records`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    // Flag 2: Same serial number appearing multiple times
    for (const [serial, count] of serialCounts.entries()) {
      if (count > 1) {
        flags.push({
          flag_id: uuidv4(),
          entity_type: 'form17a',
          entity_id: serial,
          risk_level: 'High Risk',
          reason: 'Duplicate Serial Number',
          explanation: `Serial number ${serial} appears ${count} times`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    return flags;
  }

  // Check Form 17A vs Form 17C count mismatch
  checkCountMismatch(form17aCount: number, form17cCount: number, boothId: string): Flag | null {
    if (Math.abs(form17aCount - form17cCount) > 5) { // Allow 5 vote difference for data entry variations
      return {
        flag_id: uuidv4(),
        entity_type: 'booth',
        entity_id: boothId,
        risk_level: 'High Risk',
        reason: 'Form 17A vs Form 17C Count Mismatch',
        explanation: `Form 17A records: ${form17aCount}, Form 17C count: ${form17cCount}. Difference: ${Math.abs(form17aCount - form17cCount)}`,
        created_at: new Date().toISOString(),
        resolved: false
      };
    }
    return null;
  }

  // Check for cross-booth EPIC duplication
  checkCrossBoothDuplication(boothEpics: Map<string, Set<string>>): Flag[] {
    const flags: Flag[] = [];
    const epicToBooths = new Map<string, Set<string>>();

    // Build EPIC -> booths mapping
    for (const [boothId, epics] of boothEpics.entries()) {
      for (const epicId of epics) {
        if (!epicToBooths.has(epicId)) {
          epicToBooths.set(epicId, new Set());
        }
        epicToBooths.get(epicId)!.add(boothId);
      }
    }

    // Find EPICs in multiple booths
    for (const [epicId, booths] of epicToBooths.entries()) {
      if (booths.size > 1) {
        flags.push({
          flag_id: uuidv4(),
          entity_type: 'form17a',
          entity_id: epicId,
          risk_level: 'High Risk',
          reason: 'Cross-Booth EPIC Duplication',
          explanation: `EPIC ${epicId} appears in ${booths.size} different booths: ${Array.from(booths).join(', ')}`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    return flags;
  }
}
