import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { setDoctorAvailability, fetchDoctorAvailability } from "../../api/api";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

// Helper function to convert 24-hour format to 12-hour AM/PM format
const formatTimeToAMPM = (time24) => {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Icons as SVG components
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center cursor-pointer select-none">
    <span className="mr-3 font-medium text-gray-700">{label}</span>
    <span className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="block w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-200"></span>
      <span
        className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-200 ${checked ? "bg-blue-600 translate-x-4" : "bg-white"}`}
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
      ></span>
    </span>
  </label>
);

const DoctorAvailabilityPage = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState(
    DAYS.reduce((acc, day) => {
      acc[day] = { isAvailable: false, slots: [] };
      return acc;
    }, {})
  );
  const [modalDay, setModalDay] = useState(null);
  const [modalSlots, setModalSlots] = useState([]);
  const [modalAvailable, setModalAvailable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copyDay, setCopyDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Fetch existing availability data
  useEffect(() => {
    const loadAvailability = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        const existingAvailability = await fetchDoctorAvailability(user.userId);
        
        // Transform the API data to match our component structure
        const transformedAvailability = DAYS.reduce((acc, day) => {
          acc[day] = { isAvailable: false, slots: [] };
          return acc;
        }, {});

        // Process the fetched data
        if (Array.isArray(existingAvailability)) {
          existingAvailability.forEach(slot => {
            const day = slot.dayOfWeek?.toUpperCase();
            if (day && DAYS.includes(day)) {
              transformedAvailability[day].isAvailable = true;
              transformedAvailability[day].slots.push({
                startTime: slot.startTime,
                endTime: slot.endTime
              });
            }
          });
        }

        setAvailability(transformedAvailability);
      } catch (error) {
        console.error("Failed to load availability:", error);
        showToastMessage("Failed to load existing availability.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [user?.userId]);

  const showToastMessage = (message, type = "success") => {
    setMsg(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const openModal = (day) => {
    setModalDay(day);
    setModalAvailable(availability[day].isAvailable);
    setModalSlots(availability[day].slots.length ? [...availability[day].slots] : []);
    setShowModal(true);
  };

  const saveModal = () => {
    setAvailability((prev) => ({
      ...prev,
      [modalDay]: {
        isAvailable: modalAvailable,
        slots: modalAvailable ? modalSlots : []
      }
    }));
    setShowModal(false);
  };

  const addSlot = () => {
    setModalSlots((prev) => [...prev, { startTime: "", endTime: "" }]);
  };

  const editSlot = (idx, field, value) => {
    setModalSlots((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
    );
  };

  const deleteSlot = (idx) => {
    setModalSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const copyToAllDays = (day) => {
    setAvailability((prev) => {
      const { isAvailable, slots } = prev[day];
      return DAYS.reduce((acc, d) => {
        acc[d] = { isAvailable, slots: isAvailable ? [...slots] : [] };
        return acc;
      }, {});
    });
    setCopyDay(day);
    setTimeout(() => setCopyDay(null), 1500);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const payload = [];
    DAYS.forEach((day) => {
      if (availability[day].isAvailable) {
        availability[day].slots.forEach((slot) => {
          if (slot.startTime && slot.endTime) {
            payload.push({
              dayOfWeek: day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true
            });
          }
        });
      }
    });
    try {
      await setDoctorAvailability(user.userId, payload);
      showToastMessage("Availability saved successfully!", "success");
    } catch (e) {
      showToastMessage("Failed to save availability. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Manage Your Availability
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Set your weekly schedule to let patients know when you're available for appointments.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center text-gray-600 text-lg">
              <SpinnerIcon />
              Loading your availability...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-12 px-6 pb-8">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          msg.includes("Failed") ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          <div className="flex items-center">
            {msg.includes("Failed") ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <CheckIcon />
            )}
            <span className="font-medium">{msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Manage Your Availability
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Set your weekly schedule to let patients know when you're available for appointments.
        </p>
      </div>

      {/* Availability Section Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center mb-6">
          <CalendarIcon className="text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Set Your Weekly Availability</h3>
        </div>
        
        <div className="space-y-3">
          {DAYS.map((day, index) => (
            <div 
              key={day} 
              className={`flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              } border border-gray-100`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={availability[day].isAvailable}
                onChange={() => setAvailability((prev) => ({
                  ...prev,
                  [day]: {
                    ...prev[day],
                    isAvailable: !prev[day].isAvailable,
                    slots: !prev[day].isAvailable && prev[day].slots.length === 0 ? [{ startTime: "", endTime: "" }] : prev[day].slots
                  }
                }))}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
              />
              
              {/* Day Name */}
              <div className="w-32 font-semibold text-gray-700 ml-4">
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </div>
              
              {/* Time Slots Display */}
              <div className="flex-1 ml-4">
                {availability[day].isAvailable && availability[day].slots.length > 0 ? (
                  <span className="text-sm text-gray-700 font-medium">
                    {availability[day].slots.map((slot, idx) => (
                      <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full mr-2 mb-1">
                        {slot.startTime && slot.endTime ? `${formatTimeToAMPM(slot.startTime)} - ${formatTimeToAMPM(slot.endTime)}` : "(edit slots)"}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 italic">No slots scheduled</span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  type="button"
                  onClick={() => openModal(day)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {availability[day].isAvailable ? (
                    <>
                      <EditIcon />
                      <span className="ml-1">Edit</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      <span className="ml-1">Set</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => copyToAllDays(day)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  title="Copy to all days"
                >
                  <CopyIcon />
                </button>
                
                {copyDay === day && (
                  <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded">Copied!</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            💡 Click "Edit" or "Set" to add multiple time slots for each day. You can copy one day's schedule to all other days.
          </p>
        </div>
      </div>

      {/* Save All Button - Sticky on larger screens */}
      <div className="sticky bottom-6 z-40">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Ready to save your availability schedule?
            </div>
            <button
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <>
                  <SpinnerIcon />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon />
                  <span className="ml-2">Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto relative animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {modalDay && modalDay.charAt(0) + modalDay.slice(1).toLowerCase()} Schedule
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <ToggleSwitch
                checked={modalAvailable}
                onChange={() => setModalAvailable((v) => !v)}
                label={`Available for appointments on ${modalDay && modalDay.charAt(0) + modalDay.slice(1).toLowerCase()}`}
              />
              
              {modalAvailable && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Time Slots</h4>
                    <button
                      type="button"
                      onClick={addSlot}
                      className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      <PlusIcon />
                      <span className="ml-1">Add Slot</span>
                    </button>
                  </div>
                  
                  {modalSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={slot.startTime}
                            onChange={(e) => editSlot(idx, "startTime", e.target.value)}
                          >
                            <option value="">Select time</option>
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeToAMPM(t)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={slot.endTime}
                            onChange={(e) => editSlot(idx, "endTime", e.target.value)}
                          >
                            <option value="">Select time</option>
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeToAMPM(t)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => deleteSlot(idx)}
                        title="Delete slot"
                        type="button"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                  
                  {modalSlots.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PlusIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No time slots added yet</p>
                      <p className="text-sm">Click "Add Slot" to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
                onClick={saveModal}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorAvailabilityPage; 