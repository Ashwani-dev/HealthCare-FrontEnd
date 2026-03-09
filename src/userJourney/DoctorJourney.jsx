import React from 'react';

const DoctorJourney = () => {
  const steps = [
    {
      id: 'D1',
      title: 'Join Our Platform: Sign Up & Build Your Profile',
      narrative: 'Create your professional account and showcase your credentials to connect with patients seeking your expertise.',
      flows: [
        { step: 1, view: 'Create Account', note: 'Fill in your name, email, specialization, and password. Click "Register as Doctor" to get started.' },
        { step: 2, view: 'Sign In', note: 'Use your email and password to log in. Forgot your password? Use the reset link anytime.' },
        { step: 3, view: 'Complete Profile', note: 'Add your bio, experience, license number, and credentials. We\'ll validate your information to ensure patient trust.' }
      ]
    },
    {
      id: 'D2',
      title: 'Set Your Availability & Schedule',
      narrative: 'Control when you\'re available for appointments so patients can only book during your open hours.',
      flows: [
        { step: 1, view: 'Build Your Calendar', note: 'Use our weekly calendar to select your available time slots. Click "Add Slot" to create new openings.' },
        { step: 2, view: 'Manage Slots', note: 'View all your availability in an easy-to-read list. Remove slots you no longer need with one click.' },
        { step: 3, view: 'Confirm Changes', note: 'Before removing availability, we\'ll ask you to confirm to prevent accidental deletions.' }
      ]
    },
    {
      id: 'D3',
      title: 'Manage Appointments & Conduct Video Sessions',
      narrative: 'Track your bookings, start secure video consultations, and document patient interactions.',
      flows: [
        { step: 1, view: 'Appointments Dashboard', note: 'View all your appointments in one place. Filter by date, time, or status. Navigate with easy pagination.' },
        { step: 2, view: 'Appointment Details', note: 'Click any appointment to see patient information, reason for visit, and a "Start Video Call" button.' },
        { step: 3, view: 'Video Consultation', note: 'Join a secure video session with your patient. Use the overlay controls to end the session when done.' },
        { step: 4, view: 'Cancel if Needed', note: 'Need to cancel? Select a reason from the dropdown and confirm. Patients will be notified immediately.' }
      ]
    },
    {
      id: 'D4',
      title: 'Track Payments & Stay Informed',
      narrative: 'Monitor your earnings from completed consultations and stay updated with instant notifications.',
      flows: [
        { step: 1, view: 'Earnings Dashboard', note: 'See a summary of payment statuses, completed sessions, and pending payouts at a glance.' },
        { step: 2, view: 'Notification Feed', note: 'Get real-time alerts for new bookings, cancellations, payment confirmations, and patient messages via SMS and email.' }
      ]
    }
  ];

  return (
    <div className="w-full bg-[#F0FDF4] py-12">
      {/* Journey Introduction - Green Theme */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#059669] to-[#10B981] shadow-xl">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4">
            <svg className="w-12 h-12 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v6h6" />
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Professional Onboarding for Healthcare Providers</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">Set up your practice, manage your schedule, and deliver quality care through our secure platform.</p>
        </div>
      </div>
      
      {/* Visual Flow Timeline */}
      <div className="max-w-6xl mx-auto px-4">
        {steps.map((story, index) => (
          <div key={story.id} className="relative mb-8">
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-8 bg-gradient-to-b from-[#059669] to-[#D1FAE5] z-0"></div>
            )}
            
            {/* Main Step Card */}
            <div className="relative bg-gradient-to-br from-[#059669] to-[#10B981] rounded-2xl p-6 md:p-8 shadow-xl text-white mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-white text-[#059669] rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 text-xs font-bold uppercase rounded-full bg-white/20 text-white mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{story.title}</h3>
                  <p className="text-white/90 text-base md:text-lg leading-relaxed">{story.narrative}</p>
                </div>
              </div>
            </div>
            
            {/* Flow Graph */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 relative">
              {story.flows.map((flow, idx) => {
                // Single light green color for all arrows (step indicators)
                const color = { bg: 'bg-[#D1FAE5]', border: 'border-[#10B981]', hover: 'hover:bg-[#10B981]' };
                
                return (
                  <React.Fragment key={idx}>
                    {/* Arrow/Chevron Flow Node */}
                    <div className="relative flex-shrink-0 group cursor-pointer">
                      {/* Arrow Shape Container */}
                      <div className={`relative ${color.bg} ${color.hover} transition-all duration-300 shadow-lg hover:shadow-xl`}
                           style={{
                             width: '180px',
                             height: '80px',
                             clipPath: idx === story.flows.length - 1 
                               ? 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)'
                               : 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)'
                           }}>
                        {/* Content inside arrow */}
                        <div className="absolute inset-0 flex items-center justify-center px-6">
                          <div className="text-center">
                            <div className="text-[#1F2937] font-bold text-sm mb-1">Step {flow.step}</div>
                            <div className="text-[#1F2937] font-semibold text-xs leading-tight">{flow.view}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tooltip - Shows on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-[#1F2937] text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                        <div className="font-semibold mb-1">{flow.view}</div>
                        <div className="text-gray-300 leading-relaxed">{flow.note}</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1F2937]"></div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Mobile Compact Flow - Alternative View */}
            <div className="lg:hidden mt-6 space-y-2">
              {story.flows.map((flow, idx) => (
                <div key={idx} className="relative bg-white border-2 border-[#D1FAE5] rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#059669] to-[#10B981] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {flow.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#1F2937] font-bold text-sm mb-1">{flow.view}</h4>
                      <p className="text-[#1F2937]/70 text-xs leading-relaxed">{flow.note}</p>
                    </div>
                  </div>
                  {idx < story.flows.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <svg className="w-5 h-5 text-[#D1FAE5]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Legend */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-12 hidden lg:block">
        <div className="text-center text-sm text-[#1F2937]">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hover over each step to see detailed information
          </p>
        </div>
      </div>

      {/* Mobile View Note */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-12 lg:hidden">
        <div className="bg-[#D1FAE5] border border-[#D1FAE5] rounded-lg p-4 text-center">
          <p className="text-sm text-[#1F2937]">
            <span className="font-semibold">Mobile View:</span> Scroll down to see detailed steps for each phase
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 mt-16 pb-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#D1FAE5]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#D1FAE5] rounded-lg shadow-sm">
              <svg className="w-8 h-8 text-[#059669]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1F2937]">Why Doctors Choose Us</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Quick credential verification process',
              'Flexible schedule management tools',
              'HIPAA-compliant video platform',
              'Instant booking notifications',
              'Transparent payment tracking',
              'Secure patient history access'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#D1FAE5] to-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#D1FAE5] hover:border-[#10B981]">
                <svg className="w-6 h-6 text-[#059669] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#1F2937] font-medium text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorJourney;