import React, { useEffect, useState } from "react";
import { fetchDoctorProfile, updateDoctorProfile } from "../../api/api";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";

// SVG Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const GenderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DoctorProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchDoctorProfile()
      .then(data => {
        setProfile(data);
        setForm(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const showToastMessage = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const updated = await updateDoctorProfile({
        full_name: form.full_name,
        medical_experience: form.medical_experience,
        license_number: form.license_number
      });
      setProfile({ ...profile, ...updated });
      setForm({ ...form, ...updated });
      setIsEditing(false);
      showToastMessage("Profile updated successfully!", "success");
    } catch (err) {
      showToastMessage("Failed to update profile. Please try again.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(profile);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 lg:mt-12 px-4 lg:px-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-3">
            Doctor Profile
          </h1>
          <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
            Manage your professional information and credentials
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center text-gray-600 text-lg">
              <SpinnerIcon />
              <span className="ml-3">Loading your profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-6xl mx-auto mt-8 lg:mt-12 px-4 lg:px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 lg:p-8">
          <div className="flex items-center text-red-800">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO {...seoConfig.profile.doctor} />
      <div className="max-w-6xl mx-auto mt-8 lg:mt-12 px-4 lg:px-6 pb-8">
      {/* Toast Notification */}
      {showToast && (success || error) && (
        <div className={`fixed top-4 left-4 right-4 lg:right-auto lg:left-auto lg:right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          error ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          <div className="flex items-center">
            {error ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <CheckIcon />
            )}
            <span className="font-medium">{error || success}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-3">
          Doctor Profile
        </h1>
        <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
          Manage your professional information and credentials
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4 lg:ml-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Dr. {profile?.full_name || "Doctor"}
                </h2>
                <p className="text-green-100 text-sm lg:text-base mt-1">
                  {profile?.specialization || "Medical Professional"}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center px-4 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
              >
                <EditIcon />
                <span className="ml-2">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 lg:p-8">
          {isEditing ? (
            // Edit Mode
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={form?.full_name || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Gender (Read-only) */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <GenderIcon />
                    </div>
                    <input
                      type="text"
                      id="gender"
                      value={form?.gender || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Gender cannot be changed</p>
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={form?.username || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={profile?.email || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Contact Number (Read-only) */}
                <div>
                  <label htmlFor="contact_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <PhoneIcon />
                    </div>
                    <input
                      type="tel"
                      id="contact_number"
                      value={profile?.contact_number || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Contact number cannot be changed</p>
                </div>

                {/* Specialization (Read-only) */}
                <div>
                  <label htmlFor="specialization" className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <AcademicCapIcon />
                    </div>
                    <input
                      type="text"
                      id="specialization"
                      value={form?.specialization || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Specialization cannot be changed</p>
                </div>

                {/* Medical Experience */}
                <div>
                  <label htmlFor="medical_experience" className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Experience (years)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <BriefcaseIcon />
                    </div>
                    <input
                      type="number"
                      id="medical_experience"
                      name="medical_experience"
                      value={form?.medical_experience || ""}
                      onChange={handleChange}
                      min="0"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Years of experience"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div>
                  <label htmlFor="license_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    License Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <BadgeIcon />
                    </div>
                    <input
                      type="text"
                      id="license_number"
                      name="license_number"
                      value={form?.license_number || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Medical license number"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <SpinnerIcon />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      <span className="ml-2">Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Name - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <UserIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Full Name</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.full_name || "N/A"}</p>
                  </div>
                </div>

                {/* Gender - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <GenderIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Gender</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.gender || "N/A"}</p>
                  </div>
                </div>

                {/* Username - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <UserIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Username</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.username || "N/A"}</p>
                  </div>
                </div>

                {/* Email - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <MailIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Email Address</p>
                    <p className="text-base text-gray-800 font-medium break-all">{profile?.email || "N/A"}</p>
                  </div>
                </div>

                {/* Contact Number - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <PhoneIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Contact Number</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.contact_number || "N/A"}</p>
                  </div>
                </div>

                {/* Specialization - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <AcademicCapIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Specialization</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.specialization || "N/A"}</p>
                  </div>
                </div>

                {/* Medical Experience - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <BriefcaseIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Medical Experience</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.medical_experience ? `${profile.medical_experience} years` : "N/A"}</p>
                  </div>
                </div>

                {/* License Number - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-green-600 mt-1">
                    <BadgeIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">License Number</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.license_number || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 lg:p-8">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Professional Information</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Keep your professional credentials up to date to ensure accurate information is displayed to patients. 
              Fields like username, email, contact number, gender, and specialization are locked for security and verification purposes. 
              If you need to update these fields, please contact system administration.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DoctorProfileDashboard;