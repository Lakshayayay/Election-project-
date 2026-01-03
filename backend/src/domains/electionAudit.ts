// Election Audit Domain (Post-Election)
// Handles Form 17A records, Form 17C summaries, booth-wise aggregation
// NOTE: No vote choice, no voter identity linkage, no EVM access

import { Form17ARecord, Form17CSummary, Flag, IntegrityCertificate, RollRiskScore, PollingConsistency, TurnoutAnalytics, ScoreBreakdown } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateForm17ARecord, generateForm17CSummary, generateBoothId, generateDemoBooths } from '../data/synthetic';
import { RiskEngine } from '../engine/riskEngine';

export class ElectionAuditDomain {
  private form17aRecords: Map<string, Form17ARecord[]> = new Map(); // upload_id -> records[]
  private form17cSummaries: Map<string, Form17CSummary> = new Map(); // booth_id -> summary
  // private electionResults: Map<string, ElectionResult[]> = new Map(); // REMOVED: No vote counting allowed
  private flags: Map<string, Flag> = new Map();
  private riskEngine: RiskEngine;
  private boothEpics: Map<string, Set<string>> = new Map(); // booth_id -> Set<epic_id>

  constructor(riskEngine: RiskEngine) {
    this.riskEngine = riskEngine;
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    const { summaries, records } = generateDemoBooths();

    // Load Summaries
    for (const summary of summaries) {
      this.form17cSummaries.set(summary.booth_id, summary);
    }

    // Load Records (Upload logic)
    for (const boothRecords of records) {
        if (boothRecords.length === 0) continue;
        const boothId = boothRecords[0].booth_id;
        
        // Simulate upload
        const uploadId = uuidv4();
        // Fix up upload ID
        const finalRecords = boothRecords.map(r => ({...r, form17a_upload_id: uploadId}));
        this.form17aRecords.set(uploadId, finalRecords);

        // Track EPICS
        if (!this.boothEpics.has(boothId)) {
            this.boothEpics.set(boothId, new Set());
        }
        for (const r of finalRecords) {
            this.boothEpics.get(boothId)!.add(r.epic_id);
        }

        // Run Audit (Without creating flags here since we want to demonstrate real-time, but for init we can pre-populate or let user upload)
        // For demo init, we just store data. Flags will be generated when user clicks "Audit" or we can run it now.
        // Let's run it now so dashboard isn't empty.
        
        const auditFlags = this.riskEngine.scoreForm17AAudit(finalRecords);
        // Check mismatch
        const summary = this.form17cSummaries.get(boothId);
        if (summary) {
             const mismatchFlag = this.riskEngine.checkCountMismatch(finalRecords.length, summary.total_votes_polled, boothId);
             if (mismatchFlag) auditFlags.push(mismatchFlag);
        }

        for (const f of auditFlags) {
            this.flags.set(f.flag_id, f);
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

  // GENERATE INTEGRITY CERTIFICATE
  // NOTE: Does NOT access individual vote choices. Only process metadata.
  generateIntegrityCertificate(constituencyId: string): IntegrityCertificate {
    // 1. Calculate Roll Risk Score
    const allFlags = Array.from(this.flags.values());
    const highRiskFlags = allFlags.filter(f => f.risk_level === 'High Risk').length;
    const totalFlags = allFlags.length;
    
    // Mock total voters
    const totalVoters = 1000 + (totalFlags * 50); 
    const duplicateProb = Math.min(100, (highRiskFlags / totalVoters) * 100 * 5); 
    
    // Base score: 100 - penalties
    const rollScoreRaw = Math.max(0, 100 - (highRiskFlags * 2));

    const rollRiskScore: RollRiskScore = {
      total_voters: totalVoters,
      high_risk_detected: highRiskFlags,
      duplicate_probability: parseFloat(duplicateProb.toFixed(2)),
      cluster_size_alerts: allFlags.filter(f => f.reason === 'MULTIPLE_APPLICATIONS').length,
      final_score: rollScoreRaw,
      risk_level: highRiskFlags > 10 ? 'High' : highRiskFlags > 5 ? 'Medium' : 'Low'
    };

    // 2. Polling Consistency Check
    let matchedBooths = 0;
    let mismatchedBooths = 0;
    let total17a = 0;
    let total17c = 0;

    for (const summary of this.form17cSummaries.values()) {
      const f17a = this.getForm17ARecordsByBooth(summary.booth_id).length;
      total17a += f17a;
      total17c += summary.total_votes_polled;
      
      if (Math.abs(f17a - summary.total_votes_polled) <= 5) {
        matchedBooths++;
      } else {
        mismatchedBooths++;
      }
    }

    const pollingStatus = mismatchedBooths > 0 ? 'CRITICAL_MISMATCH' : 'MATCH';
    // 100 if MATCH, 50 if MINOR, 0 if CRITICAL
    const pollingScoreRaw = pollingStatus === 'MATCH' ? 100 : 0; 

    const pollingConsistency: PollingConsistency = {
      total_booths: matchedBooths + mismatchedBooths,
      matched_booths: matchedBooths,
      mismatched_booths: mismatchedBooths,
      total_votes_form17a: total17a,
      total_votes_form17c: total17c,
      deviation_percentage: total17a === 0 ? 0 : parseFloat(((Math.abs(total17a - total17c) / total17a) * 100).toFixed(4)),
      status: pollingStatus
    };

    // 3. Turnout Analytics (Mocked)
    const turnoutAnalytics: TurnoutAnalytics = {
      current_turnout: 67.5,
      historical_average: 65.0,
      deviation_from_baseline: 2.5,
      spike_detected: false
    };
    // 100 if no spike, 50 if spike
    const turnoutScoreRaw = turnoutAnalytics.spike_detected ? 50 : 100;

    // 4. Final Confidence Index (Weighted)
    // Weights: Roll Risk (40%), Polling (30%), Turnout (30%)
    const weights = { roll: 0.4, polling: 0.3, turnout: 0.3 };
    
    const rollContrib = rollScoreRaw * weights.roll;
    const pollingContrib = pollingScoreRaw * weights.polling;
    const turnoutContrib = turnoutScoreRaw * weights.turnout;
    
    const finalScore = Math.round(rollContrib + pollingContrib + turnoutContrib);

    const scoreBreakdown: ScoreBreakdown = {
      roll_risk_weight: weights.roll,
      polling_consistency_weight: weights.polling,
      turnout_analytics_weight: weights.turnout,
      roll_score_contribution: parseFloat(rollContrib.toFixed(1)),
      polling_score_contribution: parseFloat(pollingContrib.toFixed(1)),
      turnout_score_contribution: parseFloat(turnoutContrib.toFixed(1))
    };

    return {
      constituency_id: constituencyId,
      generated_at: new Date().toISOString(),
      roll_risk: rollRiskScore,
      polling_consistency: pollingConsistency,
      turnout_analytics: turnoutAnalytics,
      final_confidence_index: finalScore,
      score_breakdown: scoreBreakdown,
      status: finalScore > 90 ? 'VERIFIED' : 'PROVISIONAL'
    };
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
          if (!filters.booth_id) {
    return false; // or throw error depending on strictness
  }

  const boothEpics = this.boothEpics.get(filters.booth_id);
  return boothEpics?.has(f.entity_id);
}
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
