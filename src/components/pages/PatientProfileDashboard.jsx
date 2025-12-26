import React, { useEffect, useState } from "react";
import { fetchPatientProfile, updatePatientProfile } from "../../api/api";

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

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PatientProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchPatientProfile()
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
      const updated = await updatePatientProfile({
        full_name: form.full_name,
        address: form.address
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
            My Profile
          </h1>
          <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
            Manage your personal information and account settings
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
          My Profile
        </h1>
        <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" />
              </div>
              <div className="ml-4 lg:ml-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {profile?.full_name || "Patient"}
                </h2>
                <p className="text-blue-100 text-sm lg:text-base mt-1">
                  Patient Account
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
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

                {/* Phone (Read-only) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <PhoneIcon />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={profile?.contact_number || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Phone cannot be changed</p>
                </div>

                {/* Date of Birth (Read-only) */}
                <div>
                  <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CalendarIcon />
                    </div>
                    <input
                      type="text"
                      id="dob"
                      value={profile?.date_of_birth || ""}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Date of birth cannot be changed</p>
                </div>
              </div>

              {/* Address - Full Width */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
                    <LocationIcon />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={form?.address || ""}
                    onChange={handleChange}
                    rows="3"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="text-blue-600 mt-1">
                    <UserIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Full Name</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.full_name || "N/A"}</p>
                  </div>
                </div>

                {/* Email - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-blue-600 mt-1">
                    <MailIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Email Address</p>
                    <p className="text-base text-gray-800 font-medium break-all">{profile?.email || "N/A"}</p>
                  </div>
                </div>

                {/* Phone - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-blue-600 mt-1">
                    <PhoneIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Phone Number</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.contact_number || "N/A"}</p>
                  </div>
                </div>

                {/* Date of Birth - View */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-blue-600 mt-1">
                    <CalendarIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Date of Birth</p>
                    <p className="text-base text-gray-800 font-medium">{profile?.date_of_birth || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Address - Full Width View */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mt-1">
                  <LocationIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Address</p>
                  <p className="text-base text-gray-800 font-medium">{profile?.address || "No address provided"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 lg:p-8">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Information</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Keep your profile information up to date to ensure smooth appointment bookings and communications. 
              Some fields like email, phone, and date of birth cannot be changed for security reasons. 
              If you need to update these fields, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileDashboard;