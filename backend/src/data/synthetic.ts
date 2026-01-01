// Synthetic Data Generation for Testing

import { VoterRecord, Form17ARecord, Form17CSummary, ElectionResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

const states = ['Delhi', 'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Tamil Nadu'];
const constituencies = {
  'Delhi': ['New Delhi', 'Chandni Chowk', 'South Delhi', 'East Delhi', 'West Delhi', 'North Delhi'],
  'Maharashtra': ['Mumbai North', 'Mumbai South', 'Pune', 'Nagpur'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Agra'],
  'West Bengal': ['Kolkata South', 'Kolkata North', 'Howrah'],
  'Karnataka': ['Bangalore North', 'Bangalore South'],
  'Tamil Nadu': ['Chennai North', 'Chennai South']
};

const parties = [
  'Bharatiya Janata Party (BJP)',
  'Indian National Congress (INC)',
  'Aam Aadmi Party (AAP)',
  'Trinamool Congress (TMC)',
  'Samajwadi Party (SP)',
  'Dravida Munnetra Kazhagam (DMK)',
  'Others'
];

const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Suresh', 'Meena', 'Kiran', 'Pooja'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Devi', 'Patel', 'Rao', 'Gupta', 'Verma', 'Malhotra', 'Yadav'];

export function generateVoterRecord(epic_id?: string): VoterRecord {
  const state = states[Math.floor(Math.random() * states.length)];
  const constituency = constituencies[state]?.[Math.floor(Math.random() * constituencies[state].length)] || 'Unknown';
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  
  const age = Math.floor(Math.random() * 50) + 18;
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const dob = `${birthDay.toString().padStart(2, '0')}/${birthMonth.toString().padStart(2, '0')}/${birthYear}`;

  const stateCode = state.substring(0, 2).toUpperCase();
  const epic = epic_id || `${stateCode}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 10000000)}`;

  return {
    voter_record_id: uuidv4(),
    epic_id: epic,
    name: name.toUpperCase(),
    guardian_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`.toUpperCase(),
    relation: ['Father', 'Mother', 'Husband', 'Wife'][Math.floor(Math.random() * 4)],
    gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
    age,
    dob,
    address: `${Math.floor(Math.random() * 999) + 1}, ${constituency}, ${state} - ${Math.floor(Math.random() * 999999) + 100000}`,
    constituency: `${constituency} (Constituency No. ${Math.floor(Math.random() * 50) + 1})`,
    assembly_constituency: `${constituency} (AC No. ${Math.floor(Math.random() * 100) + 1})`,
    polling_station: `Government Senior Secondary School, ${constituency}`,
    part_no: Math.floor(Math.random() * 1000).toString(),
    serial_no: Math.floor(Math.random() * 10000).toString(),
    state,
    mobile: `9${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function generateForm17ARecord(booth_id: string, epic_id: string, upload_id: string): Form17ARecord {
  return {
    record_id: uuidv4(),
    booth_id,
    epic_id,
    serial_number: Math.floor(Math.random() * 10000).toString(),
    voter_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`.toUpperCase(),
    thumb_impression_hash: `hash_${uuidv4().substring(0, 16)}`, // Simulated hash
    signature_hash: `hash_${uuidv4().substring(0, 16)}`, // Simulated hash
    form17a_upload_id: upload_id,
    uploaded_at: new Date().toISOString()
  };
}

export function generateForm17CSummary(booth_id: string, constituency: string): Form17CSummary {
  const totalElectors = Math.floor(Math.random() * 50000) + 50000;
  const votesPolled = Math.floor(totalElectors * (0.5 + Math.random() * 0.3));
  const validVotes = Math.floor(votesPolled * (0.95 + Math.random() * 0.04));
  const rejectedVotes = votesPolled - validVotes;

  return {
    summary_id: uuidv4(),
    booth_id,
    constituency,
    total_electors: totalElectors,
    total_votes_polled: votesPolled,
    valid_votes: validVotes,
    rejected_votes: rejectedVotes,
    uploaded_at: new Date().toISOString()
  };
}

export function generateElectionResult(constituency: string, state: string): ElectionResult[] {
  const results: ElectionResult[] = [];
  const numCandidates = Math.floor(Math.random() * 5) + 3;
  let votes = Math.floor(Math.random() * 100000) + 50000;

  for (let i = 0; i < numCandidates; i++) {
    const party = parties[Math.floor(Math.random() * parties.length)];
    const candidateVotes = Math.floor(votes * (0.2 + Math.random() * 0.4));
    votes -= candidateVotes;

    results.push({
      constituency,
      state,
      candidate_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      party,
      votes: candidateVotes,
      status: i === 0 ? 'Leading' : 'Trailing',
      margin: i === 0 && results.length > 0 ? candidateVotes - (results[0]?.votes || 0) : undefined
    });
  }

  // Sort by votes descending
  return results.sort((a, b) => b.votes - a.votes);
}

export function generateBoothId(state: string, constituency: string): string {
  const stateCode = state.substring(0, 2).toUpperCase();
  const constituencyCode = constituency.substring(0, 2).toUpperCase().replace(/\s/g, '');
  const number = Math.floor(Math.random() * 999) + 1;
  return `BTH-${stateCode}-${constituencyCode}-${number.toString().padStart(3, '0')}`;
}
