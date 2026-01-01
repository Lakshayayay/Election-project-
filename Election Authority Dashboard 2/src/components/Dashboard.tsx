import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getDashboardStats, type DashboardStats } from '../services/api';
import { authorityWS } from '../services/websocket';

interface ActivityItem {
  time: string;
  activity: string;
  type: 'alert' | 'info' | 'success';
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Connect WebSocket
    authorityWS.connect();

    // Event handlers
    const handleQueueUpdate = () => fetchStats(); // Refresh stats on queue update
    const handleFlagGenerated = (data: any) => {
      fetchStats();
      addActivity(`New Flag generated: ${data.reason} (${data.risk_level})`, 'alert');
      toast.error(`Risk Alert: ${data.reason}`, { description: `Risk Level: ${data.risk_level}` });
    };
    const handleAuditAlert = (data: any) => {
      addActivity(`Audit Alert: ${data.message}`, 'alert');
      toast.warning(`Audit Alert: ${data.message}`);
    };
    const handleNewRequest = (data: any) => {
      fetchStats();
      addActivity(`New Voter Request: ${data.request_type}`, 'info');
      toast.info(`New Request Received: ${data.request_type}`, { description: 'Check the Queue for details.' });
    };

    authorityWS.on('request_queue_updated', handleQueueUpdate);
    authorityWS.on('flag_generated', handleFlagGenerated);
    authorityWS.on('audit_alert_raised', handleAuditAlert);
    authorityWS.on('new_voter_request_received', handleNewRequest);

    return () => {
      authorityWS.off('request_queue_updated', handleQueueUpdate);
      authorityWS.off('flag_generated', handleFlagGenerated);
      authorityWS.off('audit_alert_raised', handleAuditAlert);
      authorityWS.off('new_voter_request_received', handleNewRequest);
      authorityWS.disconnect();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (message: string, type: 'alert' | 'info' | 'success') => {
    setActivityLog(prev => [
      {
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        activity: message,
        type
      },
      ...prev.slice(0, 4) // Keep last 5
    ]);
  };

  const statCards = [
    { 
      label: 'Total Registered Voters', 
      value: stats?.voters_registered.toLocaleString('en-IN') || '—', 
      color: 'bg-blue-50' 
    },
    { 
      label: 'Pending Requests', 
      value: stats?.pending_requests.toLocaleString('en-IN') || '—', 
      color: 'bg-green-50' 
    },
    { 
      label: 'Total Flags', 
      value: stats?.total_flags.toLocaleString('en-IN') || '—', 
      color: 'bg-orange-50' 
    },
    { 
      label: 'High Risk Alerts', 
      value: stats?.high_risk_flags.toLocaleString('en-IN') || '—', 
      color: 'bg-red-50' 
    },
  ];

  return (
    <div>
      {/* Dashboard Title */}
      <div className="mb-6 pb-4 border-b-2 border-[#003d82]">
        <h1 className="text-[#003d82] mb-1">Election Monitoring Dashboard</h1>
        <p className="text-gray-600">Real-time Voter Verification & Analytics | Last Updated: {new Date().toLocaleString('en-IN')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.color} border border-gray-300 p-4`}>
            <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
            <div className="text-gray-900 text-2xl font-bold">
              {loading ? '...' : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <section className="mb-8">
        <div className="bg-[#138808] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">System Status</h2>
        </div>
        <div className="border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">System Component</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Status</th>
                <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Last Check</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-gray-800">API Server</td>
                <td className="border border-gray-300 px-4 py-2 text-green-700">Online</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{new Date().toLocaleTimeString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-gray-800">Risk Engine</td>
                <td className="border border-gray-300 px-4 py-2 text-green-700">Operational</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{new Date().toLocaleTimeString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-gray-800">WebSocket Service</td>
                <td className="border border-gray-300 px-4 py-2 text-green-700">Connected</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{new Date().toLocaleTimeString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity Log */}
      <section className="mb-8">
        <div className="bg-[#003d82] text-white px-4 py-2.5 mb-0">
          <h2 className="text-white m-0">Recent Activity Log (Live)</h2>
        </div>
        <div className="border border-gray-300">
          {activityLog.length > 0 ? (
             <table className="w-full border-collapse">
             <thead>
               <tr className="bg-gray-100">
                 <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Time</th>
                 <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Activity</th>
                 <th className="border border-gray-300 px-4 py-2.5 text-left text-gray-800">Type</th>
               </tr>
             </thead>
             <tbody>
               {activityLog.map((item, index) => (
                 <tr key={index} className="hover:bg-gray-50">
                   <td className="border border-gray-300 px-4 py-2 text-gray-800">{item.time}</td>
                   <td className="border border-gray-300 px-4 py-2 text-gray-800">{item.activity}</td>
                   <td className="border border-gray-300 px-4 py-2">
                     <span className={`px-2 py-1 text-xs ${
                       item.type === 'alert' ? 'bg-red-100 text-red-800' :
                       item.type === 'success' ? 'bg-green-100 text-green-800' :
                       'bg-blue-100 text-blue-800'
                     }`}>
                       {item.type.toUpperCase()}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
          ) : (
            <div className="p-4 text-center text-gray-500">Waiting for real-time events...</div>
          )}
        </div>
      </section>
    </div>
  );
}
