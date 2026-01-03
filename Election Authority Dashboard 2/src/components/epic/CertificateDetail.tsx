import React, { useEffect, useState } from 'react';
import { getIntegrityCertificate, IntegrityCertificate } from '../../services/api';
import { AlertTriangle, Download, ArrowLeft, ShieldCheck, FileText, Activity, Users, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface CertificateDetailProps {
  constituencyId: string;
  onBack: () => void;
}

export function CertificateDetail({ constituencyId, onBack }: CertificateDetailProps) {
  const [data, setData] = useState<IntegrityCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cert = await getIntegrityCertificate(constituencyId);
        setData(cert);
      } catch (err) {
        toast.error('Could not load certificate data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [constituencyId]);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>;
  if (!data) return <div className="h-full flex items-center justify-center text-red-500">Failed to load data</div>;

  const scoreColor = data.final_confidence_index >= 90 ? 'text-emerald-700' : 
                     data.final_confidence_index >= 70 ? 'text-amber-600' : 'text-rose-600';
  
  const borderColor = data.final_confidence_index >= 90 ? 'border-emerald-200' : 
                      data.final_confidence_index >= 70 ? 'border-amber-200' : 'border-rose-200';

  // Butterfly Chart Data (Mocking structure for visualization)
  const auditData = [
    { name: 'Records', value: -data.polling_consistency.total_votes_form17a, type: 'Form 17A (Voters)' },
    { name: 'Votes', value: data.polling_consistency.total_votes_form17c, type: 'Form 17C (Votes)' },
  ];

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-8 pt-20">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Certificate Paper Container */}
        <div className="bg-white shadow-2xl rounded-sm border border-slate-200 relative overflow-hidden">
            {/* Watermark Seal */}
            <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
                <ShieldCheck className="h-64 w-64" />
            </div>

            {/* Header */}
            <div className="bg-slate-900 text-white p-8 border-b-4 border-amber-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold tracking-wide">ELECTION PROCESS INTEGRITY CERTIFICATE</h1>
                        <p className="text-slate-400 mt-2 font-mono text-sm uppercase tracking-wider">
                            Ref: {data.constituency_id.toUpperCase()}-{new Date(data.generated_at).getFullYear()} | Advisory Document
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded border font-bold text-sm bg-white/10 ${
                            data.status === 'VERIFIED' ? 'text-green-400 border-green-400' : 
                            data.status === 'PROVISIONAL' ? 'text-amber-400 border-amber-400' : 'text-red-400 border-red-400'
                        }`}>
                            STATUS: {data.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Advisory Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 m-8 mb-0 flex gap-4 items-start">
                <FileText className="h-6 w-6 text-blue-700 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-900 text-sm uppercase">Legal Disclaimer</h4>
                    <p className="text-blue-800 text-sm leading-relaxed max-w-3xl">
                        This Integrity Certificate is generated <strong>prior to result declaration</strong> to verify procedural correctness. 
                        It is an algorithmic decision-support tool and <strong>does not modify vote counts</strong>. Election Authorities should use this data to identify process anomalies before certification.
                    </p>
                </div>
            </div>

            <div className="p-12 pt-8">
                {/* Hero Section: The Gauge */}
                <div className="text-center mb-16 relative">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Integrity Confidence Index</h2>
                    
                    <div className="relative inline-flex flex-col items-center justify-center">
                         {/* Simple CSS Radial Gauge Simulation */}
                         <div className={`w-48 h-48 rounded-full border-[12px] flex items-center justify-center ${
                             data.final_confidence_index >= 90 ? 'border-emerald-100 border-t-emerald-600 border-r-emerald-600' :
                             data.final_confidence_index >= 70 ? 'border-amber-100 border-t-amber-500 border-r-amber-500' :
                             'border-rose-100 border-t-rose-600 border-r-rose-600'
                         } transform -rotate-45`}>
                             <div className={`transform rotate-45 text-5xl font-serif font-black ${scoreColor}`}>
                                 {data.final_confidence_index}%
                             </div>
                         </div>
                    </div>
                    
                    {/* The Transparent Math Equation */}
                    <div className="mt-6 inline-block bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                        <code className="text-xs text-slate-600 font-mono">
                            <span className="font-bold">Formula:</span> 
                            (Roll × {data.score_breakdown.roll_risk_weight}) + 
                            (Audit × {data.score_breakdown.polling_consistency_weight}) + 
                            (Turnout × {data.score_breakdown.turnout_analytics_weight})
                        </code>
                    </div>
                </div>

                {/* The Three Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* 1. Electoral Roll Health */}
                    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h3>Roll Hygiene</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-slate-500">Hygiene Score</span>
                                <span className="text-2xl font-bold text-slate-800">{data.score_breakdown.roll_score_contribution.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.score_breakdown.roll_score_contribution}%` }} />
                            </div>
                            <ul className="text-xs space-y-2 text-slate-600 mt-4">
                                <li className="flex justify-between">
                                    <span>High Risk Voters:</span>
                                    <span className="font-mono font-bold">{data.roll_risk.high_risk_detected}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Duplicate Prob:</span>
                                    <span className="font-mono">{data.roll_risk.duplicate_probability}%</span>
                                </li>
                                <li className="px-2 py-1 bg-slate-50 rounded italic text-center text-slate-500 mt-2">
                                    "Voter registry anomalies are within {data.roll_risk.risk_level === 'Low' ? 'normal' : 'elevated'} limits."
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 2. Polling Audit (Butterfly Chart) */}
                    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                            <Scale className="h-5 w-5 text-purple-600" />
                            <h3>Polling Audit</h3>
                        </div>
                        <div className="h-32 mb-4">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={auditData} stackOffset="sign">
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip />
                                    <ReferenceLine x={0} stroke="#94a3b8" />
                                    <Bar dataKey="value" barSize={20} radius={[4, 4, 4, 4]}>
                                        {auditData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                             </ResponsiveContainer>
                             <div className="flex justify-between text-[10px] text-slate-400 text-center uppercase">
                                 <span>Form 17A (Voters)</span>
                                 <span>Form 17C (Votes)</span>
                             </div>
                        </div>
                        <ul className="text-xs space-y-2 text-slate-600">
                             <li className="flex justify-between">
                                <span>Mismatched Booths:</span>
                                <span className={`font-bold ${data.polling_consistency.mismatched_booths > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {data.polling_consistency.mismatched_booths}
                                </span>
                             </li>
                             <li className="flex justify-between">
                                <span>Total Deviation:</span>
                                <span className="font-mono">{data.polling_consistency.deviation_percentage}%</span>
                             </li>
                             <li className="px-2 py-1 bg-slate-50 rounded italic text-center text-slate-500 mt-2">
                                    "{data.polling_consistency.status === 'MATCH' ? 'Perfect procedural symmetry detected.' : 'Procedural deviations detected.'}"
                             </li>
                        </ul>
                    </div>

                    {/* 3. Turnout Stats */}
                    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                            <Activity className="h-5 w-5 text-orange-600" />
                            <h3>Turnout Stats</h3>
                        </div>
                        <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <span className="text-sm text-slate-500">Current Turnout</span>
                                <span className="text-2xl font-bold text-slate-800">{data.turnout_analytics.current_turnout}%</span>
                             </div>
                             <div className="relative pt-6 pb-2">
                                 {/* Banded Sparkline Simulation */}
                                 <div className="h-12 w-full bg-slate-50 border border-slate-100 relative rounded">
                                     {/* Reliable Band */}
                                     <div className="absolute top-2 bottom-2 left-0 right-0 bg-slate-200/50" /> 
                                     {/* Historical Line */}
                                     <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-400" />
                                     {/* Current User Marker */}
                                     <div className="absolute top-1/2 left-[70%] h-3 w-3 bg-blue-600 rounded-full transform -translate-y-1/2" />
                                 </div>
                                 <p className="text-[10px] text-center text-slate-400 mt-1">Historical Baseline vs Current</p>
                             </div>
                             <ul className="text-xs space-y-2 text-slate-600">
                                 <li className="flex justify-between">
                                     <span>Hist. Average:</span>
                                     <span className="font-mono">{data.turnout_analytics.historical_average}%</span>
                                 </li>
                                 <li className="flex justify-between">
                                     <span>Deviation:</span>
                                     <span className={`font-mono font-bold ${data.turnout_analytics.deviation_from_baseline > 5 ? 'text-red-600' : ''}`}>
                                        {data.turnout_analytics.deviation_from_baseline > 0 ? '+' : ''}
                                        {data.turnout_analytics.deviation_from_baseline}%
                                     </span>
                                 </li>
                             </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm">
                    <p>Generated via Unified Risk Engine v2.4 | {new Date().toLocaleDateString()}</p>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 border border-slate-300 rounded text-slate-600 font-medium hover:bg-slate-50 uppercase text-xs tracking-wider">
                            Mark for Review
                        </button>
                        <button className="px-6 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 flex items-center gap-2 uppercase text-xs tracking-wider shadow-lg">
                            <Download className="h-4 w-4" />
                            Download Official PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
