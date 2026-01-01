import { type FormEvent, useState } from 'react';

const DEMO_CREDENTIALS = {
  username: 'citizen@demo.gov',
  password: 'Citizen123!',
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
      setError('Invalid credentials for the citizen portal.');
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <header className="bg-[#1e3a8a] text-white">
        <div className="border-b border-blue-700 bg-[#1a2f6f] py-3">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <div className="text-[#1e3a8a] text-xs text-center leading-tight p-2">
                <div className="font-bold">सत्यमेव</div>
                <div className="font-bold">जयते</div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">National Voter Services Portal</h1>
              <p className="text-blue-200 text-sm mt-1">Secure Login for Citizen Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-300 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
          <p className="text-gray-600 mb-6">Enter your citizen demo credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="username">
                  Email
                </label>
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="name@example.gov"
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/40"
                  required
                />
              </div>
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
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/40"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3 text-sm text-gray-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white py-2 px-4 font-bold hover:bg-[#1e40af] transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Demo credentials</h3>
            <div className="border border-gray-200 p-3 bg-[#f8f9fa] text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Citizen</p>
              <p>Email: {DEMO_CREDENTIALS.username}</p>
              <p>Password: {DEMO_CREDENTIALS.password}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
