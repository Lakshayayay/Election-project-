import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { getElectionResults } from '../services/api';
import { wsService } from '../services/websocket';
import type { ElectionResult } from '../services/api';

export function LiveResults() {
  const [activeModal, setActiveModal] = useState(false);
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect();
    
    // Fetch initial results
    loadResults();
    
    // Set up polling for live updates (every 30 seconds)
    const interval = setInterval(loadResults, 30000);
    
    return () => {
      clearInterval(interval);
      wsService.disconnect();
    };
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const fetchedResults = await getElectionResults();
      setResults(fetchedResults);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
      // Keep previous results on error
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveResults = (constituency?: string) => {
    wsService.fetchLiveResults(
      constituency,
      (results) => {
        setResults(results);
        setError(null);
      },
      (err) => {
        setError(err);
      }
    );
  };

  // Mock results for display when API returns empty (for demo - matches API format)
  const mockResults: ElectionResult[] = [
    {
      constituency: 'New Delhi',
      state: 'Delhi',
      candidate_name: 'Arvind Kumar',
      party: 'Aam Aadmi Party',
      votes: 89456,
      status: 'Leading'
    },
    {
      constituency: 'New Delhi',
      state: 'Delhi',
      candidate_name: 'Meenakshi Lekhi',
      party: 'Bharatiya Janata Party',
      votes: 76234,
      status: 'Trailing'
    },
    {
      constituency: 'Chandni Chowk',
      state: 'Delhi',
      candidate_name: 'Jai Prakash Agarwal',
      party: 'Bharatiya Janata Party',
      votes: 112890,
      status: 'Leading'
    },
    {
      constituency: 'Chandni Chowk',
      state: 'Delhi',
      candidate_name: 'Prem Lata',
      party: 'Indian National Congress',
      votes: 98765,
      status: 'Trailing'
    },
    {
      constituency: 'South Delhi',
      state: 'Delhi',
      candidate_name: 'Ramesh Bidhuri',
      party: 'Bharatiya Janata Party',
      votes: 145678,
      status: 'Leading'
    },
    {
      constituency: 'South Delhi',
      state: 'Delhi',
      candidate_name: 'Radhika Khera',
      party: 'Indian National Congress',
      votes: 98432,
      status: 'Trailing'
    },
    {
      constituency: 'East Delhi',
      state: 'Delhi',
      candidate_name: 'Gautam Gambhir',
      party: 'Bharatiya Janata Party',
      votes: 134567,
      status: 'Leading'
    },
    {
      constituency: 'East Delhi',
      state: 'Delhi',
      candidate_name: 'Kuldeep Kumar',
      party: 'Aam Aadmi Party',
      votes: 121345,
      status: 'Trailing'
    }
  ];

  const displayResults: ElectionResult[] = results.length > 0 ? results : mockResults;

  return (
    <section className="mb-12">
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Live Election Results</h2>
      </div>

      <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-800">
            <strong>Last Updated:</strong> {new Date().toLocaleString('en-IN')} | Results are being updated continuously
          </p>
          <button
            onClick={() => {
              loadResults();
              fetchLiveResults();
            }}
            disabled={loading}
            className="bg-[#1e3a8a] text-white px-4 py-1 text-sm font-bold hover:bg-[#1e40af] disabled:opacity-50"
          >
            {loading ? 'REFRESHING...' : 'REFRESH'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading && results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading election results...</p>
        </div>
      ) : (
        <>
          <div className="bg-[#f8f9fa] border border-gray-300 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="text-left px-4 py-3 font-bold border-r border-blue-700">Constituency</th>
                  <th className="text-left px-4 py-3 font-bold border-r border-blue-700">Candidate Name</th>
                  <th className="text-left px-4 py-3 font-bold border-r border-blue-700">Party</th>
                  <th className="text-right px-4 py-3 font-bold border-r border-blue-700">Votes</th>
                  <th className="text-center px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayResults.map((result, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${result.status === 'Leading' ? 'bg-[#dcfce7]' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 text-sm border-r border-gray-300 font-bold">
                      {result.constituency}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-300">
                      {result.candidate_name}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-300">
                      {result.party}
                    </td>
                    <td className="px-4 py-3 text-sm text-right border-r border-gray-300 font-bold">
                      {result.votes.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {result.status === 'Leading' ? (
                        <span className="bg-[#16a34a] text-white px-3 py-1 text-xs font-bold">
                          LEADING
                        </span>
                      ) : result.status === 'Won' ? (
                        <span className="bg-[#16a34a] text-white px-3 py-1 text-xs font-bold">
                          WON
                        </span>
                      ) : (
                        <span className="bg-gray-400 text-white px-3 py-1 text-xs font-bold">
                          TRAILING
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setActiveModal(true)}
              className="text-[#1e3a8a] font-bold hover:underline"
            >
              View Detailed Constituency-wise Results →
            </button>
          </div>
        </>
      )}

      {/* Detailed Results Modal */}
      <Modal
        isOpen={activeModal}
        onClose={() => setActiveModal(false)}
        title="Detailed Constituency-wise Results - Delhi Assembly Elections 2024"
      >
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#f8f9fa] border border-gray-300 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">70</p>
              <p className="text-xs text-gray-600 mt-1">Total Seats</p>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-300 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">45</p>
              <p className="text-xs text-gray-600 mt-1">Results Declared</p>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-300 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">25</p>
              <p className="text-xs text-gray-600 mt-1">Counting in Progress</p>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-300 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">64.2%</p>
              <p className="text-xs text-gray-600 mt-1">Voter Turnout</p>
            </div>
          </div>

          {/* Party-wise Performance */}
          <div className="bg-[#f8f9fa] border border-gray-300 p-4">
            <h4 className="font-bold text-gray-900 mb-3">Party-wise Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                <span className="text-sm font-bold text-gray-900">Bharatiya Janata Party (BJP)</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#16a34a]">Leading: 28</span>
                  <span className="text-sm text-gray-600 ml-4">Won: 15</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                <span className="text-sm font-bold text-gray-900">Aam Aadmi Party (AAP)</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#16a34a]">Leading: 22</span>
                  <span className="text-sm text-gray-600 ml-4">Won: 18</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                <span className="text-sm font-bold text-gray-900">Indian National Congress (INC)</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#16a34a]">Leading: 8</span>
                  <span className="text-sm text-gray-600 ml-4">Won: 6</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                <span className="text-sm font-bold text-gray-900">Others</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#16a34a]">Leading: 12</span>
                  <span className="text-sm text-gray-600 ml-4">Won: 6</span>
                </div>
              </div>
            </div>
          </div>

          {/* Constituency-wise Details */}
          <div className="bg-[#f8f9fa] border border-gray-300 p-4">
            <h4 className="font-bold text-gray-900 mb-3">Select Constituency for Detailed Results</h4>
            <select className="w-full border border-gray-400 px-3 py-2 text-sm mb-4">
              <option>-- Select Constituency --</option>
              <option>New Delhi</option>
              <option>Chandni Chowk</option>
              <option>South Delhi</option>
              <option>East Delhi</option>
              <option>West Delhi</option>
              <option>North Delhi</option>
              <option>North West Delhi</option>
            </select>

            {/* Sample Detailed Result for New Delhi */}
            <div className="bg-white border border-gray-300 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <h5 className="font-bold text-gray-900">New Delhi Constituency (AC No. 44)</h5>
                <span className="text-xs bg-[#fef3c7] border border-[#f59e0b] px-2 py-1 font-bold">COUNTING</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-600 font-bold">Total Electors:</p>
                  <p className="text-gray-900">1,64,521</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Votes Polled:</p>
                  <p className="text-gray-900">1,05,678 (64.2%)</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Valid Votes:</p>
                  <p className="text-gray-900">1,04,123</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Rejected Votes:</p>
                  <p className="text-gray-900">1,555</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-300">
                <p className="text-xs font-bold text-gray-700 mb-2">Candidate-wise Results (Rounds: 12/15)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-[#dcfce7] border border-[#16a34a]">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Arvind Kumar</p>
                      <p className="text-xs text-gray-600">Aam Aadmi Party (AAP)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">89,456</p>
                      <p className="text-xs text-[#16a34a] font-bold">LEADING</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Meenakshi Lekhi</p>
                      <p className="text-xs text-gray-600">Bharatiya Janata Party (BJP)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">76,234</p>
                      <p className="text-xs text-gray-500">Margin: 13,222</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Rajesh Sharma</p>
                      <p className="text-xs text-gray-600">Indian National Congress (INC)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">12,433</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white border border-gray-300">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Others (NOTA + 5 candidates)</p>
                      <p className="text-xs text-gray-600">Independent & Others</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">26,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-300">
            <button className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors">
              DOWNLOAD FULL REPORT
            </button>
            <div className="flex gap-3">
              <button className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors">
                REFRESH RESULTS
              </button>
              <button 
                onClick={() => setActiveModal(false)}
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}