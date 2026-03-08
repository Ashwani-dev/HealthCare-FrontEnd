import React from 'react';

const PatientJourney = () => {
  const steps = [
    {
      id: 'P1',
      title: 'Getting Started: Sign Up & Set Up Your Profile',
      narrative: 'Create your account in minutes and tell us a bit about yourself so we can personalize your therapy experience.',
      flows: [
        { step: 1, view: 'Welcome', note: 'Click "Register" on our homepage to begin your journey to better mental health.' },
        { step: 2, view: 'Create Account', note: 'Enter your name, email, password, phone number, date of birth, and gender. Takes less than 2 minutes!' },
        { step: 3, view: 'Verify Email', note: 'Check your inbox! We\'ll send you a welcome email with a verification link to secure your account.' },
        { step: 4, view: 'Complete Your Profile', note: 'Add your address, emergency contact, and any medical information you\'d like to share (optional).' },
        { step: 5, view: 'Ready to Go!', note: 'All set! Click "Create Account" to explore your personalized therapy portal.' }
      ]
    },
    {
      id: 'P2',
      title: 'Your Dashboard: Manage Everything in One Place',
      narrative: 'View upcoming sessions, review past appointments, and quickly book new consultations.',
      flows: [
        { step: 1, view: 'Dashboard Home', note: 'See your upcoming appointments, past sessions, and a quick "Book New Session" button at your fingertips.' },
        { step: 2, view: 'Next Session', note: 'Your upcoming appointment shows who you\'re meeting, when, and a "Join Call" button (available 10 minutes before).' },
        { step: 3, view: 'Past Sessions', note: 'Scroll through your consultation history, view therapist notes, or book a follow-up with the same provider.' },
        { step: 4, view: 'Upcoming Schedule', note: 'See all your scheduled sessions in a calendar view. Click any appointment to see details or make changes.' },
        { step: 5, view: 'Manage Appointments', note: 'Need to reschedule or cancel? Access quick actions like View Details, Reschedule, Cancel, or Download Receipt.' }
      ]
    },
    {
      id: 'P3',
      title: 'Find Your Perfect Therapist Match',
      narrative: 'Browse, filter, and choose from our network of qualified mental health professionals.',
      flows: [
        { step: 1, view: 'Start Your Search', note: 'Click "Find a Therapist" from your dashboard menu.' },
        { step: 2, view: 'Search & Filter', note: 'Use our search bar to find therapists by name, or filter by specialization, gender, language, availability, and ratings.' },
        { step: 3, view: 'Browse Therapists', note: 'See therapist profiles with photos, specializations, ratings, experience, and pricing. Click "View Profile" to learn more.' },
        { step: 4, view: 'Apply Filters', note: 'Looking for something specific? Filter for female therapists specializing in anxiety who are available today. Results update instantly!' },
        { step: 5, view: 'Review Profile', note: 'Read their bio, credentials, specializations, languages spoken, patient reviews, and watch intro videos (if available).' },
        { step: 6, view: 'Check Availability', note: 'View their calendar and available time slots for the next two weeks. Ready to book? Click "Book Session"!' }
      ]
    },
    {
      id: 'P4',
      title: 'Book Your Session & Complete Payment',
      narrative: 'Pick your preferred time slot, securely pay online, and get instant confirmation.',
      flows: [
        { step: 1, view: 'Choose Your Slot', note: 'Select a date from the calendar, then pick an available time that works for you. Click "Continue to Payment".' },
        { step: 2, view: 'Review Booking', note: 'Double-check your therapist, date, time, session length (usually 50 minutes), and total cost before proceeding.' },
        { step: 3, view: 'Secure Checkout', note: 'Choose your payment method: Credit/Debit Card, UPI, or Net Banking. All transactions are encrypted and secure.' },
        { step: 4, view: 'Processing...', note: 'Sit tight! We\'re securely processing your payment with our trusted payment partner.' },
        { step: 5, view: 'Success!', note: 'Payment confirmed! Your appointment is booked. See your booking details and confirmation number.' },
        { step: 6, view: 'Confirmation Received', note: 'Check your email and phone for appointment details and a calendar invite you can add to your schedule.' },
        { step: 7, view: 'Back to Dashboard', note: 'Click "Go to Dashboard" to see your new appointment in your upcoming sessions.' }
      ]
    },
    {
      id: 'P5',
      title: 'Join Your Session & Connect with Your Therapist',
      narrative: 'When your appointment time arrives, join a secure video call from any device.',
      flows: [
        { step: 1, view: 'Session Reminder', note: 'We\'ll send you a reminder 15 minutes before: "Your session with [Therapist Name] starts soon!"' },
        { step: 2, view: 'Join Call', note: 'Your dashboard shows a green "Join Call" button 10 minutes before start time. Click when ready!' },
        { step: 3, view: 'Tech Check', note: 'Test your camera, microphone, and speakers before joining. Review our privacy notice, then click "Join Session".' },
        { step: 4, view: 'Live Session', note: 'You\'re connected! Full-screen video with your therapist. Use controls to mute, turn video on/off, or chat.' },
        { step: 5, view: 'Session Tools', note: 'Need to share something? Use the chat panel to send text messages. See connection quality in the corner.' },
        { step: 6, view: 'End Session', note: 'When you\'re done, click "Leave Call". A quick confirmation ensures you meant to exit.' },
        { step: 7, view: 'Share Feedback', note: 'How was your session? Rate it with 1-5 stars and leave optional feedback to help us improve.' },
        { step: 8, view: 'Session Summary', note: 'Review session duration, therapist notes (if shared), and book a follow-up if you\'d like to continue.' },
        { step: 9, view: 'Updated History', note: 'Your completed session is now in your history. Download your receipt anytime from past appointments.' }
      ]
    },
    {
      id: 'P6',
      title: 'Additional Features to Support Your Journey',
      narrative: 'Explore more tools and options to personalize your therapy experience.',
      flows: [
        { step: 1, view: 'Edit Profile', note: 'Update your personal information, preferences, payment methods, or subscription details anytime.' },
        { step: 2, view: 'Save Favorites', note: 'Found a therapist you love? Save them to your favorites for easy rebooking in "My Therapists".' },
        { step: 3, view: 'Session History', note: 'Access all your past sessions with dates and durations. View therapist notes if they\'ve been shared with you.' },
        { step: 4, view: 'Reschedule or Cancel', note: 'Need to change plans? Click "Reschedule" to pick a new time or "Cancel" with a reason from appointment details.' },
        { step: 5, view: 'Stay Informed', note: 'Check your notifications center for appointment reminders, therapist messages, payment receipts, and updates.' },
        { step: 6, view: 'Get Help', note: 'Need assistance? Visit our FAQ, start a live chat, submit a contact form, or access emergency crisis resources.' }
      ]
    }
  ];

  return (
    <div className="w-full bg-[#EFF6FF] py-12">
      {/* Journey Introduction - Blue Theme */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-xl">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4">
            <svg className="w-12 h-12 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10h3l2 3 2-6 2 3h3" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Your Journey to Better Mental Health</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">From signing up to your first consultation, we've made every step simple and secure.</p>
        </div>
      </div>
      
      {/* Visual Flow Timeline */}
      <div className="max-w-6xl mx-auto px-4">
        {steps.map((story, index) => (
          <div key={story.id} className="relative mb-8">
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-8 bg-gradient-to-b from-[#3B82F6] to-[#DBEAFE] z-0"></div>
            )}
            
            {/* Main Step Card */}
            <div className="relative bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-2xl p-6 md:p-8 shadow-xl text-white mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-white text-[#3B82F6] rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
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
                // Single light blue color for all arrows (step indicators)
                const color = { bg: 'bg-[#DBEAFE]', border: 'border-[#3B82F6]', hover: 'hover:bg-[#3B82F6]' };
                
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
                <div key={idx} className="relative bg-white border-2 border-[#E5E7EB] rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {flow.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#1F2937] font-bold text-sm mb-1">{flow.view}</h4>
                      <p className="text-[#1F2937]/70 text-xs leading-relaxed">{flow.note}</p>
                    </div>
                  </div>
                  {idx < story.flows.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <svg className="w-5 h-5 text-[#DBEAFE]" fill="currentColor" viewBox="0 0 20 20">
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
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hover over each step to see detailed information
          </p>
        </div>
      </div>

      {/* Mobile View Note */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-12 lg:hidden">
        <div className="bg-[#DBEAFE] border border-[#E5E7EB] rounded-lg p-4 text-center">
          <p className="text-sm text-[#1F2937]">
            <span className="font-semibold">Mobile View:</span> Scroll down to see detailed steps for each phase
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 mt-16 pb-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#DBEAFE] rounded-lg shadow-sm">
              <svg className="w-8 h-8 text-[#3B82F6]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1F2937]">Why Patients Love Us</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '5-minute quick sign-up process',
              'Find your perfect therapist match',
              'Flexible scheduling that works for you',
              'Secure, high-quality video sessions',
              'Easy appointment management',
              'Access your session history 24/7'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#DBEAFE] to-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#E5E7EB] hover:border-[#3B82F6]">
                <svg className="w-6 h-6 text-[#10B981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

export default PatientJourney;