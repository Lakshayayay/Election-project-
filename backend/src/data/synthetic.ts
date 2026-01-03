// Synthetic Data Generation for Demo Scenarios

import { VoterRecord, Form17ARecord, Form17CSummary, ElectionResult, RiskLevel } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- CONSTANTS ---
const STATES = ['Delhi', 'Maharashtra', 'Uttar Pradesh'];
const CONSTITUENCIES = {
  'Delhi': ['New Delhi', 'Chandni Chowk'],
  'Maharashtra': ['Mumbai South'],
  'Uttar Pradesh': ['Varanasi']
};

// --- HELPER GENERATORS ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Anya', 'Aadhya', 'Pari'];
const LAST_NAMES = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Iyer', 'Reddy', 'Verma', 'Mehta', 'Malhotra'];

// --- SCENARIO DATASETS ---

export const SCENARIOS = {
  CLEAN_VOTER: 'CLEAN_VOTER',
  DUPLICATE_EPIC: 'DUPLICATE_EPIC',
  UNDERAGE: 'UNDERAGE',
  BULK_ADDRESS: 'BULK_ADDRESS',
  BOT_ATTACK: 'BOT_ATTACK'
};

// 1. VOTER GENERATOR (Targeted)
export function generateDemoVoters(count: number = 50): { records: VoterRecord[]; requests: any[] } {
  const records: VoterRecord[] = [];
  const requests: any[] = [];
  
  // A. CLEAN VOTERS (Low Risk) - 50%
  for (let i = 0; i < count * 0.5; i++) {
    const v = createBaseVoter();
    records.push(v);
    requests.push({ type: 'registration', data: v, ip: `192.168.1.${randomInt(10, 200)}` });
  }

  // B. DUPLICATE EPIC (High Risk) - 2 voters sharing EPIC
  const dupEpic = 'DL0123456789';
  const v1 = createBaseVoter(); v1.epic_id = dupEpic; v1.name = "Vikram Singh";
  const v2 = createBaseVoter(); v2.epic_id = dupEpic; v2.name = "Vikram S."; // Slight name var
  records.push(v1, v2);
  requests.push({ type: 'registration', data: v1, ip: '10.0.0.5' });
  requests.push({ type: 'registration', data: v2, ip: '10.0.0.6' });

  // C. UNDERAGE (Critical)
  const underage = createBaseVoter();
  underage.age = 17;
  underage.dob = `01/01/${new Date().getFullYear() - 17}`;
  records.push(underage);
  requests.push({ type: 'registration', data: underage, ip: '192.168.1.55' });

  // D. ADDRESS DENSITY (Critical) - 10 voters same address
  const bulkAddress = "H.No 420, Fake Lane, New Delhi";
  for (let i = 0; i < 10; i++) {
    const v = createBaseVoter();
    v.address = bulkAddress;
    records.push(v);
    requests.push({ type: 'registration', data: v, ip: `192.168.2.${i}` }); // Different IPs
  }

  // E. BOT ATTACK (High Velocity) - 15 requests same IP
  const botIP = "203.0.113.42";
  for (let i = 0; i < 15; i++) {
    const v = createBaseVoter();
    records.push(v);
    requests.push({ type: 'registration', data: v, ip: botIP });
  }

  return { records, requests };
}

function createBaseVoter(): VoterRecord {
  const state = 'Delhi';
  const consti = 'New Delhi';
  const age = randomInt(18, 80);
  const byear = new Date().getFullYear() - age;
  
  return {
    voter_record_id: uuidv4(),
    epic_id: `EPIC${randomInt(1000000, 9999999)}`,
    name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
    age: age,
    dob: `${randomInt(1, 28)}/${randomInt(1, 12)}/${byear}`,
    gender: randomChoice(['Male', 'Female']),
    address: `${randomInt(1, 999)}, Block ${randomChoice(['A','B','C'])}, ${consti}`,
    constituency: consti,
    state: state,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// 2. POLLING BOOTH GENERATOR
export function generateDemoBooths(): { summaries: Form17CSummary[]; records: Form17ARecord[][] } {
  const summaries: Form17CSummary[] = [];
  const allRecords: Form17ARecord[][] = [];
  
  // A. CLEAN BOOTH (Match or +/- 1)
  createBoothData('Clean Booth', 0, summaries, allRecords);
  
  // B. MINOR MISMATCH (2-5 diff)
  createBoothData('Minor Issues', 3, summaries, allRecords);
  
  // C. CRITICAL MISMATCH (>10 diff) - Demo Drama
  createBoothData('Critical Audit', 12, summaries, allRecords);

  return { summaries, records: allRecords };
}

function createBoothData(boothName: string, mismatch: number, summaries: Form17CSummary[], allRecords: Form17ARecord[][]) {
  const boothId = `BTH-${uuidv4().substring(0,8)}`;
  const totalVotes = randomInt(500, 800);
  
  // Form 17C (Official Count)
  summaries.push({
    summary_id: uuidv4(),
    booth_id: boothId,
    constituency: 'New Delhi', // Demo target
    total_electors: 1000,
    total_votes_polled: totalVotes,
    valid_votes: totalVotes, // Simplified
    rejected_votes: 0,
    uploaded_at: new Date().toISOString()
  });

  // Form 17A (Voter Log) - Inject mismatch
  const logCount = totalVotes - mismatch; // If mismatch is positive, log is less than count (ghost votes)
  const records: Form17ARecord[] = [];
  
  for(let i=0; i<logCount; i++) {
    records.push({
      record_id: uuidv4(),
      booth_id: boothId,
      epic_id: `EPIC${randomInt(100000, 999999)}`,
      serial_number: (i+1).toString(),
      voter_name: 'Start Synthetic',
      form17a_upload_id: 'upload_1',
      uploaded_at: new Date().toISOString()
    });
  }
  allRecords.push(records);
}

// 3. LEGACY EXPORTS (Mock for compatibility if referenced directly)
export function generateVoterRecord(epic?: string) { return createBaseVoter(); }
export function generateBoothId(s:string, c:string) { return `BTH-DEMO-${randomInt(100,999)}`; }
// ... add others if build fails, but mainly we use the above.

export function generateForm17ARecord(boothId: string, epicId: string, uploadId: string): Form17ARecord {
    // Basic mock implementation for legacy calls
    return {
        record_id: uuidv4(),
        booth_id: boothId,
        epic_id: epicId,
        serial_number: "1",
        voter_name: "Legacy Mock",
        form17a_upload_id: uploadId,
        uploaded_at: new Date().toISOString()
    };
}

export function generateForm17CSummary(boothId: string, constituency: string): Form17CSummary {
    return {
        summary_id: uuidv4(),
        booth_id: boothId,
        constituency: constituency,
        total_electors: 1000,
        total_votes_polled: 600,
        valid_votes: 600,
        rejected_votes: 0,
        uploaded_at: new Date().toISOString()
    };
}
