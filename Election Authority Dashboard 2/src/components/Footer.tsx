import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#003d82] text-white mt-12">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="text-white mb-2 text-sm">Election Commission of India</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Nirvachan Sadan, Ashoka Road<br />
              New Delhi - 110001
            </p>
          </div>
          
          <div>
            <h3 className="text-white mb-2 text-sm">Important Links</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li><a href="#" className="hover:text-white">Voter Helpline</a></li>
              <li><a href="#" className="hover:text-white">Know Your EPIC</a></li>
              <li><a href="#" className="hover:text-white">Electoral Roll Search</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white mb-2 text-sm">Contact Information</h3>
            <p className="text-white/80 text-sm">
              Helpline: 1950<br />
              Email: complaints@eci.gov.in
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-4 text-center">
          <p className="text-white/90 text-sm mb-1">
            © {new Date().getFullYear()} Election Commission of India | All Rights Reserved
          </p>
          <p className="text-white/80 text-sm mb-1">
            <span className="text-red-300">For Official Use Only</span> | Developed under Digital India Initiative
          </p>
          <p className="text-white/70 text-xs">
            Best viewed in Chrome, Firefox, Safari, and Edge (Latest versions)
          </p>
        </div>
      </div>
    </footer>
  );
}
