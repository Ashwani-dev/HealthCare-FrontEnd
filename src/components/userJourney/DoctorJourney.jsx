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
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Journey Introduction - Green Theme */}
      <div className="text-center mb-12 p-8 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 shadow-lg">
        <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">Professional Onboarding for Healthcare Providers</h2>
        <p className="text-lg text-green-100 max-w-2xl mx-auto">Set up your practice, manage your schedule, and deliver quality care through our secure platform.</p>
      </div>
      
      {/* Timeline */}
      <div className="space-y-6">
        {steps.map((story, index) => (
          <div key={story.id} className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Story Number Badge - Green Theme */}
            <div className="absolute -left-4 top-8 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-10">
              {index + 1}
            </div>
            
            {/* Story Header */}
            <div className="mb-6 ml-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-green-50 text-green-700 border border-green-200">
                  Step {index + 1}
                </span>
                <h3 className="text-2xl font-bold text-gray-900">{story.title}</h3>
              </div>
              
              {/* Narrative - Green Theme */}
              <p className="text-gray-600 text-lg pl-4 border-l-4 border-green-400">
                {story.narrative}
              </p>
            </div>
            
            {/* Flow List - Green Theme */}
            <div className="ml-10">
              <ul className="space-y-3">
                {story.flows.map((flow, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-green-50 hover:to-teal-50 transition-all duration-200 border border-gray-100 hover:border-green-300 group">
                    <span className="flex-shrink-0 w-8 h-8 bg-white border-2 border-green-400 text-green-700 rounded-full flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                      {flow.step}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <strong className="text-gray-900 text-lg block mb-1.5 font-semibold">{flow.view}</strong>
                      <span className="text-gray-600 leading-relaxed">{flow.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Green Theme */}
      <div className="mt-16 pt-8 border-t-2 border-gray-100">
        <div className="bg-green-50 border border-green-200 p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Why Doctors Choose Us</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Quick credential verification process',
              'Flexible schedule management tools',
              'HIPAA-compliant video platform',
              'Instant booking notifications',
              'Transparent payment tracking',
              'Secure patient history access'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-800 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorJourney;