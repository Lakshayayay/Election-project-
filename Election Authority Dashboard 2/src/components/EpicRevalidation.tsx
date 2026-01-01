import React, { useEffect, useMemo, useState } from 'react';
import { getVoterRequests, updateRequestStatus, type VoterRequest } from '../services/api';
import { authorityWS } from '../services/websocket';

export function EpicRevalidation() {
  const [requests, setRequests] = useState<VoterRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    authorityWS.connect();

    const handleNew = (data: VoterRequest) => {
      setRequests(prev => [data, ...prev]);
    };
    const handleUpdate = (data: VoterRequest) => {
      setRequests(prev => prev.map(r => (r.request_id === data.request_id ? { ...r, ...data } : r)));
    };

    authorityWS.on('new_voter_request_received', handleNew);
    authorityWS.on('request_status_updated', handleUpdate);

    return () => {
      authorityWS.off('new_voter_request_received', handleNew);
      authorityWS.off('request_status_updated', handleUpdate);
      authorityWS.disconnect();
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getVoterRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const revalidationRequests = useMemo(() => {
    // Filter for requests that involve existing EPICs (updates, transfers, etc)
    return requests.filter(r => 
      ['correction', 'transfer', 'deletion', 'lost_card'].includes(r.request_type)
    );
  }, [requests]);

  const handleAction = async (requestId: string, status: VoterRequest['status']) => {
    setActioning(requestId);
    try {
      const updated = await updateRequestStatus(requestId, status);
      setRequests(prev => prev.map(r => (r.request_id === updated.request_id ? updated : r)));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Action failed. Please try again.');
    } finally {
      setActioning(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'correction': return 'Correction';
      case 'transfer': return 'Transfer';
      case 'deletion': return 'Deletion';
      case 'lost_card': return 'Lost Card Re-issue';
      default: return type;
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6 pb-4 border-b-2 border-[#003d82] flex justify-between items-center">
        <div>
          <h1 className="text-[#003d82] mb-1">EPIC Re-Check & Re-Issue</h1>
          <p className="text-gray-600">Revalidate existing voter records and process re-issue requests.</p>
        </div>
        <button 
          onClick={loadRequests} 
          className="text-sm border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Pending Updates</div>
          <div className="text-gray-900 font-bold">{revalidationRequests.filter(r => r.status === 'Pending').length}</div>
        </div>
        <div className="bg-purple-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Corrections</div>
          <div className="text-gray-900 font-bold">{revalidationRequests.filter(r => r.request_type === 'correction').length}</div>
        </div>
        <div className="bg-orange-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Transfers</div>
          <div className="text-gray-900 font-bold">{revalidationRequests.filter(r => r.request_type === 'transfer').length}</div>
        </div>
        <div className="bg-red-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Lost Cards</div>
          <div className="text-gray-900 font-bold">{revalidationRequests.filter(r => r.request_type === 'lost_card').length}</div>
        </div>
      </div>

      <section className="mb-8">
        <div className="bg-[#003d82] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">Revalidation Queue</h2>
        </div>
        
        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">EPIC ID</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Applicant</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Request Type</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Risk Score</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Status</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {revalidationRequests.length > 0 ? (
                revalidationRequests.map((row) => (
                  <tr key={row.request_id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 font-mono text-sm">
                       {row.epic_id || row.submitted_data.epic_id || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                      <div>{row.submitted_data.name}</div>
                      <div className="text-xs text-gray-500">{row.submitted_data.constituency}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs border border-gray-200">
                        {getTypeLabel(row.request_type)}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 text-xs border ${
                        row.risk_score === 'High Risk' ? 'bg-red-100 text-red-800 border-red-200' :
                        row.risk_score === 'Needs Review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {row.risk_score}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`text-sm ${
                        row.status === 'Approved' ? 'text-green-700 font-semibold' :
                        row.status === 'Rejected' ? 'text-red-700 font-semibold' :
                        'text-gray-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                      {row.status !== 'Approved' && row.status !== 'Rejected' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(row.request_id, 'Approved')}
                            disabled={actioning === row.request_id}
                            className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs hover:bg-green-100 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(row.request_id, 'Rejected')}
                            disabled={actioning === row.request_id}
                            className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 text-xs hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={6} className="p-4 text-center text-gray-500">No revalidation requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}