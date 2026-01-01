export function ProfileServices() {
  return (
    <section className="mb-12">
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile & Mobility Services</h2>
      </div>

      <div className="bg-[#f8f9fa] border border-gray-300 p-6">
        <form>
          <div className="space-y-6">
            {/* Address Change */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                Address Change Request
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Current Address
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                    value="123, MG Road, New Delhi - 110001"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-400 px-3 py-2 text-sm"
                    placeholder="Enter new address"
                  />
                </div>
              </div>
            </div>

            {/* Constituency Update */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                Constituency Update
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Current Constituency
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                    value="New Delhi (Constituency No. 3)"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New Constituency
                  </label>
                  <select className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option>-- Select Constituency --</option>
                    <option>Chandni Chowk (Constituency No. 1)</option>
                    <option>North East Delhi (Constituency No. 2)</option>
                    <option>East Delhi (Constituency No. 4)</option>
                    <option>South Delhi (Constituency No. 5)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* State Change Request */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                State Change Request
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Current State
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                    value="Delhi"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    New State
                  </label>
                  <select className="w-full border border-gray-400 px-3 py-2 text-sm">
                    <option>-- Select State --</option>
                    <option>Andhra Pradesh</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] p-4">
              <p className="text-sm text-gray-800">
                <strong>⚠ Important Notice:</strong> State changes within 30 days of election are subject to additional verification. 
                Processing time may extend to 15-21 working days during this period.
              </p>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Required Documents for Verification</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Address Proof (Aadhaar Card / Passport / Driving License)</li>
                <li>Recent Passport Size Photograph</li>
                <li>Previous EPIC ID (if applicable)</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-300">
              <button
                type="submit"
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors"
              >
                SUBMIT REQUEST
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors"
              >
                RESET FORM
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
