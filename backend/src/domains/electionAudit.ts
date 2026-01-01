// Election Audit Domain (Post-Election)
// Handles Form 17A records, Form 17C summaries, booth-wise aggregation
// NOTE: No vote choice, no voter identity linkage, no EVM access

import { Form17ARecord, Form17CSummary, ElectionResult, Flag } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateForm17ARecord, generateForm17CSummary, generateElectionResult, generateBoothId } from '../data/synthetic';
import { RiskEngine } from '../engine/riskEngine';

export class ElectionAuditDomain {
  private form17aRecords: Map<string, Form17ARecord[]> = new Map(); // upload_id -> records[]
  private form17cSummaries: Map<string, Form17CSummary> = new Map(); // booth_id -> summary
  private electionResults: Map<string, ElectionResult[]> = new Map(); // constituency -> results[]
  private flags: Map<string, Flag> = new Map();
  private riskEngine: RiskEngine;
  private boothEpics: Map<string, Set<string>> = new Map(); // booth_id -> Set<epic_id>

  constructor(riskEngine: RiskEngine) {
    this.riskEngine = riskEngine;
    this.initializeSyntheticData();
  }

  private initializeSyntheticData(): void {
    // Generate some initial Form 17C summaries and results
    const states = ['Delhi', 'Maharashtra', 'Uttar Pradesh'];
    const constituencies = {
      'Delhi': ['New Delhi', 'Chandni Chowk', 'South Delhi'],
      'Maharashtra': ['Mumbai North', 'Mumbai South'],
      'Uttar Pradesh': ['Lucknow', 'Varanasi']
    };

    for (const state of states) {
      for (const constituency of constituencies[state] || []) {
        const boothId = generateBoothId(state, constituency);
        const summary = generateForm17CSummary(boothId, constituency);
        this.form17cSummaries.set(boothId, summary);

        // Generate election results
        const results = generateElectionResult(constituency, state);
        this.electionResults.set(constituency, results);
      }
    }
  }

  // Upload Form 17A records (digitized statutory records)
  uploadForm17ARecords(
    booth_id: string,
    records: Array<{
      epic_id: string;
      serial_number: string;
      voter_name: string;
      thumb_impression_hash?: string;
      signature_hash?: string;
    }>
  ): { upload_id: string; record_count: number; flags: Flag[] } {
    const upload_id = uuidv4();
    const form17aRecords: Form17ARecord[] = records.map(r => 
      generateForm17ARecord(booth_id, r.epic_id, upload_id)
    );

    // Store records
    this.form17aRecords.set(upload_id, form17aRecords);

    // Track EPICs by booth
    if (!this.boothEpics.has(booth_id)) {
      this.boothEpics.set(booth_id, new Set());
    }
    for (const record of form17aRecords) {
      this.boothEpics.get(booth_id)!.add(record.epic_id);
    }

    // Run audit checks
    const flags = this.riskEngine.scoreForm17AAudit(form17aRecords);
    
    // Check cross-booth duplication
    const crossBoothFlags = this.riskEngine.checkCrossBoothDuplication(this.boothEpics);
    flags.push(...crossBoothFlags);

    // Store flags
    for (const flag of flags) {
      this.flags.set(flag.flag_id, flag);
    }

    return {
      upload_id,
      record_count: form17aRecords.length,
      flags
    };
  }

  // Upload Form 17C summary (booth-wise aggregated totals)
  uploadForm17CSummary(summary: Omit<Form17CSummary, 'summary_id' | 'uploaded_at'>): Form17CSummary {
    const form17cSummary: Form17CSummary = {
      ...summary,
      summary_id: uuidv4(),
      uploaded_at: new Date().toISOString()
    };

    this.form17cSummaries.set(summary.booth_id, form17cSummary);

    // Check for count mismatch with Form 17A
    const uploadIds = Array.from(this.form17aRecords.keys());
    let form17aCount = 0;
    for (const uploadId of uploadIds) {
      const records = this.form17aRecords.get(uploadId) || [];
      const boothRecords = records.filter(r => r.booth_id === summary.booth_id);
      form17aCount += boothRecords.length;
    }

    const mismatchFlag = this.riskEngine.checkCountMismatch(
      form17aCount,
      summary.total_votes_polled,
      summary.booth_id
    );

    if (mismatchFlag) {
      this.flags.set(mismatchFlag.flag_id, mismatchFlag);
    }

    return form17cSummary;
  }

  // Get Form 17A records by booth
  getForm17ARecordsByBooth(booth_id: string): Form17ARecord[] {
    const allRecords: Form17ARecord[] = [];
    for (const records of this.form17aRecords.values()) {
      const boothRecords = records.filter(r => r.booth_id === booth_id);
      allRecords.push(...boothRecords);
    }
    return allRecords;
  }

  // Get Form 17C summary by booth
  getForm17CSummary(booth_id: string): Form17CSummary | undefined {
    return this.form17cSummaries.get(booth_id);
  }

  // Get election results (read-only, aggregated)
  getElectionResults(constituency?: string): ElectionResult[] {
    if (constituency) {
      return this.electionResults.get(constituency) || [];
    }
    
    // Return all results
    const allResults: ElectionResult[] = [];
    for (const results of this.electionResults.values()) {
      allResults.push(...results);
    }
    return allResults;
  }

  // Get all flags with filtering
  getAllFlags(filters?: {
    risk_level?: string;
    entity_type?: string;
    resolved?: boolean;
    booth_id?: string;
  }): Flag[] {
    let flags = Array.from(this.flags.values());

    if (filters) {
      if (filters.risk_level) {
        flags = flags.filter(f => f.risk_level === filters.risk_level);
      }
      if (filters.entity_type) {
        flags = flags.filter(f => f.entity_type === filters.entity_type);
      }
      if (filters.resolved !== undefined) {
        flags = flags.filter(f => f.resolved === filters.resolved);
      }
      if (filters.booth_id) {
        // Filter flags related to a specific booth
        flags = flags.filter(f => {
          if (f.entity_type === 'booth') {
            return f.entity_id === filters.booth_id;
          }
          // For form17a flags, check if the EPIC is in the booth
          if (f.entity_type === 'form17a') {
            const boothEpics = this.boothEpics.get(filters.booth_id);
            return boothEpics?.has(f.entity_id);
          }
          return false;
        });
      }
    }

    return flags.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Resolve a flag
  resolveFlag(flag_id: string, resolved_by: string): Flag | null {
    const flag = this.flags.get(flag_id);
    if (!flag) {
      return null;
    }

    flag.resolved = true;
    flag.resolved_at = new Date().toISOString();
    flag.resolved_by = resolved_by;

    this.flags.set(flag_id, flag);
    return flag;
  }

  // Get booth risk summary
  getBoothRiskSummary(booth_id: string): {
    booth_id: string;
    risk_level: string;
    flag_count: number;
    high_risk_flags: number;
  } {
    const flags = this.getAllFlags({ booth_id });
    const highRiskFlags = flags.filter(f => f.risk_level === 'High Risk' && !f.resolved);
    
    let risk_level = 'Normal';
    if (highRiskFlags.length > 0) {
      risk_level = 'High Risk';
    } else if (flags.length > 0) {
      risk_level = 'Needs Review';
    }

    return {
      booth_id,
      risk_level,
      flag_count: flags.filter(f => !f.resolved).length,
      high_risk_flags: highRiskFlags.length
    };
  }
}
