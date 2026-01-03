import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { VoterVerification } from './components/VoterVerification';
import { FlaggingPanel } from './components/FlaggingPanel';
// import { IntegrityCertificate } from './components/IntegrityCertificate'; // Replaced by EpicDashboard
import { EpicDashboard } from './components/epic/EpicDashboard';
import { EpicRevalidation } from './components/EpicRevalidation';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authority_token') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('authority_token', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authority_token');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  // Full screen mode for EPIC Dashboard
  const isEpicMode = activeTab === 'certificate';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" richColors />
      
      {/* Hide standard header in EPIC Mode for immersive feel, or keep it? 
          The EpicDashboard has its own internal header. Let's hide the global header in EPIC mode. 
      */}
      {!isEpicMode && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
      )}

      {/* For EPIC mode, we want full width. For others, valid max-width. */}
      {isEpicMode ? (
        <div className="flex-grow w-full h-screen">
          {/* We need a way to navigate BACK from EPIC mode if we hide the header. 
              EpicDashboard needs a "Close" or "Exit" button if it takes over.
              Or simpler: Render standard header but reset container. 
              Let's keep standard header for navigation consistency but remove max-w.
          */}
           <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
           <EpicDashboard /> 
        </div>
      ) : (
        <main className="max-w-[1400px] mx-auto px-4 py-6 flex-grow w-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'verification' && <VoterVerification />}
          {activeTab === 'flagged' && <FlaggingPanel />}
          {activeTab === 'epic' && <EpicRevalidation />}
        </main>
      )}

      {!isEpicMode && <Footer />}
    </div>
  );
}
