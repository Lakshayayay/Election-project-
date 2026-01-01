import { FileEdit, MapPin, User, FileCheck, Bell, Download } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { submitVoterRequest } from '../services/api';

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

export function HomeTab({ onTabChange }: HomeTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitSuccess(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      const epicId = data['epic_id'] || undefined; // Extract EPIC ID if present
      const req = await submitVoterRequest(type, data, epicId);
      setSubmittedId(req.request_id);
      setSubmitSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSubmitSuccess(false);
    setSubmittedId(null);
    setError(null);
  };

  return (
    <div>
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Voter Services - Available Features</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* New Registration */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <User className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">New Voter Registration</h3>
              <p className="text-sm text-gray-700 mb-3">Register as a first-time voter if you are 18 years or above</p>
              <button 
                onClick={() => setActiveModal('new-registration')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>

        {/* Correction */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <FileEdit className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Correction in Voter Details</h3>
              <p className="text-sm text-gray-700 mb-3">Update name, date of birth, gender, or other personal information in your EPIC</p>
              <button 
                onClick={() => setActiveModal('correction')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>

        {/* Change Address */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <MapPin className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Change of Address</h3>
              <p className="text-sm text-gray-700 mb-3">Update your residential address within the same constituency or different constituency</p>
              <button 
                onClick={() => setActiveModal('address-change')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>

        {/* State Transfer */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <FileCheck className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">State Transfer Request</h3>
              <p className="text-sm text-gray-700 mb-3">Transfer your voter registration when moving to a different state</p>
              <button 
                onClick={() => setActiveModal('state-transfer')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>

        {/* Download EPIC */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <Download className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Download EPIC Card</h3>
              <p className="text-sm text-gray-700 mb-3">Download digital copy of your Electors Photo Identity Card (EPIC)</p>
              <button 
                onClick={() => setActiveModal('download-epic')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>

        {/* Deletion */}
        <div className="bg-[#f8f9fa] border border-gray-300 p-6 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white border border-gray-300 p-3">
              <Bell className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Deletion of Entry</h3>
              <p className="text-sm text-gray-700 mb-3">Request deletion of duplicate or incorrect entry in electoral roll</p>
              <button 
                onClick={() => setActiveModal('deletion')}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Apply Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-[#f8f9fa] border border-gray-300 p-6">
        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          Important Information
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#1e3a8a] font-bold mt-1">•</span>
            <span>All applications require valid identity proof (Aadhaar Card preferred)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1e3a8a] font-bold mt-1">•</span>
            <span>Processing time for changes: 5-7 working days (standard), 15-21 days during election period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1e3a8a] font-bold mt-1">•</span>
            <span>Track your application status using your Application ID or Mobile Number</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1e3a8a] font-bold mt-1">•</span>
            <span>For inter-state transfers, ensure you have address proof for the new state</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1e3a8a] font-bold mt-1">•</span>
            <span>Changes requested within 30 days of elections are subject to additional verification</span>
          </li>
        </ul>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'new-registration'}
        onClose={closeModal}
        title="New Voter Registration"
      >
{submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#f0f9ff] border-2 border-[#1e3a8a] p-6 mb-6 rounded-lg max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs px-2 py-1 font-bold">PROVISIONAL</div>
              <div className="text-[#16a34a] mb-2 flex justify-center">
                <FileCheck className="w-12 h-12" />
              </div>
              <p className="text-[#1e3a8a] font-bold text-xl mb-1">Application Submitted</p>
              <p className="text-gray-600 text-sm mb-4">Your application for new voter registration has been received.</p>
              
              <div className="bg-white border border-gray-300 p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Application Reference ID</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-lg text-gray-900">{submittedId}</span>
                </div>
              </div>
               <button 
                onClick={() => {
                  onTabChange('results');
                  closeModal();
                }}
                className="w-full bg-[#1e3a8a] text-white font-bold py-2 rounded mb-2 hover:bg-[#1e40af]"
              >
                 Track Application Status
               </button>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium underline">Close & Return to Home</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'registration')}>
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input name="name" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <input name="dob" type="date" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select name="gender" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input name="mobile" type="tel" required pattern="[0-9]{10}" className="w-full border border-gray-400 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Residential Address <span className="text-red-600">*</span>
                </label>
                <textarea name="address" required className="w-full border border-gray-400 px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    State <span className="text-red-600">*</span>
                  </label>
                  <select name="state" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option value="">-- Select State --</option>
                    <option>Delhi</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Aadhaar Number <span className="text-red-600">*</span>
                  </label>
                  <input name="aadhaar" type="text" required pattern="[0-9]{12}" className="w-full border border-gray-400 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3">
                <p className="text-xs text-gray-800">
                  <strong>Note:</strong> You must be 18 years of age or above to register as a voter.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                  {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'correction'}
        onClose={closeModal}
        title="Correction in Voter Details"
      >
{submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#f0f9ff] border-2 border-[#1e3a8a] p-6 mb-6 rounded-lg max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs px-2 py-1 font-bold">PROVISIONAL</div>
              <div className="text-[#16a34a] mb-2 flex justify-center">
                <FileCheck className="w-12 h-12" />
              </div>
              <p className="text-[#1e3a8a] font-bold text-xl mb-1">Correction Request Submitted</p>
              <p className="text-gray-600 text-sm mb-4">Your request for correction has been queued for verification.</p>
              
              <div className="bg-white border border-gray-300 p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Reference ID</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-lg text-gray-900">{submittedId}</span>
                </div>
              </div>
               <button className="w-full bg-[#1e3a8a] text-white font-bold py-2 rounded mb-2 hover:bg-[#1e40af]">
                 Track Request Status
               </button>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium underline">Close & Return to Home</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'correction')}>
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  EPIC Number <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" placeholder="Enter your EPIC number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Type of Correction <span className="text-red-600">*</span>
                </label>
                <select name="correction_type" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                  <option value="">-- Select Correction Type --</option>
                  <option>Name Correction</option>
                  <option>Date of Birth Correction</option>
                  <option>Gender Correction</option>
                  <option>Guardian Name Correction</option>
                  <option>Other</option>
                </select>
              </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Corrected Information <span className="text-red-600">*</span>
                  </label>
                  <input name="corrected_data" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
                </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Reason for Correction <span className="text-red-600">*</span>
                </label>
                <textarea name="reason" required className="w-full border border-gray-400 px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                  {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'address-change'}
        onClose={closeModal}
        title="Change of Address"
      >
{submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#f0f9ff] border-2 border-[#1e3a8a] p-6 mb-6 rounded-lg max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs px-2 py-1 font-bold">PROVISIONAL</div>
              <div className="text-[#16a34a] mb-2 flex justify-center">
                <FileCheck className="w-12 h-12" />
              </div>
              <p className="text-[#1e3a8a] font-bold text-xl mb-1">Address Change Submitted</p>
              <p className="text-gray-600 text-sm mb-4">Your request for change of address has been recorded.</p>
              
              <div className="bg-white border border-gray-300 p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Reference ID</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-lg text-gray-900">{submittedId}</span>
                </div>
              </div>
               <button className="w-full bg-[#1e3a8a] text-white font-bold py-2 rounded mb-2 hover:bg-[#1e40af]">
                 Track Request Status
               </button>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium underline">Close & Return to Home</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'transfer')}>
            {/* Note: Using 'transfer' type for both intra and inter-constituency moves for simplicity in this demo */}
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  EPIC Number <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  New Address <span className="text-red-600">*</span>
                </label>
                <textarea name="new_address" required className="w-full border border-gray-400 px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New State <span className="text-red-600">*</span>
                  </label>
                  <select name="state" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option value="">-- Select State --</option>
                    <option>Delhi</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New District <span className="text-red-600">*</span>
                  </label>
                  <select name="district" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option value="">-- Select District --</option>
                    <option>Central Delhi</option>
                    <option>South Delhi</option>
                    <option>East Delhi</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                   {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'state-transfer'}
        onClose={closeModal}
        title="State Transfer Request"
      >
{submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#f0f9ff] border-2 border-[#1e3a8a] p-6 mb-6 rounded-lg max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs px-2 py-1 font-bold">PROVISIONAL</div>
              <div className="text-[#16a34a] mb-2 flex justify-center">
                <FileCheck className="w-12 h-12" />
              </div>
              <p className="text-[#1e3a8a] font-bold text-xl mb-1">Transfer Request Submitted</p>
              <p className="text-gray-600 text-sm mb-4">Your request for state transfer has been initiated.</p>
              
              <div className="bg-white border border-gray-300 p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Reference ID</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-lg text-gray-900">{submittedId}</span>
                </div>
              </div>
               <button className="w-full bg-[#1e3a8a] text-white font-bold py-2 rounded mb-2 hover:bg-[#1e40af]">
                 Track Request Status
               </button>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium underline">Close & Return to Home</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'transfer')}>
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Current EPIC Number <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New State <span className="text-red-600">*</span>
                  </label>
                  <select name="state" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option value="">-- Select State --</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  New Address in Target State <span className="text-red-600">*</span>
                </label>
                <textarea name="new_address" required className="w-full border border-gray-400 px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                  {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'download-epic'}
        onClose={closeModal}
        title="Download EPIC Card"
      >
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#dcfce7] border border-[#16a34a] p-6 mb-4">
              <p className="text-[#16a34a] font-bold text-lg">EPIC Card Downloaded Successfully!</p>
              <p className="text-sm text-gray-700 mt-2">Check your downloads folder</p>
            </div>
             <button onClick={closeModal} className="text-[#1e3a8a] underline font-bold">Close</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'lost_card')}> 
             {/* Treating download as lost_card/re-issue for this demo to trigger backend event */}
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  EPIC Number <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" placeholder="Enter your EPIC number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mobile Number (Registered) <span className="text-red-600">*</span>
                </label>
                <input name="mobile" type="tel" required pattern="[0-9]{10}" className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                  {loading ? 'VERIFYING...' : 'VERIFY & DOWNLOAD'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'deletion'}
        onClose={closeModal}
        title="Request Deletion of Entry"
      >
{submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#f0f9ff] border-2 border-[#1e3a8a] p-6 mb-6 rounded-lg max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs px-2 py-1 font-bold">PROVISIONAL</div>
              <div className="text-[#16a34a] mb-2 flex justify-center">
                <Bell className="w-12 h-12" />
              </div>
              <p className="text-[#1e3a8a] font-bold text-xl mb-1">Deletion Request Submitted</p>
              <p className="text-gray-600 text-sm mb-4">The request to delete entry has been recorded.</p>
              
              <div className="bg-white border border-gray-300 p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Reference ID</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-lg text-gray-900">{submittedId}</span>
                </div>
              </div>
               <button className="w-full bg-[#1e3a8a] text-white font-bold py-2 rounded mb-2 hover:bg-[#1e40af]">
                 Track Request Status
               </button>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium underline">Close & Return to Home</button>
          </div>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'deletion')}>
            <div className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  EPIC Number (To be deleted) <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Reason for Deletion <span className="text-red-600">*</span>
                </label>
                <select name="reason" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                  <option value="">-- Select Reason --</option>
                  <option>Duplicate Entry</option>
                  <option>Deceased</option>
                  <option>Permanently Shifted</option>
                  <option>Wrong Entry</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50">
                  {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={closeModal} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}