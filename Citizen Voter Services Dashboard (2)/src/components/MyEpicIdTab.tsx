import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Modal } from './Modal';
import { getVoterByEpic, trackEpicStatus } from '../services/api';
import { wsService } from '../services/websocket';
import type { VoterRecord, VoterRequest } from '../services/api';

export function MyEpicIdTab() {
  const [securityCode, setSecurityCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [voterDetails, setVoterDetails] = useState<VoterRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackStatusData, setTrackStatusData] = useState<VoterRequest | null>(null);
  const [latestRequest, setLatestRequest] = useState<VoterRequest | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect();
    const offStatus = wsService.onRequestStatusUpdate((request) => {
      setTrackStatusData((prev) => (prev && prev.request_id === request.request_id ? request : prev));
      setLatestRequest((prev) => (prev && prev.request_id === request.request_id ? request : prev));
    });
    return () => {
      offStatus();
      wsService.disconnect();
    };
  }, []);

  const handleRegistrationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get('name') as string,
      guardian_name: formData.get('guardian_name') as string,
      relation: formData.get('relation') as string,
      gender: formData.get('gender') as string,
      age: formData.get('age') as string,
      dob: formData.get('dob') as string,
      address: formData.get('address') as string,
      constituency: formData.get('constituency') as string,
      assembly_constituency: formData.get('assembly_constituency') as string,
      polling_station: formData.get('polling_station') as string,
      part_no: formData.get('part_no') as string,
      serial_no: formData.get('serial_no') as string,
      state: formData.get('state') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
    };

    setLoading(true);
    setError(null);
    setApplicationSuccess(null);

    wsService.submitVoterRequest(
      'registration',
      payload,
      undefined,
      (request) => {
        setLatestRequest(request);
        setTrackStatusData(request);
        setApplicationSuccess('Application submitted successfully. Track status below.');
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  };

  const handleRefreshStatus = async (requestId?: string) => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const req = await trackEpicStatus(requestId);
      setTrackStatusData(req);
      setLatestRequest(req);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh status');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // For demo: use securityCode as EPIC ID (in real system, would validate security code separately)
      const voter = await getVoterByEpic(securityCode);
      setVoterDetails(voter);
      setIsValidated(true);
      setIsInvalid(false);
    } catch (err: any) {
      setIsValidated(false);
      setIsInvalid(true);
      setError(err.message || 'Invalid security code or EPIC not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setLoading(true);
    setError(null);

    const modalType = activeModal;
    
    try {
      if (modalType === 'lost-epic') {
        const requestData = {
          epic_id: formData.get('epic_id') as string,
          mobile: formData.get('mobile') as string,
          dob: formData.get('dob') as string,
          reason: formData.get('reason') as string,
          additional_details: formData.get('additional_details') as string,
        };

        wsService.submitVoterRequest(
          'lost_card',
          requestData,
          requestData.epic_id,
          (request) => {
            setLatestRequest(request);
            setSubmitSuccess(true);
            setLoading(false);
            setTimeout(() => {
              setActiveModal(null);
              setSubmitSuccess(false);
            }, 2000);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );
      } else if (modalType === 'check-status') {
        const searchBy = formData.get('search_by') as string;
        const searchValue = formData.get('search_value') as string;
        const dob = formData.get('dob') as string;

        let request: VoterRequest;
        if (searchBy === 'Application ID') {
          request = await trackEpicStatus(searchValue);
        } else if (searchBy === 'EPIC Number') {
          request = await trackEpicStatus(undefined, searchValue);
        } else {
          request = await trackEpicStatus(undefined, undefined, searchValue);
        }

        setTrackStatusData(request);
        setLatestRequest(request);
        setSubmitSuccess(true);
        setLoading(false);
      } else {
        // EPIC history - similar handling
        setSubmitSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setActiveModal(null);
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">My EPIC ID - Verification & Details</h2>
      </div>

      {/* EPIC Application & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#f8f9fa] border border-gray-300 p-6">
          <h3 className="font-bold text-gray-900 mb-3">Apply for a New EPIC ID</h3>
          <p className="text-sm text-gray-700 mb-4">Submit your details to request a new EPIC. You will see the live status and issued EPIC number once approved by authorities.</p>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegistrationSubmit}>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input name="name" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Guardian's Name</label>
              <input name="guardian_name" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Father / Mother / Spouse" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Relation</label>
              <input name="relation" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="S/O, D/O, W/O" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
              <select name="gender" required className="w-full border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
              <input name="age" type="number" min="18" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="18+" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
              <input name="dob" type="date" required className="w-full border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Residential Address</label>
              <textarea name="address" required className="w-full border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="House No, Street, Locality, City"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Parliamentary Constituency</label>
              <input name="constituency" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., New Delhi" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Assembly Constituency</label>
              <input name="assembly_constituency" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="(Optional)" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Polling Station</label>
              <input name="polling_station" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Booth name/number" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Part Number</label>
              <input name="part_no" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Part No" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number</label>
              <input name="serial_no" className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Serial No" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
              <input name="state" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., Delhi" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
              <input name="mobile" type="tel" pattern="[0-9]{10}" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="10-digit mobile" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input name="email" type="email" required className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="name@example.com" />
            </div>
            {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
            {applicationSuccess && <p className="text-[#16a34a] text-sm font-semibold md:col-span-2">{applicationSuccess}</p>}
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
              <p className="text-xs text-gray-600">
                You'll receive updates for every stage (Pending → Under Review → Approved/Rejected).
              </p>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Application Status</h3>
              <p className="text-sm text-gray-700">Live updates from the Authority Dashboard</p>
            </div>
            <button
              onClick={() => handleRefreshStatus(latestRequest?.request_id)}
              className="text-sm text-[#1e3a8a] font-bold hover:underline disabled:opacity-50"
              disabled={!latestRequest || loading}
            >
              Refresh
            </button>
          </div>

          {latestRequest ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                <div>
                  <p className="font-bold text-gray-900">Application ID</p>
                  <p className="text-gray-700 break-all">{latestRequest.request_id}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Request Type</p>
                  <p className="text-gray-700 capitalize">{latestRequest.request_type}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Status</p>
                  <p className="text-gray-700">{latestRequest.status}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Risk</p>
                  <p className="text-gray-700">{latestRequest.risk_score}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-bold text-gray-900">Last Updated</p>
                  <p className="text-gray-700">{new Date(latestRequest.updated_at).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-[#f8f9fa] border border-gray-200 p-3">
                <p className="text-xs text-gray-700">
                  {latestRequest.risk_explanation || 'Awaiting review by the Election Authority.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                {['Pending', 'Under Review', 'Approved', 'Rejected'].map((step) => {
                  const isActive = latestRequest.status === step;
                  const reached =
                    step === 'Pending' ||
                    (step === 'Under Review' && ['Under Review', 'Approved', 'Rejected'].includes(latestRequest.status)) ||
                    (step === 'Approved' && latestRequest.status === 'Approved') ||
                    (step === 'Rejected' && latestRequest.status === 'Rejected');
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                          reached ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-gray-500 border-gray-300'
                        }`}
                      >
                        {step[0]}
                      </span>
                      <span className={`${isActive ? 'text-[#1e3a8a]' : 'text-gray-600'}`}>{step}</span>
                      {step !== 'Rejected' && <span className="text-gray-300">—</span>}
                    </div>
                  );
                })}
              </div>

              {latestRequest.epic_id && latestRequest.status === 'Approved' && (
                <div className="bg-[#dcfce7] border border-[#16a34a] p-3">
                  <p className="text-[#14532d] font-bold">EPIC Issued: {latestRequest.epic_id}</p>
                  <p className="text-sm text-[#14532d]">Download will be available after identity verification.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-700 bg-[#f8f9fa] border border-dashed border-gray-300 p-4">
              Submit an application to see live status here. You can also use "Check Application Status" below to fetch an existing ID.
            </div>
          )}
        </div>
      </div>

      {/* Security Code Verification Section */}
      <div className="bg-[#f8f9fa] border border-gray-300 p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Enter Security Code to View Details</h3>
        <p className="text-sm text-gray-700 mb-4">
          Please enter the security code printed on the back of your EPIC card to verify and view your voter details.
        </p>

        <form onSubmit={handleValidate} className="max-w-2xl">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Security Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => {
                  setSecurityCode(e.target.value);
                  setIsInvalid(false);
                }}
                className="w-full border border-gray-400 px-4 py-2 text-sm uppercase"
                placeholder="Enter security code (e.g., EPIC123456)"
                maxLength={20}
              />
              {isInvalid && (
                <p className="text-red-600 text-sm mt-2">
                  Invalid security code. Please check and try again.
                </p>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                {loading ? 'VALIDATING...' : 'VALIDATE'}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </form>

        <div className="mt-4 bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3">
          <p className="text-xs text-gray-800">
            <strong>Note:</strong> For demo purposes, use security code: <strong>EPIC123456</strong>
          </p>
        </div>
      </div>

      {/* Voter Details Section - Only shown after validation */}
      {isValidated && voterDetails && (
        <div className="bg-[#f8f9fa] border border-gray-300 p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Voter Details</h3>
            <span className="bg-[#dcfce7] text-[#16a34a] px-4 py-1 text-xs font-bold border border-[#16a34a]">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Personal Details */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                Personal Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-bold">EPIC Number</p>
                  <p className="text-sm text-gray-900 font-bold">{voterDetails.epic_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Name</p>
                  <p className="text-sm text-gray-900">{voterDetails.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Guardian's Name</p>
                  <p className="text-sm text-gray-900">{voterDetails.guardian_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Relation</p>
                  <p className="text-sm text-gray-900">{voterDetails.relation || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Gender</p>
                    <p className="text-sm text-gray-900">{voterDetails.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Age</p>
                    <p className="text-sm text-gray-900">{voterDetails.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Date of Birth</p>
                    <p className="text-sm text-gray-900">{voterDetails.dob}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Electoral Details */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                Electoral Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-bold">Address</p>
                  <p className="text-sm text-gray-900">{voterDetails.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Parliamentary Constituency</p>
                  <p className="text-sm text-gray-900">{voterDetails.constituency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Assembly Constituency</p>
                  <p className="text-sm text-gray-900">{voterDetails.assembly_constituency || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold">Polling Station</p>
                  <p className="text-sm text-gray-900">{voterDetails.polling_station || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Part Number</p>
                    <p className="text-sm text-gray-900">{voterDetails.part_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Serial Number</p>
                    <p className="text-sm text-gray-900">{voterDetails.serial_no || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-300 flex gap-4">
            <button 
              onClick={() => {
                if (voterDetails.epic_id) {
                  wsService.downloadEpic(voterDetails.epic_id, securityCode, (data) => {
                    // In real app, trigger download
                    window.open(data.download_url, '_blank');
                  });
                }
              }}
              className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors"
            >
              DOWNLOAD EPIC CARD
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors">
              PRINT DETAILS
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors">
              REQUEST CORRECTION
            </button>
          </div>
        </div>
      )}

      {/* Additional Services */}
      <div className="mt-8 bg-[#f8f9fa] border border-gray-300 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Other EPIC Services</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveModal('check-status')}
            className="text-center p-4 border border-gray-300 bg-white hover:border-[#1e3a8a] transition-colors"
          >
            <p className="text-sm font-bold text-gray-900 mb-1">Check Application Status</p>
            <p className="text-xs text-gray-600">Track your EPIC application</p>
          </button>
          <button 
            onClick={() => setActiveModal('lost-epic')}
            className="text-center p-4 border border-gray-300 bg-white hover:border-[#1e3a8a] transition-colors"
          >
            <p className="text-sm font-bold text-gray-900 mb-1">Lost EPIC Card</p>
            <p className="text-xs text-gray-600">Request duplicate card</p>
          </button>
          <button 
            onClick={() => setActiveModal('epic-history')}
            className="text-center p-4 border border-gray-300 bg-white hover:border-[#1e3a8a] transition-colors"
          >
            <p className="text-sm font-bold text-gray-900 mb-1">EPIC Card History</p>
            <p className="text-xs text-gray-600">View previous records</p>
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'check-status'}
        onClose={() => setActiveModal(null)}
        title="Check Application Status"
      >
        {submitSuccess && trackStatusData ? (
          <div className="text-center py-8">
            <div className="bg-[#dcfce7] border border-[#16a34a] p-6 mb-4">
              <p className="text-[#16a34a] font-bold text-lg">Application Status Found!</p>
              <div className="mt-4 text-left">
                <p className="text-sm text-gray-700"><strong>Application ID:</strong> {trackStatusData.request_id}</p>
                <p className="text-sm text-gray-700 mt-2"><strong>Status:</strong> {trackStatusData.status}</p>
                <p className="text-sm text-gray-700 mt-2"><strong>Submitted On:</strong> {new Date(trackStatusData.submitted_at).toLocaleDateString('en-IN')}</p>
                <p className="text-sm text-gray-700 mt-2"><strong>Request Type:</strong> {trackStatusData.request_type}</p>
                {trackStatusData.risk_explanation && (
                  <p className="text-sm text-gray-700 mt-2"><strong>Risk Level:</strong> {trackStatusData.risk_score}</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveModal(null);
                setSubmitSuccess(false);
                setTrackStatusData(null);
              }}
              className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af]"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Search By <span className="text-red-600">*</span>
                </label>
                <select name="search_by" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                  <option value="">-- Select Search Method --</option>
                  <option>Application ID</option>
                  <option>Mobile Number</option>
                  <option>EPIC Number</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Enter Details <span className="text-red-600">*</span>
                </label>
                <input name="search_value" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" placeholder="Enter application ID, mobile number, or EPIC number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input type="date" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3">
                <p className="text-xs text-gray-800">
                  <strong>Note:</strong> SMS updates are sent to registered mobile number at each stage.
                </p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'CHECKING...' : 'CHECK STATUS'}
                </button>
                <button type="button" onClick={() => setActiveModal(null)} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'lost-epic'}
        onClose={() => setActiveModal(null)}
        title="Request Duplicate EPIC Card"
      >
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="bg-[#dcfce7] border border-[#16a34a] p-6 mb-4">
              <p className="text-[#16a34a] font-bold text-lg">Request Submitted Successfully!</p>
              <p className="text-sm text-gray-700 mt-2">Your request has been submitted and will be processed.</p>
              <p className="text-sm text-gray-700 mt-2">Duplicate card will be sent to your registered address within 15-20 working days.</p>
            </div>
            <button 
              onClick={() => {
                setActiveModal(null);
                setSubmitSuccess(false);
              }}
              className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af]"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Current EPIC Number <span className="text-red-600">*</span>
                </label>
                <input name="epic_id" type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" placeholder="Enter your lost EPIC number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mobile Number (Registered) <span className="text-red-600">*</span>
                </label>
                <input name="mobile" type="tel" required pattern="[0-9]{10}" className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input name="dob" type="date" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Reason for Duplicate <span className="text-red-600">*</span>
                </label>
                <select name="reason" required className="w-full border border-gray-400 px-3 py-2 text-sm">
                  <option value="">-- Select Reason --</option>
                  <option>Lost</option>
                  <option>Damaged</option>
                  <option>Stolen</option>
                  <option>Mutilated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea name="additional_details" className="w-full border border-gray-400 px-3 py-2 text-sm" rows={3} placeholder="Provide any additional information about the loss"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Upload ID Proof <span className="text-red-600">*</span>
                </label>
                <input type="file" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
                <p className="text-xs text-gray-600 mt-1">Upload Aadhaar, Passport, or Driving License</p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3">
                <p className="text-xs text-gray-800">
                  <strong>Important:</strong> A duplicate card fee may apply. The new card will be delivered to your registered address.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={() => setActiveModal(null)} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'epic-history'}
        onClose={() => setActiveModal(null)}
        title="EPIC Card History"
      >
        {submitSuccess ? (
          <div className="space-y-4">
            <div className="bg-[#f8f9fa] border border-gray-300 p-4">
              <h4 className="font-bold text-gray-900 mb-3">EPIC Card Records</h4>
              <div className="space-y-3">
                <div className="border-b border-gray-300 pb-3">
                  <p className="text-sm font-bold text-gray-900">Current Card</p>
                  <p className="text-xs text-gray-600 mt-1">EPIC No: DLU1234567890</p>
                  <p className="text-xs text-gray-600">Issued: 15 Jan 2022</p>
                  <p className="text-xs text-gray-600">Status: <span className="text-[#16a34a] font-bold">Active</span></p>
                </div>
                <div className="border-b border-gray-300 pb-3">
                  <p className="text-sm font-bold text-gray-900">Previous Card (Duplicate)</p>
                  <p className="text-xs text-gray-600 mt-1">EPIC No: DLU1234567890</p>
                  <p className="text-xs text-gray-600">Issued: 10 Aug 2019</p>
                  <p className="text-xs text-gray-600">Status: <span className="text-gray-500">Replaced</span></p>
                  <p className="text-xs text-gray-600">Reason: Lost</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Original Card</p>
                  <p className="text-xs text-gray-600 mt-1">EPIC No: DLU1234567890</p>
                  <p className="text-xs text-gray-600">Issued: 20 Mar 2015</p>
                  <p className="text-xs text-gray-600">Status: <span className="text-gray-500">Replaced</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setActiveModal(null)} 
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af]"
              >
                CLOSE
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  EPIC Number <span className="text-red-600">*</span>
                </label>
                <input type="text" required className="w-full border border-gray-400 px-3 py-2 text-sm" placeholder="Enter your EPIC number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input type="date" required className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mobile Number (Registered) <span className="text-red-600">*</span>
                </label>
                <input type="tel" required pattern="[0-9]{10}" className="w-full border border-gray-400 px-3 py-2 text-sm" />
              </div>
              <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-3">
                <p className="text-xs text-gray-800">
                  <strong>Note:</strong> This will show all EPIC cards issued to you including original, duplicate, and corrected cards.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af]">
                  VIEW HISTORY
                </button>
                <button type="button" onClick={() => setActiveModal(null)} className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400">
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
