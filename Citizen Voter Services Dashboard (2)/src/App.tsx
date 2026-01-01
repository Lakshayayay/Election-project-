import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomeTab } from './components/HomeTab';
import { MyEpicIdTab } from './components/MyEpicIdTab';
import { ElectionsTab } from './components/ElectionsTab';
import { ResultsTab } from './components/ResultsTab';
import { ProfileUpdateTab } from './components/ProfileUpdateTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('citizen_token') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('citizen_token', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('citizen_token');
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white">
        <div className="border-b border-blue-700 bg-[#1a2f6f] py-2">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="text-[#1e3a8a] text-xs text-center leading-tight p-2">
                  <div className="font-bold">सत्यमेव</div>
                  <div className="font-bold">जयते</div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">National Voter Services Portal</h1>
                <p className="text-blue-200 text-sm mt-1">Official Digital Electoral Services</p>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="bg-[#1e3a8a]">
          <div className="max-w-7xl mx-auto px-6">
            <ul className="flex gap-8 py-3 border-b border-blue-700">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`${
                    activeTab === 'home'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('epic')}
                  className={`${
                    activeTab === 'epic'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  My EPIC ID
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('elections')}
                  className={`${
                    activeTab === 'elections'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  Elections
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`${
                    activeTab === 'results'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  Profile Updates
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`${
                    activeTab === 'help'
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-blue-200 hover:text-white'
                  } transition-colors`}
                >
                  Help
                </button>
              </li>
              <li className="ml-auto">
                <button
                  onClick={handleLogout}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Notice */}
        <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-4 mb-8">
          <p className="text-gray-800">
            <strong>Notice:</strong> This is the official portal for voter services in India. 
            Please ensure all information provided is accurate and up-to-date.
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && <HomeTab onTabChange={setActiveTab} />}
        {activeTab === 'epic' && <MyEpicIdTab />}
        {activeTab === 'elections' && <ElectionsTab />}
        {activeTab === 'results' && <ResultsTab />}
        {activeTab === 'profile' && <ProfileUpdateTab />}
        {activeTab === 'help' && (
          <div className="bg-[#f8f9fa] border border-gray-300 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Help & Support</h2>
            <p className="text-gray-700">For assistance, please call Voter Helpline: 1950</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f4f6] border-t-2 border-[#1e3a8a] mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <div>
              <p className="font-bold">© Government of India</p>
              <p className="mt-1">Official Secure Portal</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-[#1e3a8a]">Voter Helpline: 1950</p>
              <p className="mt-1 text-xs">Available 24x7</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center">
            <p>Best viewed in Chrome, Firefox, Safari or Edge browsers | Screen Resolution 1024x768 or above</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
