import { type FormEvent, useState } from 'react';

const DEMO_CREDENTIALS = {
  username: 'authority@eci.gov',
  password: 'Authority123!',
};

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (username !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
      setError('Invalid credentials for the authority portal.');
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans">
      {/* Official Header */}
      <header className="bg-[#003d82] text-white shadow-md z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <div className="text-[#003d82] text-[10px] text-center leading-tight p-1 font-bold">
              सत्यमेव<br/>जयते
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-xl font-semibold tracking-wide">Election Authority Dashboard</h1>
            <p className="text-blue-100 text-sm font-medium">Digital Voter Verification & Monitoring System</p>
          </div>
        </div>
        <div className="bg-[#004a9f] h-2 w-full"></div>
      </header>

      {/* Main Content Area - Layout Matched to Citizen Portal (max-w-3xl) */}
      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-grow">
        <div className="bg-white border border-gray-300 shadow-sm p-8">
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
          <p className="text-gray-600 mb-6">Enter your authority demo credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="username">
                  Official Email ID
                </label>
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="name@example.gov"
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003d82]/40"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003d82]/40"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 text-sm text-gray-800">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#003d82] text-white py-2 px-4 font-bold hover:bg-[#002a5c] transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Demo credentials</h3>
            <div className="border border-gray-200 p-3 bg-[#f8f9fa] text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Election Official</p>
              <div className="mt-1">
                <p>Email: {DEMO_CREDENTIALS.username}</p>
                <p>Password: {DEMO_CREDENTIALS.password}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003d82] text-white mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs opacity-80 gap-2">
           <p>© {new Date().getFullYear()} Election Commission of India</p>
           <p>Developed under Digital India Initiative</p>
        </div>
      </footer>
    </div>
  );
}


