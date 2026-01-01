import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Header({ activeTab, setActiveTab, onLogout }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'verification', label: 'Voter Verification' },
    { id: 'flagged', label: 'Flagged Cases' },
    { id: 'livecount', label: 'Live Vote Count' },
    { id: 'epic', label: 'EPIC Issuance' },
  ];

  return (
    <header className="bg-[#003d82] text-white">
      {/* Top Header Bar */}
      <div className="border-b border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
          {/* Government Emblem Placeholder */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <div className="text-[#003d82] text-xs text-center leading-tight p-1">
              GOI<br/>Emblem
            </div>
          </div>
          
          {/* Title Section */}
          <div>
            <h1 className="text-white mb-0.5">Election Authority Dashboard</h1>
            <p className="text-white/90 text-sm">Digital Voter Verification & Monitoring System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-[#004a9f]">
        <div className="max-w-[1400px] mx-auto px-4">
          <ul className="flex flex-wrap gap-0 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`block px-4 py-3 hover:bg-[#003d82] transition-colors ${
                    activeTab === item.id ? 'border-b-2 border-[#ff9933] bg-[#003d82]' : ''
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li className="ml-auto">
              <button
                onClick={onLogout}
                className="block px-4 py-3 hover:bg-[#003d82] transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
