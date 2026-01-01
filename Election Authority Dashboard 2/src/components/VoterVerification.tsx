import React, { useEffect, useMemo, useState } from 'react';
import { getVoterRequests, updateRequestStatus, type VoterRequest } from '../services/api';
import { authorityWS } from '../services/websocket';

type StatusFilter = 'All' | VoterRequest['status'];
type RiskFilter = 'All' | VoterRequest['risk_score'];

const statusOptions: StatusFilter[] = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'On Hold'];
const riskOptions: RiskFilter[] = ['All', 'Normal', 'Needs Review', 'High Risk'];

export function VoterVerification() {
  const [requests, setRequests] = useState<VoterRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VoterRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    authorityWS.connect();

    const handleNew = (data: VoterRequest) => {
      setRequests(prev => [data, ...prev]);
    };
    const handleStatusUpdate = (data: VoterRequest) => {
      setRequests(prev => prev.map(r => (r.request_id === data.request_id ? { ...r, ...data } : r)));
      setSelectedRequest(prev => (prev && prev.request_id === data.request_id ? { ...prev, ...data } : prev));
    };
    const handleRiskUpdate = (data: { request_id: string; risk_score: string; explanation: string }) => {
      setRequests(prev =>
        prev.map(r => (r.request_id === data.request_id ? { ...r, risk_score: data.risk_score as VoterRequest['risk_score'], risk_explanation: data.explanation } : r))
      );
    };

    authorityWS.on('new_voter_request_received', handleNew);
    authorityWS.on('request_status_updated', handleStatusUpdate);
    authorityWS.on('risk_score_updated', handleRiskUpdate);

    return () => {
      authorityWS.off('new_voter_request_received', handleNew);
      authorityWS.off('request_status_updated', handleStatusUpdate);
      authorityWS.off('risk_score_updated', handleRiskUpdate);
      authorityWS.disconnect();
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVoterRequests();
      setRequests(data);
      setSelectedRequest(data[0] || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusOk = statusFilter === 'All' || req.status === statusFilter;
      const riskOk = riskFilter === 'All' || req.risk_score === riskFilter;
      return statusOk && riskOk;
    });
  }, [requests, statusFilter, riskFilter]);

  const summary = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const underReview = requests.filter(r => r.status === 'Under Review').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const highRisk = requests.filter(r => r.risk_score === 'High Risk').length;
    const issuedEpic = requests.filter(r => r.status === 'Approved' && r.epic_id).length;
    return { pending, underReview, approved, rejected, highRisk, issuedEpic };
  }, [requests]);

  const updateStatus = async (requestId: string, status: VoterRequest['status']) => {
    setActioning(requestId + status);
    setError(null);
    try {
      const updated = await updateRequestStatus(requestId, status);
      setRequests(prev => prev.map(r => (r.request_id === updated.request_id ? updated : r)));
      setSelectedRequest(prev => (prev && prev.request_id === updated.request_id ? updated : prev));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActioning(null);
    }
  };

  const riskBadge = (risk: VoterRequest['risk_score']) => {
    if (risk === 'High Risk') return 'bg-red-100 text-red-800 border-red-200';
    if (risk === 'Needs Review') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const statusBadge = (status: VoterRequest['status']) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Under Review') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'On Hold') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div>
      <div className="mb-6 pb-4 border-b-2 border-[#003d82] flex items-center justify-between">
        <div>
          <h1 className="text-[#003d82] mb-1">Citizen Request Queue</h1>
          <p className="text-gray-600">Review, approve, or reject EPIC applications in real time.</p>
        </div>
        <button
          onClick={loadRequests}
          className="text-sm font-bold text-[#003d82] border border-[#003d82] px-3 py-1 hover:bg-[#003d82] hover:text-white transition-colors"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="border border-gray-200 p-4 bg-blue-50">
          <p className="text-sm text-gray-700">Pending</p>
          <p className="text-lg font-bold text-gray-900">{summary.pending}</p>
        </div>
        <div className="border border-gray-200 p-4 bg-yellow-50">
          <p className="text-sm text-gray-700">Under Review</p>
          <p className="text-lg font-bold text-gray-900">{summary.underReview}</p>
        </div>
        <div className="border border-gray-200 p-4 bg-green-50">
          <p className="text-sm text-gray-700">Approved</p>
          <p className="text-lg font-bold text-gray-900">{summary.approved}</p>
        </div>
        <div className="border border-gray-200 p-4 bg-red-50">
          <p className="text-sm text-gray-700">Rejected</p>
          <p className="text-lg font-bold text-gray-900">{summary.rejected}</p>
        </div>
        <div className="border border-gray-200 p-4 bg-orange-50">
          <p className="text-sm text-gray-700">High Risk</p>
          <p className="text-lg font-bold text-gray-900">{summary.highRisk}</p>
        </div>
        <div className="border border-gray-200 p-4 bg-[#dcfce7]">
          <p className="text-sm text-gray-700">EPIC Issued</p>
          <p className="text-lg font-bold text-gray-900">{summary.issuedEpic}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border border-gray-300 px-3 py-2 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-semibold">Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
            className="border border-gray-300 px-3 py-2 text-sm"
          >
            {riskOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests list */}
        <div className="lg:col-span-2 border border-gray-200 bg-white">
          <div className="bg-[#004a9f] text-white px-4 py-3">
            <h2 className="text-white m-0">Incoming Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Applicant</th>
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Type</th>
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Risk</th>
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Status</th>
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Submitted</th>
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req.request_id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedRequest?.request_id === req.request_id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="border border-gray-200 px-3 py-2 text-sm text-gray-800">
                      <p className="font-semibold text-gray-900">{req.submitted_data.name || 'Applicant'}</p>
                      <p className="text-xs text-gray-600">{req.submitted_data.constituency || '—'}</p>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm capitalize">{req.request_type.replace('_', ' ')}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      <span className={`px-2 py-1 text-xs border ${riskBadge(req.risk_score)}`}>{req.risk_score}</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      <span className={`px-2 py-1 text-xs border ${statusBadge(req.status)}`}>{req.status}</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      {new Date(req.submitted_at).toLocaleString('en-IN')}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm text-gray-800">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(req.request_id, 'Under Review'); }}
                          disabled={actioning === req.request_id + 'Under Review'}
                          className="px-3 py-1 border border-[#004a9f] text-[#004a9f] text-xs font-bold hover:bg-[#004a9f] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Under Review
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(req.request_id, 'Approved'); }}
                          disabled={actioning === req.request_id + 'Approved'}
                          className="px-3 py-1 border border-green-700 text-green-700 text-xs font-bold hover:bg-green-700 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(req.request_id, 'Rejected'); }}
                          disabled={actioning === req.request_id + 'Rejected'}
                          className="px-3 py-1 border border-red-700 text-red-700 text-xs font-bold hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-gray-600 py-6">
                      No applications match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="border border-gray-200 bg-white">
          <div className="bg-[#138808] text-white px-4 py-3">
            <h2 className="text-white m-0">Application Details</h2>
          </div>
          {selectedRequest ? (
            <div className="p-4 space-y-3 text-sm text-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase text-gray-500">Application ID</p>
                  <p className="font-semibold break-all">{selectedRequest.request_id}</p>
                </div>
                <span className={`px-2 py-1 text-xs border ${statusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Applicant</p>
                <p className="font-semibold text-gray-900">{selectedRequest.submitted_data.name || '—'}</p>
                <p className="text-gray-700">{selectedRequest.submitted_data.address || 'Address not provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">Mobile</p>
                  <p>{selectedRequest.submitted_data.mobile || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Email</p>
                  <p>{selectedRequest.submitted_data.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Risk</p>
                  <span className={`px-2 py-1 text-xs border ${riskBadge(selectedRequest.risk_score)}`}>{selectedRequest.risk_score}</span>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Request Type</p>
                  <p className="capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Risk Notes</p>
                <p className="text-gray-700">{selectedRequest.risk_explanation || 'No flags detected.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">Submitted</p>
                  <p>{new Date(selectedRequest.submitted_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Updated</p>
                  <p>{new Date(selectedRequest.updated_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
              {selectedRequest.epic_id && selectedRequest.status === 'Approved' && (
                <div className="bg-[#dcfce7] border border-[#16a34a] p-3">
                  <p className="text-[#14532d] font-bold">EPIC Issued: {selectedRequest.epic_id}</p>
                  <p className="text-xs text-[#14532d]">Share with citizen portal automatically.</p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs uppercase text-gray-500 mb-2">Decide</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(selectedRequest.request_id, 'Under Review')}
                    disabled={actioning === selectedRequest.request_id + 'Under Review'}
                    className="px-3 py-2 border border-[#004a9f] text-[#004a9f] text-xs font-bold hover:bg-[#004a9f] hover:text-white transition-colors disabled:opacity-50"
                  >
                    Move to Review
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.request_id, 'Approved')}
                    disabled={actioning === selectedRequest.request_id + 'Approved'}
                    className="px-3 py-2 border border-green-700 text-green-700 text-xs font-bold hover:bg-green-700 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Approve & Issue EPIC
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.request_id, 'Rejected')}
                    disabled={actioning === selectedRequest.request_id + 'Rejected'}
                    className="px-3 py-2 border border-red-700 text-red-700 text-xs font-bold hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-700">
              Select an application to view details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
