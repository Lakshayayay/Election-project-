import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { VoterVerification } from './components/VoterVerification';
import { FlaggingPanel } from './components/FlaggingPanel';
import { LiveVoteCounting } from './components/LiveVoteCounting';
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" richColors />
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      
      <main className="max-w-[1400px] mx-auto px-4 py-6 flex-grow w-full">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'verification' && <VoterVerification />}
        {activeTab === 'flagged' && <FlaggingPanel />}
        {activeTab === 'livecount' && <LiveVoteCounting />}
        {activeTab === 'epic' && <EpicRevalidation />}
      </main>

      <Footer />
    </div>
  );
}
