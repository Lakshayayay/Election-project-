import { useState } from 'react';
import { Modal } from './Modal';

export function ElectionNotices() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const notices = [
    {
      id: 'CIRCULAR/2024/067',
      date: '28 Dec 2024',
      title: 'Lok Sabha General Elections 2025 - Schedule Announcement',
      content: 'The Election Commission of India announces the tentative schedule for General Elections to be held in April-May 2025. Detailed phase-wise schedule will be released by 15 January 2025.',
      fullContent: `The Election Commission of India hereby announces the tentative schedule for the General Elections to the Lok Sabha (House of the People) to be held in April-May 2025.

IMPORTANT DATES:
1. Announcement of final schedule: 15 January 2025
2. Filing of nominations: To be announced
3. Last date for withdrawal: To be announced
4. Polling phases: 7 phases (tentative)
5. Counting of votes: To be announced

PHASE-WISE BREAKDOWN:
The elections will be conducted in seven phases covering all 543 constituencies across India. The detailed constituency-wise schedule will be published on 15 January 2025.

ELIGIBILITY:
All Indian citizens who have attained the age of 18 years on or before the qualifying date are eligible to vote. Ensure your name appears in the electoral roll.

SPECIAL PROVISIONS:
- Absentee voters facility for service personnel
- Overseas voter registration
- Special arrangements for senior citizens and differently-abled voters

MODEL CODE OF CONDUCT:
The Model Code of Conduct will come into effect from the date of announcement of the election schedule.

For more information, visit the official Election Commission of India website or contact your local District Election Officer.`
    },
    {
      id: 'CIRCULAR/2024/066',
      date: '20 Dec 2024',
      title: 'Special Summary Revision of Electoral Rolls - December 2024',
      content: 'Special Summary Revision with reference to 1st January 2025 as qualifying date. Final Electoral Rolls will be published on 5th January 2025. Claims and objections may be filed till 31st December 2024.',
      fullContent: `SPECIAL SUMMARY REVISION OF ELECTORAL ROLLS - DECEMBER 2024

The Election Commission of India has undertaken Special Summary Revision of Electoral Rolls with reference to 1st January 2025 as the qualifying date.

QUALIFYING DATE: 1st January 2025
Persons who have attained or will attain 18 years of age on or before 1st January 2025 are eligible for inclusion in the electoral roll.

KEY DATES:
- Draft Electoral Roll publication: 15 November 2024
- Last date for filing claims and objections: 31 December 2024
- Disposal of claims and objections: By 3 January 2025
- Final Electoral Roll publication: 5 January 2025

HOW TO FILE CLAIMS AND OBJECTIONS:
1. Online: Through National Voter Services Portal (nvsp.in)
2. Offline: Submit Form 6/7/8 to Electoral Registration Officer
3. Mobile App: Voter Helpline App

FORMS:
- Form 6: For inclusion of name in electoral roll
- Form 7: For objection to inclusion/deletion of name
- Form 8: For correction of entries in electoral roll

DOCUMENTS REQUIRED:
- Recent passport-size photograph
- Age proof (Birth certificate, Passport, School certificate)
- Address proof (Aadhaar, Driving license, Passport, Utility bills)

For assistance, contact your Electoral Registration Officer or call Voter Helpline: 1950`
    },
    {
      id: 'CIRCULAR/2024/065',
      date: '15 Dec 2024',
      title: 'Awareness Program on Electronic Voting Machines (EVMs)',
      content: 'District Election Officers are directed to organize awareness programs on the functioning and security features of EVMs and VVPATs. Citizens can request demonstration at designated centers.',
      fullContent: `AWARENESS PROGRAM ON ELECTRONIC VOTING MACHINES (EVMs) AND VVPATs

The Election Commission of India is organizing awareness programs across all districts to educate voters about Electronic Voting Machines (EVMs) and Voter Verifiable Paper Audit Trail (VVPAT) systems.

OBJECTIVES:
1. Demonstrate the functioning of EVMs and VVPATs
2. Explain security features and safeguards
3. Address concerns and misconceptions
4. Build voter confidence in the electoral process

EVM FEATURES:
- Standalone machines (not connected to internet)
- Multiple security layers
- Randomization of EVMs across polling stations
- Mock polls before actual voting
- Strong room security protocols

VVPAT SYSTEM:
- Provides paper trail for verification
- Voter can see printed slip for 7 seconds
- Paper slips stored in sealed VVPAT box
- Used for verification if required

DEMONSTRATION CENTERS:
District Election Officers have designated centers where citizens can:
- Request EVM demonstrations
- Understand the voting process
- Clear their doubts
- Participate in mock voting

SCHEDULE:
Demonstrations will be held at district headquarters and major towns every Saturday and Sunday from 10 AM to 5 PM.

TO REQUEST A DEMONSTRATION:
Contact your District Election Officer or visit the nearest designated center. Educational institutions and organizations can request group demonstrations.

For more information: www.eci.gov.in`
    },
    {
      id: 'CIRCULAR/2024/064',
      date: '10 Dec 2024',
      title: 'Overseas Voter Registration - Guidelines Updated',
      content: 'New guidelines for Indian citizens residing abroad to register as overseas voters. Online registration facility available through the National Voter Services Portal. Deadline: 31 January 2025.',
      fullContent: `OVERSEAS VOTER REGISTRATION - UPDATED GUIDELINES 2024

The Election Commission of India has updated guidelines for registration of Indian citizens residing abroad as overseas electors.

ELIGIBILITY:
Indian citizens who:
1. Are ordinarily resident outside India
2. Have not acquired citizenship of another country
3. Hold a valid Indian passport
4. Are 18 years or above on qualifying date

REGISTRATION PROCESS:
1. Visit National Voter Services Portal (nvsp.in)
2. Fill Form 6A (Overseas Elector Registration)
3. Upload required documents
4. Submit application online

REQUIRED DOCUMENTS:
1. Copy of Indian passport
2. Recent passport-size photograph
3. Self-declaration as per prescribed format
4. Address proof of current residence abroad (optional)

IMPORTANT NOTES:
- Overseas electors cannot vote by postal ballot or proxy
- Must visit assigned polling station in India to vote
- Name will appear in electoral roll of constituency where they would be ordinarily resident but for their being abroad
- Registration is valid until elector informs change of particulars

DEADLINE FOR REGISTRATION:
31 January 2025 (for inclusion in electoral roll with qualifying date 1 April 2025)

VOTING FACILITY:
Overseas electors can vote in:
- Lok Sabha (General) Elections
- Assembly (Vidhan Sabha) Elections
- By-elections

ASSISTANCE:
For queries, contact:
- Email: overseas@eci.gov.in
- Helpline: 1950 (within India)
- Respective Indian Embassy/High Commission

The Election Commission is committed to facilitating participation of all eligible Indian citizens in the democratic process.`
    }
  ];

  return (
    <section className="mb-12">
      <div className="border-b-2 border-[#1e3a8a] pb-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Election Updates & Notices</h2>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-[#f8f9fa] border border-gray-300 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-600 font-bold">{notice.id}</p>
                <h3 className="font-bold text-gray-900 mt-1">{notice.title}</h3>
              </div>
              <span className="bg-white border border-gray-400 px-3 py-1 text-xs font-bold text-gray-700 whitespace-nowrap ml-4">
                {notice.date}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {notice.content}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-300">
              <button 
                onClick={() => setActiveModal(notice.id)}
                className="text-sm text-[#1e3a8a] font-bold hover:underline"
              >
                Read Full Circular →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a href="#" className="text-[#1e3a8a] font-bold hover:underline">
          View All Notices & Circulars →
        </a>
      </div>

      {/* Modals for each notice */}
      {notices.map((notice) => (
        <Modal
          key={`modal-${notice.id}`}
          isOpen={activeModal === notice.id}
          onClose={() => setActiveModal(null)}
          title={notice.title}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
              <p className="text-xs text-gray-600 font-bold">Circular No: {notice.id}</p>
              <p className="text-xs text-gray-600 font-bold">Date: {notice.date}</p>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-300 p-6">
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {notice.fullContent}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <button className="bg-white text-gray-700 px-6 py-2 font-bold border-2 border-gray-400 hover:bg-gray-50 transition-colors">
                DOWNLOAD PDF
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-[#1e3a8a] text-white px-6 py-2 font-bold hover:bg-[#1e40af] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </Modal>
      ))}
    </section>
  );
}