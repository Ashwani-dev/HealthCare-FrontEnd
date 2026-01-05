import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorJourney from '../userJourney/DoctorJourney';
import PatientJourney from '../userJourney/PatientJourney';

const UserJourneyPage = () => {
  const [view, setView] = useState('patient');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-6 text-center py-8 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Platform Guide
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          How It Works
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Discover how our platform makes mental healthcare accessible, secure, and simple for everyone.
        </p>
        
        {/* Toggle Switch */}
        <div className="inline-flex bg-white p-1.5 rounded-full shadow-lg border border-gray-200">
          <button 
            className={`relative px-8 py-3.5 rounded-full font-semibold transition-all duration-300 ${
              view === 'patient' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setView('patient')}
          >
            {view === 'patient' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Patient Journey
            </span>
          </button>
          <button 
            className={`relative px-8 py-3.5 rounded-full font-semibold transition-all duration-300 ${
              view === 'doctor' 
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setView('doctor')}
          >
            {view === 'doctor' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Doctor Journey
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="pb-16">
        <div className="transition-all duration-300">
          {view === 'patient' ? <PatientJourney /> : <DoctorJourney />}
        </div>
      </div>
    </div>
  );
};

export default UserJourneyPage;