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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
      {/* Journey Introduction - Blue Theme - Mobile Optimized */}
      <div className="text-center mb-8 sm:mb-12 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="inline-block p-2 sm:p-3 bg-white rounded-full shadow-sm mb-3 sm:mb-4">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white px-2">Your Journey to Better Mental Health</h2>
        <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto px-4">From signing up to your first consultation, we've made every step simple and secure.</p>
      </div>
      
      {/* Timeline - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6">
        {steps.map((story, index) => (
          <div key={story.id} className="relative bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Story Number Badge - Mobile Optimized */}
            <div className="absolute -left-2 sm:-left-4 top-4 sm:top-8 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg z-10">
              {index + 1}
            </div>
            
            {/* Story Header - Mobile Optimized */}
            <div className="mb-4 sm:mb-6 ml-10 sm:ml-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold uppercase rounded-lg bg-blue-50 text-blue-700 border border-blue-200 inline-block w-fit">
                  Step {index + 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{story.title}</h3>
              </div>
              
              {/* Narrative - Mobile Optimized */}
              <p className="text-gray-600 text-base sm:text-lg pl-3 sm:pl-4 border-l-3 sm:border-l-4 border-blue-400 leading-relaxed">
                {story.narrative}
              </p>
            </div>
            
            {/* Flow List - Mobile Optimized */}
            <div className="ml-10 sm:ml-10">
              <ul className="space-y-2.5 sm:space-y-3">
                {story.flows.map((flow, idx) => (
                  <li key={idx} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border border-gray-100 hover:border-blue-300 group">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-blue-400 text-blue-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 mt-0.5">
                      {flow.step}
                    </span>
                    <div className="flex-1 pt-0">
                      <strong className="text-gray-900 text-base sm:text-lg block mb-1 sm:mb-1.5 font-semibold leading-tight">{flow.view}</strong>
                      <span className="text-gray-600 leading-relaxed text-sm sm:text-base">{flow.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Mobile Optimized */}
      <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t-2 border-gray-100">
        <div className="bg-blue-50 border border-blue-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Why Patients Love Us</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              '5-minute quick sign-up process',
              'Find your perfect therapist match',
              'Flexible scheduling that works for you',
              'Secure, high-quality video sessions',
              'Easy appointment management',
              'Access your session history 24/7'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientJourney;