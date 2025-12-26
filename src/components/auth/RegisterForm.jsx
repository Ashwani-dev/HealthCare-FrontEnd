import React, { useState } from "react";
import DoctorRegisterForm from "./DoctorRegisterForm";
import PatientRegisterForm from "./PatientRegisterForm";

const RegisterForm = () => {
  const [type, setType] = useState("patient");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Role Toggle Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Register as:</span>
            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setType("patient")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  type === "patient"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Patient
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType("doctor")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  type === "doctor"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                  Doctor
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content with Fade Transition */}
      <div className="transition-opacity duration-300">
        {type === "patient" ? <PatientRegisterForm /> : <DoctorRegisterForm />}
      </div>
    </div>
  );
};

export default RegisterForm;