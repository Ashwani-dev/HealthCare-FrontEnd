import React, { useState } from 'react';
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";
import DoctorJourney from '../userJourney/DoctorJourney';
import PatientJourney from '../userJourney/PatientJourney';

const UserJourneyPage = () => {
  const [view, setView] = useState('patient');

  return (
    <>
      <SEO {...seoConfig.userJourney} />
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="relative flex flex-col justify-center items-center min-h-[50vh] px-4 pt-16 pb-12 text-center overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-200 via-blue-50 to-pink-100 opacity-80 blur-lg z-0" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-sm font-semibold mb-4 shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Platform Guide
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text mb-4 drop-shadow-lg">
              How It Works
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Discover how our platform makes mental healthcare accessible, secure, and simple for everyone.
            </p>
            
            {/* Toggle Switch */}
            <div className="inline-flex bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-xl border-2 border-gray-200">
              <button 
                className={`relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                  view === 'patient' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setView('patient')}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Patient Journey</span>
                  <span className="sm:hidden">Patient</span>
                </span>
              </button>
              <button 
                className={`relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                  view === 'doctor' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setView('doctor')}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Doctor Journey</span>
                  <span className="sm:hidden">Doctor</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="py-8 sm:py-12">
          <div className="transition-all duration-300">
            {view === 'patient' ? <PatientJourney /> : <DoctorJourney />}
          </div>
        </section>
      </div>
    </>
  );
};

export default UserJourneyPage;