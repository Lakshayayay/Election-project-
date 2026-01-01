import React, { useEffect, useState } from 'react';
import { getFlags, resolveFlag, type Flag } from '../services/api';
import { authorityWS } from '../services/websocket';

function getRiskBgColor(level: string) {
  switch (level) {
    case 'High Risk':
      return 'bg-red-50';
    case 'Needs Review':
      return 'bg-yellow-50';
    default:
      return 'bg-white';
  }
}

function getRiskTextColor(level: string) {
  switch (level) {
    case 'High Risk':
      return 'text-red-700';
    case 'Needs Review':
      return 'text-yellow-700';
    default:
      return 'text-green-700';
  }
}

export function FlaggingPanel() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
    authorityWS.connect();

    const handleNewFlag = (data: Flag) => {
      setFlags(prev => [data, ...prev]);
    };

    authorityWS.on('flag_generated', handleNewFlag);
    authorityWS.on('audit_flag_detected', handleNewFlag);

    return () => {
      authorityWS.off('flag_generated', handleNewFlag);
      authorityWS.off('audit_flag_detected', handleNewFlag);
      authorityWS.disconnect();
    };
  }, []);

  const fetchFlags = async () => {
    try {
      const data = await getFlags();
      setFlags(data);
    } catch (error) {
      console.error('Failed to fetch flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (flagId: string) => {
    setResolving(flagId);
    try {
      const updatedFlag = await resolveFlag(flagId, 'Authority Admin');
      setFlags(prev => prev.map(f => (f.flag_id === updatedFlag.flag_id ? updatedFlag : f)));
    } catch (error) {
      console.error('Failed to resolve flag:', error);
      alert('Failed to resolve flag');
    } finally {
      setResolving(null);
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6 pb-4 border-b-2 border-[#003d82] flex justify-between items-center">
        <div>
          <h1 className="text-[#003d82] mb-1">Flagged Cases</h1>
          <p className="text-gray-600">AI-Powered Fraud Detection & Verification</p>
        </div>
        <button 
          onClick={fetchFlags} 
          className="text-sm border border-gray-300 px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">High Risk Cases</div>
          <div className="text-gray-900 font-bold">{flags.filter(d => d.risk_level === 'High Risk' && !d.resolved).length}</div>
        </div>
        <div className="bg-yellow-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Needs Review</div>
          <div className="text-gray-900 font-bold">{flags.filter(d => d.risk_level === 'Needs Review' && !d.resolved).length}</div>
        </div>
        <div className="bg-green-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Resolved Cases</div>
          <div className="text-gray-900 font-bold">{flags.filter(d => d.resolved).length}</div>
        </div>
        <div className="bg-blue-50 border border-gray-300 p-4">
          <div className="text-gray-600 text-sm mb-1">Total Flags</div>
          <div className="text-gray-900 font-bold">{flags.length}</div>
        </div>
      </div>

      <section className="mb-8">
        <div className="bg-[#003d82] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">Explainable AI Flagging Panel</h2>
        </div>
        
        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Entity ID</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Type</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Risk Level</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Reason for Flag</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.length > 0 ? (
                flags.map((row) => (
                  <tr key={row.flag_id} className={`${getRiskBgColor(row.risk_level)} hover:opacity-80`}>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 text-sm font-mono">
                      {row.entity_id.substring(0, 12)}...
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 capitalize">{row.entity_type}</td>
                    <td className={`border border-gray-300 px-4 py-2 ${getRiskTextColor(row.risk_level)} font-semibold`}>
                      {row.risk_level}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                      <div>{row.reason}</div>
                      <div className="text-xs text-gray-500">{row.explanation}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                      {row.resolved ? (
                        <span className="text-green-700 text-sm">✓ Resolved</span>
                      ) : (
                        <button
                          onClick={() => handleResolve(row.flag_id)}
                          disabled={resolving === row.flag_id}
                          className="bg-white border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                        >
                          {resolving === row.flag_id ? 'Resolving...' : 'Resolve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="p-4 text-center text-gray-500">No flags detected yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 border border-t-0 border-gray-300 px-4 py-2 text-sm text-gray-600">
          AI Model: ECI-VeriNet v3.2 | Confidence Threshold: 85% | Total Flagged: {flags.length}
        </div>
      </section>
    </div>
  );
}