import React, { useState } from 'react';
import { IntegrityMap } from './IntegrityMap';
import { CertificateDetail } from './CertificateDetail';
import { Shield, ChevronRight, Activity, Map as MapIcon } from 'lucide-react';

export type ViewMode = 'MAP' | 'CERTIFICATE';
export type ConstituencyData = {
  id: string;
  name: string;
  score: number;
  status: 'VERIFIED' | 'PROVISIONAL' | 'FLAGGED';
};

export function EpicDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('MAP');
  const [selectedConstituency, setSelectedConstituency] = useState<string | null>(null);

  const handleSelectConstituency = (id: string) => {
    setSelectedConstituency(id);
    setViewMode('CERTIFICATE');
  };

  const handleBackToMap = () => {
    setViewMode('MAP');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative h-full">
        
        {/* Breadcrumb / Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 px-8 py-4 pointer-events-none">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-4 py-2 rounded-full pointer-events-auto">
            <button 
              onClick={handleBackToMap}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'MAP' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              National Overview
            </button>
            {selectedConstituency && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className={`text-sm font-medium ${
                  viewMode === 'CERTIFICATE' ? 'text-blue-700' : 'text-slate-500'
                }`}>
                  {selectedConstituency}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Views */}
        <div className="h-full w-full transition-all duration-500">
          {viewMode === 'MAP' ? (
             <IntegrityMap onSelect={handleSelectConstituency} />
          ) : (
             <CertificateDetail constituencyId={selectedConstituency!} onBack={handleBackToMap} />
          )}
        </div>

      </main>
    </div>
  );
}
