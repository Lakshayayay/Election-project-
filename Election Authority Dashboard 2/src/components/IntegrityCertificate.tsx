import React, { useEffect, useState } from 'react';
import { getIntegrityCertificate, IntegrityCertificate as CertificateType } from '../services/api';
import { Shield, ShieldAlert, BadgeCheck, Activity, FileCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function IntegrityCertificate() {
  const [loading, setLoading] = useState(false);
  const [constituencyId, setConstituencyId] = useState('New Delhi'); // Default for demo
  const [certificate, setCertificate] = useState<CertificateType | null>(null);

  const generateCertificate = async () => {
    setLoading(true);
    try {
      const data = await getIntegrityCertificate(constituencyId);
      setCertificate(data);
      toast.success('Integrity Certificate Generated Successfully');
    } catch (error) {
      toast.error('Failed to generate certificate');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load on mount for demo
    generateCertificate();
  }, []);

  if (!certificate && loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-400" />
              Election Process Integrity Certificate
            </h2>
            <p className="text-slate-400 mt-1">
              Constituency: <span className="text-white font-mono">{constituencyId}</span> | 
              Generated: <span className="font-mono">{certificate ? new Date(certificate.generated_at).toLocaleString() : '-'}</span>
            </p>
          </div>
          <div className="text-right">
             <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
               certificate?.status === 'VERIFIED' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
               certificate?.status === 'FLAGGED' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 
               'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
             }`}>
               {certificate?.status || 'PENDING'}
             </span>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
                <strong>Legal Disclaimer:</strong> Integrity Certificates are generated <u>before result declaration</u> to verify procedural correctness. 
                They do <strong>not</strong> modify or influence final vote counts. This document aids Election Authorities in deciding whether to release results.
            </p>
        </div>

        {/* Main Content */}
        {certificate ? (
          <div className="p-8 space-y-8">
            
            {/* Top Row: The Big Index */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <h3 className="text-slate-600 font-semibold mb-2">INTEGRITY CONFIDENCE INDEX</h3>
              <div className="flex items-center justify-center gap-4">
                <div className={`text-6xl font-black ${
                  certificate.final_confidence_index > 90 ? 'text-green-600' : 
                  certificate.final_confidence_index > 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {certificate.final_confidence_index}%
                </div>
                {certificate.final_confidence_index > 90 && <BadgeCheck className="h-12 w-12 text-green-600" />}
                {certificate.final_confidence_index <= 75 && <AlertTriangle className="h-12 w-12 text-yellow-600" />}
              </div>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
                Calculated based on Electoral Roll purity, Form 17A vs 17C consistency, and statistical turnout baseline analysis.
              </p>
              
              {/* Score Transparency Breakdown */}
              {certificate.score_breakdown && (
                <div className="mt-4 flex justify-center gap-2 text-xs text-slate-400 font-mono bg-slate-100 py-2 px-4 rounded-full inline-block">
                    <span>Roll ({certificate.score_breakdown.roll_risk_weight * 100}%)</span> + 
                    <span>Polling ({certificate.score_breakdown.polling_consistency_weight * 100}%)</span> + 
                    <span>Turnout ({certificate.score_breakdown.turnout_analytics_weight * 100}%)</span>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Roll Risk */}
              <div className="p-5 border rounded-lg hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-100 text-xs px-2 py-1 rounded-bl text-slate-500 font-mono">
                   W: {certificate?.score_breakdown?.roll_risk_weight}
                </div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Roll Hygiene
                  </h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    certificate.roll_risk.risk_level === 'Low' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {certificate.roll_risk.final_score}/100
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>High Risk Voters:</span>
                    <span className="font-mono font-medium">{certificate.roll_risk.high_risk_detected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Prob:</span>
                    <span className="font-mono font-medium">{certificate.roll_risk.duplicate_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cluster Alerts:</span>
                    <span className="font-mono font-medium">{certificate.roll_risk.cluster_size_alerts}</span>
                  </div>
                </div>
              </div>

              {/* 2. Polling Consistency */}
              <div className="p-5 border rounded-lg hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-100 text-xs px-2 py-1 rounded-bl text-slate-500 font-mono">
                   W: {certificate?.score_breakdown?.polling_consistency_weight}
                </div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-purple-600" />
                    Polling Audit
                  </h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    certificate.polling_consistency.status === 'MATCH' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {certificate.polling_consistency.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Mismatched Booths:</span>
                    <span className={certificate.polling_consistency.mismatched_booths > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                      {certificate.polling_consistency.mismatched_booths}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deviation:</span>
                    <span className="font-mono font-medium">{certificate.polling_consistency.deviation_percentage}%</span>
                  </div>
                  <div className="pt-2 text-xs text-slate-500 border-t mt-2">
                    Comparing Form 17A (Voters) vs Form 17C (Votes)
                  </div>
                </div>
              </div>

              {/* 3. Turnout Analytics */}
              <div className="p-5 border rounded-lg hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-100 text-xs px-2 py-1 rounded-bl text-slate-500 font-mono">
                   W: {certificate?.score_breakdown?.turnout_analytics_weight}
                </div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-orange-600" />
                    Turnout Stats
                  </h4>
                  {certificate.turnout_analytics.spike_detected && (
                     <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">SPIKE DETECTED</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Current Turnout:</span>
                    <span className="font-mono font-medium">{certificate.turnout_analytics.current_turnout}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hist. Baseline:</span>
                    <span className="font-mono font-medium">{certificate.turnout_analytics.historical_average}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deviation:</span>
                    <span className={`font-mono font-medium ${certificate.turnout_analytics.deviation_from_baseline > 5 ? 'text-red-600' : 'text-slate-600'}`}>
                      {certificate.turnout_analytics.deviation_from_baseline > 0 ? '+' : ''}{certificate.turnout_analytics.deviation_from_baseline}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Digital Certification</p>
              <button 
                onClick={generateCertificate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
              >
                <Activity className="h-4 w-4" />
                Regenerate Analysis
              </button>
              <p className="text-xs text-slate-500 mt-4 italic">
                Authorized for internal review.
              </p>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Click "Generate" to analyze constituency data.
          </div>
        )}
      </div>
    </div>
  );
}
