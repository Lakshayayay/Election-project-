import { Check, Circle, Clock } from 'lucide-react';

export function ApplicationStatus() {
  const steps = [
    { name: 'Application Submitted', status: 'completed', date: '15 Dec 2024' },
    { name: 'Document Verification', status: 'completed', date: '18 Dec 2024' },
    { name: 'Database Re-Check', status: 'current', date: 'In Progress' },
    { name: 'Approved / Rejected', status: 'pending', date: 'Pending' }
  ];

  return (
    <section className="mb-12">
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">EPIC ID Application & Verification Status</h2>
      </div>

      <div className="bg-[#f8f9fa] border border-gray-300 p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-700"><strong>Application ID:</strong> EPIC/2024/DL/123456789</p>
          <p className="text-sm text-gray-700 mt-1"><strong>Applicant Name:</strong> Rajesh Kumar Sharma</p>
        </div>

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' ? (
                  <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold ${step.status === 'current' ? 'text-[#f59e0b]' : 'text-gray-900'}`}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.date}</p>
                  </div>
                  {step.status === 'completed' && (
                    <span className="bg-[#dcfce7] text-[#16a34a] px-3 py-1 text-xs font-bold border border-[#16a34a]">
                      COMPLETED
                    </span>
                  )}
                  {step.status === 'current' && (
                    <span className="bg-[#fef3c7] text-[#f59e0b] px-3 py-1 text-xs font-bold border border-[#f59e0b]">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-700">
            <strong>Expected Completion:</strong> 5-7 working days from submission
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Track Status:</strong> You will receive SMS updates on your registered mobile number
          </p>
        </div>
      </div>
    </section>
  );
}
