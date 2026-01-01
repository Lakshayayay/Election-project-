import React, { useEffect, useState, useMemo } from 'react';
import { getElectionResults } from '../services/api';

interface ElectionResult {
  constituency: string;
  state: string;
  candidate_name: string;
  party: string;
  votes: number;
  status: 'Won' | 'Leading' | 'Trailing';
}

interface PartyStat {
  party: string;
  shortName: string;
  won: number;
  leading: number;
  total: number;
  voteShare: number;
  status: 'leading' | 'trailing';
}

interface ConstituencyView {
  constituency: string;
  state: string;
  candidate: string;
  party: string; // Added for color coding if needed
  won: boolean;
  votes: number;
  margin: number;
  runnerUp: string;
}

const totalSeats = 543; // Hardcoded for demo context
const requiredForMajority = 272;

export function LiveVoteCounting() {
  const [rawResults, setRawResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getElectionResults();
      setRawResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const { partyStats, constituencyStats, topParty } = useMemo(() => {
    if (rawResults.length === 0) return { partyStats: [], constituencyStats: [], topParty: null };

    // 1. Group by constituency
    const byConstituency: Record<string, ElectionResult[]> = {};
    let totalVotes = 0;

    rawResults.forEach(r => {
      if (!byConstituency[r.constituency]) byConstituency[r.constituency] = [];
      byConstituency[r.constituency].push(r);
      totalVotes += r.votes;
    });

    const constituencies: ConstituencyView[] = [];
    const partyCounts: Record<string, { won: number; leading: number; votes: number }> = {};

    // 2. Process each constituency
    Object.keys(byConstituency).forEach(constituency => {
      const candidates = byConstituency[constituency].sort((a, b) => b.votes - a.votes);
      const winner = candidates[0];
      const runnerUp = candidates[1];
      const margin = runnerUp ? winner.votes - runnerUp.votes : winner.votes;

      const won = winner.status === 'Won';
      
      constituencies.push({
        constituency: winner.constituency,
        state: winner.state,
        candidate: `${winner.candidate_name} (${winner.party})`,
        party: winner.party,
        won,
        votes: winner.votes,
        margin,
        runnerUp: runnerUp ? `${runnerUp.candidate_name} (${runnerUp.party})` : 'None'
      });

      // Update party counts
      if (!partyCounts[winner.party]) partyCounts[winner.party] = { won: 0, leading: 0, votes: 0 };
      if (won) {
        partyCounts[winner.party].won++;
      } else {
        partyCounts[winner.party].leading++;
      }
    });

    // 3. Aggregate all votes for party vote share (from all candidates, not just winners)
    rawResults.forEach(r => {
      if (!partyCounts[r.party]) partyCounts[r.party] = { won: 0, leading: 0, votes: 0 };
      partyCounts[r.party].votes += r.votes;
    });

    // 4. Build Party Stats Array
    const stats: PartyStat[] = Object.keys(partyCounts).map(party => {
      const p = partyCounts[party];
      const total = p.won + p.leading;
      return {
        party,
        shortName: party.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4), // Simple abbreviation
        won: p.won,
        leading: p.leading,
        total,
        voteShare: totalVotes > 0 ? parseFloat(((p.votes / totalVotes) * 100).toFixed(1)) : 0,
        status: 'trailing' // Will update after sorting
      };
    }).sort((a, b) => b.total - a.total);

    // Set status for top party
    if (stats.length > 0) stats[0].status = 'leading';

    return {
      partyStats: stats,
      constituencyStats: constituencies,
      topParty: stats.length > 0 ? stats[0] : null
    };
  }, [rawResults]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading election data...</div>;
  if (!topParty) return <div className="p-8 text-center text-gray-500">No election data available.</div>;

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6 pb-4 border-b-2 border-[#003d82]">
        <h1 className="text-[#003d82] mb-1">Live Vote Count - General Election 2024</h1>
        <p className="text-gray-600">Real-time Counting Updates | Total Seats: {totalSeats} | Majority Mark: {requiredForMajority}</p>
      </div>

      {/* Leading Party Banner */}
      <div className="bg-[#138808] border border-[#138808] p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-white text-sm mb-1">LEADING PARTY</p>
            <h2 className="text-white m-0 text-3xl font-bold">{topParty.party}</h2>
          </div>
          <div className="text-right">
            <p className="text-white text-sm mb-1">WON + LEADING</p>
            <div className="text-white text-2xl font-mono">
              <span className="mr-2">{topParty.won} Won</span>
              <span className="mr-2">+</span>
              <span>{topParty.leading} Leading</span>
              <span className="ml-2">=</span>
              <span className="ml-2 font-bold">{topParty.total} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Party-wise Results */}
      <section className="mb-8">
        <div className="bg-[#003d82] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">Party-wise Seat Count</h2>
        </div>
        
        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Party Name</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Won</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Leading</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Total</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Vote Share (%)</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {partyStats.map((row, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-gray-800">
                    <div className="font-semibold">{row.party}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">{row.won}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">{row.leading}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                    <strong className="text-lg">{row.total}</strong>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">{row.voteShare}%</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {row.status === 'leading' ? (
                      <span className="text-green-700 font-bold">▲ LEADING</span>
                    ) : (
                      <span className="text-gray-600">● Behind</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 text-gray-800"><strong>TOTAL</strong></td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                  <strong>{partyStats.reduce((sum, p) => sum + p.won, 0)}</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                  <strong>{partyStats.reduce((sum, p) => sum + p.leading, 0)}</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                  <strong>{partyStats.reduce((sum, p) => sum + p.total, 0)}</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                  <strong>100%</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="bg-gray-50 border border-t-0 border-gray-300 px-4 py-2 text-sm text-gray-600">
          Last Updated: {new Date().toLocaleString('en-IN')} | Results: {partyStats.reduce((sum, p) => sum + p.total, 0)} / {totalSeats} Seats
        </div>
      </section>

      {/* Constituency-wise Results */}
      <section className="mb-8">
        <div className="bg-[#ff9933] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">Constituency-wise Results</h2>
        </div>
        
        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Constituency</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">State</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Winning/Leading Candidate</th>
                <th className="border border-gray-300 px-4 py-2.5 text-right text-gray-800">Votes</th>
                <th className="border border-gray-300 px-4 py-2.5 text-right text-gray-800">Margin</th>
                <th className="border border-gray-300 px-4 py-2.5 text-center text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {constituencyStats.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-gray-800">{row.constituency}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-800">{row.state}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-800">
                    <div>{row.candidate}</div>
                    <div className="text-sm text-gray-600">defeats {row.runnerUp}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-gray-800">
                    {row.votes.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-gray-800">
                    {row.margin.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {row.won ? (
                      <span className="text-green-700 font-bold">✓ WON</span>
                    ) : (
                      <span className="text-blue-700 font-bold">→ LEADING</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 border border-t-0 border-gray-300 px-4 py-2 text-sm text-gray-600">
          Data Source: Electronic Voting Machines (EVM) | Constituencies Declared: {constituencyStats.filter(c => c.won).length} / {constituencyStats.length}
        </div>
      </section>
    </div>
  );
}
