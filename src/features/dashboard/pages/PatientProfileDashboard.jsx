import React, { useEffect, useState } from "react";
import { fetchPatientProfile, updatePatientProfile } from "@/api/api";
import { SEO } from "@/components/common/SEO";
import { seoConfig } from "@/config/seoConfig";
import { getAvatarUrl, getInitials } from "@/utils/avatar";
import { useProfileImageUpload } from "@/hooks/useProfileImageUpload";
import { 
  Spinner, 
  UserIcon, 
  EditIcon, 
  CheckIcon, 
  MailIcon, 
  PhoneIcon, 
  LocationIcon, 
  CalendarIcon 
} from "@/components/ui";

const PatientProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const {
    imageUploading,
    fileInputRef,
    handleImageUpload,
    handleRemoveImage,
    triggerFileInput
  } = useProfileImageUpload({
    role: "patient",
    profile,
    form,
    setProfile,
    setForm,
    showToast: showToastMessage
  });

  useEffect(() => {
    fetchPatientProfile()
      .then(data => {
        setProfile(data);
        setForm(data);
        setLoading(false);
        // Cache profile data including totpEnabled status
        localStorage.setItem('profileData', JSON.stringify(data));
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  function showToastMessage(message, type = "success") {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

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
      const updatedProfile = { ...profile, ...updated };
      setProfile(updatedProfile);
      setForm({ ...form, ...updated });
      // Update cached profile data
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
      setIsEditing(false);
      showToastMessage("Profile updated successfully!", "success");
    } catch {
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
            <Spinner size="md" text="Loading your profile..." />
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
      <SEO {...seoConfig.profile.patient} />
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="relative group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white relative">
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <Spinner size="sm" color="white" />
                    </div>
                  )}
                  {getAvatarUrl(profile) ? (
                    <img 
                      src={getAvatarUrl(profile)} 
                      alt={profile?.full_name || "Patient"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallbackEl = e.target.parentNode.querySelector('.fallback-avatar');
                        if (fallbackEl) fallbackEl.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`fallback-avatar w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl lg:text-2xl ${getAvatarUrl(profile) ? 'hidden' : 'flex'}`}>
                    {profile?.full_name
                      ? getInitials(null, profile)
                      : <UserIcon className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" />}
                  </div>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={imageUploading}
                    className="absolute bottom-0 right-0 w-6 h-6 lg:w-7 lg:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-blue-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    title="Upload profile picture"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="ml-4 lg:ml-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {profile?.full_name || "Patient"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-blue-100 text-sm lg:text-base">
                    Patient Account
                  </p>
                  {isEditing && (profile?.profileImageUrl || profile?.profile_image_url) && (
                    <>
                      <span className="text-blue-200/60 text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={imageUploading}
                        className="text-xs text-red-200 hover:text-red-100 font-semibold underline focus:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        Remove Photo
                      </button>
                    </>
                  )}
                </div>
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
                      <div className="mr-2">
                        <Spinner size="sm" color="white" />
                      </div>
                      <span>Updating...</span>
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
    </>
  );
};

export default PatientProfileDashboard;