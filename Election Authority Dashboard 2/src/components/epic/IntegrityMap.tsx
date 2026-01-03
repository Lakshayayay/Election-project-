import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface IntegrityMapProps {
  onSelect: (id: string) => void;
}

// Mock Data for the Map View
const REGIONS = [
  { id: 'New Delhi', score: 69, risk: 'HIGH', status: 'PROVISIONAL' },
  { id: 'Mumbai South', score: 88, risk: 'LOW', status: 'VERIFIED' },
  { id: 'Varanasi', score: 92, risk: 'LOW', status: 'VERIFIED' },
  { id: 'Bangalore North', score: 76, risk: 'MEDIUM', status: 'PROVISIONAL' },
  { id: 'Kolkata South', score: 55, risk: 'CRITICAL', status: 'FLAGGED' },
  { id: 'Chennai Central', score: 85, risk: 'LOW', status: 'VERIFIED' },
];

export function IntegrityMap({ onSelect }: IntegrityMapProps) {
  return (
    <div className="h-full w-full bg-slate-100 p-8 pt-20 overflow-y-auto">
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-slate-800 font-bold">National Integrity Monitor</h2>
          <p className="text-slate-500">Real-time procedural assurance status across key constituencies.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Constituencies" value="543" sub="Active Monitoring" />
          <StatCard label="Process Verified" value="82%" sub="High Confidence" color="text-green-600" />
          <StatCard label="Provisional" value="15%" sub="Minor Deviations" color="text-amber-600" />
          <StatCard label="Flagged for Review" value="3%" sub="Critical Anomalies" color="text-rose-600" />
        </div>

        {/* Map Simulation (Grid View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => onSelect(region.id)}
              className="group relative bg-white rounded-xl border border-slate-200 p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${
                region.score >= 90 ? 'bg-emerald-500' :
                region.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`} />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {region.id}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">ID: {region.id.substring(0,3).toUpperCase()}-2024</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                   region.score >= 90 ? 'bg-emerald-50 text-emerald-700' :
                   region.score >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {region.score}%
                </div>
              </div>

              {/* Mini Metrics */}
              <div className="space-y-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      region.score >= 90 ? 'bg-emerald-500' :
                      region.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${region.score}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Roll Health</span>
                  <span>Polling Audit</span>
                  <span>Turnout</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`text-xs font-semibold ${
                   region.status === 'VERIFIED' ? 'text-emerald-600' :
                   region.status === 'PROVISIONAL' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {region.status}
                </span>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">View Certificate →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-slate-900" }: { label: string, value: string, sub: string, color?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-serif font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
