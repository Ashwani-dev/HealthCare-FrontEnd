import React, { useState, useEffect } from "react";
import { fetchDoctorAvailability, fetchDoctorAvailableSlots, fetchPatientProfile, createAppointmentHold, initiatePaymentWithHold, getPaymentStatus } from "../../api/api";
import { cashfreeCheckout } from "../payment/cashfree";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const weekdayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const BookAppointment = ({ doctor, patientId, onBooked, onCancel }) => {
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // now a Date object
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState([]); // [0, 1, ...]
  const [timeSlots, setTimeSlots] = useState([]); // [{startTime, endTime}]
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState(null);

  useEffect(() => {
    if (doctor?.id) {
      setLoading(true);
      fetchDoctorAvailability(doctor.id).then((data) => {
        const avail = data.filter(a => a.available);
        setAvailability(avail);
        // Get available weekdays as numbers (0=Sun, 1=Mon...)
        const weekdays = Array.from(new Set(avail.map(slot => weekdayMap.indexOf(slot.dayOfWeek)))).filter(i => i !== -1);
        setAvailableWeekdays(weekdays);
        setLoading(false);
      });
    }
  }, [doctor]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (doctor?.id && selectedDate) {
      setSlotsLoading(true);
      setTimeSlots([]);
      const dateStr = selectedDate.getFullYear() + '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(selectedDate.getDate()).padStart(2, '0');
      
      fetchDoctorAvailableSlots(doctor.id, dateStr)
        .then((slots) => {
          setTimeSlots(slots);
        })
        .catch((error) => {
          // Handle error silently or show user-friendly message
        })
        .finally(() => setSlotsLoading(false));
    } else {
      setTimeSlots([]);
    }
  }, [doctor, selectedDate]);

  // Payment status polling when payment is initiated
  useEffect(() => {
    if (paymentInitiated && paymentSessionId) {
      const pollPaymentStatus = async () => {
        try {
          // Extract orderId from sessionId or use sessionId directly
          const orderId = paymentSessionId;
          let pollCount = 0;
          const maxPolls = 10; // Poll exactly 10 times
          
          // Poll payment status every 2 seconds, up to 10 times
          const interval = setInterval(async () => {
            try {
              pollCount++;
              console.log(`Polling payment status (${pollCount}/${maxPolls}):`, orderId);
              
              const status = await getPaymentStatus(orderId);
              console.log('Payment status:', status);
              
              if (status === 'PAID' || status === 'SUCCESS') {
                clearInterval(interval);
                setMsg('Payment successful! Your appointment has been booked.');
                setPaymentInitiated(false);
                setPaymentSessionId(null);
                
                // The appointment will be automatically created by the backend
                // You can optionally fetch the appointment details here
                if (onBooked) onBooked();
              } else if (status === 'FAILED' || status === 'CANCELLED') {
                clearInterval(interval);
                setError('Payment failed. Please try again.');
                setPaymentInitiated(false);
                setPaymentSessionId(null);
              } else if (pollCount >= maxPolls) {
                // Stop polling after 10 attempts
                clearInterval(interval);
                setError('Payment status polling completed. Please check your payment status manually.');
                setPaymentInitiated(false);
                setPaymentSessionId(null);
              }
              // Continue polling for PENDING status until max polls reached
            } catch (error) {
              console.error('Error polling payment status:', error);
              pollCount++;
              if (pollCount >= maxPolls) {
                clearInterval(interval);
                setError('Payment status polling failed. Please check your payment status manually.');
                setPaymentInitiated(false);
                setPaymentSessionId(null);
              }
            }
          }, 2000);
          
        } catch (error) {
          console.error('Error setting up payment status polling:', error);
        }
      };
      
      pollPaymentStatus();
    }
  }, [paymentInitiated, paymentSessionId, onBooked]);


  const handlePayNowAndBook = async () => {
    try {
      setPaymentLoading(true);
      setError("");
      setMsg("");
      
      // Step 1: Create Appointment Hold
      const dateStr = selectedDate.getFullYear() + '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(selectedDate.getDate()).padStart(2, '0');
      
      const formattedTime = selectedTime.includes(':') ? selectedTime.split(':').slice(0, 2).join(':') : selectedTime;
      
      const holdData = {
        patientId: patientId,
        doctorId: doctor.id,
        date: dateStr,
        startTime: formattedTime,
        reason: reason
      };
      
      const holdId = await createAppointmentHold(holdData);
      console.log('Appointment hold created:', holdId);
      
      // Step 2: Initiate Payment with Hold ID
      const patientProfile = await fetchPatientProfile();
      
      const paymentData = {
        appointmentHoldReference: holdId,
        customerId: patientProfile.id || patientId,
        customerName: patientProfile.full_name || "Patient",
        customerPhone: patientProfile.contact_number || "9999999999",
        customerEmail: patientProfile.email || "patient@example.com",
        amount: 500.0
      };
      
      // Store payment data for result pages
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      
      const response = await initiatePaymentWithHold(paymentData);
      const sessionId = response.paymentSessionId;
      
      setPaymentSessionId(sessionId);
      setPaymentInitiated(true);
      
      // Step 3: Redirect to payment page
      const redirectTarget = "_self";
      console.log('Opening payment page with hold ID:', { sessionId, holdId, redirectTarget });

      // Call Cashfree checkout
      await cashfreeCheckout({
        sessionId: sessionId,
        redirectTarget: redirectTarget
      });
      
    } catch (error) {
      console.error('Pay now and book error:', error);
      setError('Failed to initiate payment and booking: ' + (error.response?.data?.message || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Disable all days except available weekdays
  const filterDate = (date) => availableWeekdays.includes(date.getDay());

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-bold mb-2">Book Appointment with {doctor.full_name || doctor.name}</h3>
      <div>
        {/* Date Picker */}
        <label className="block mb-2">Select Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={date => { setSelectedDate(date); setSelectedTime(""); }}
          filterDate={filterDate}
          minDate={new Date()}
          placeholderText="Select a date"
          className="mb-2 w-full border p-2 rounded"
          dateFormat="yyyy-MM-dd"
          disabled={loading}
        />
        {/* Show time dropdown after date selected */}
        {selectedDate && (
          <>
            <label className="block mb-2">Select Time:</label>
            <select
              className="mb-2 w-full border p-2"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              disabled={slotsLoading}
            >
              <option value="">{slotsLoading ? "Loading..." : "Select a time"}</option>
              {timeSlots.map((slot, idx) => (
                <option key={idx} value={slot.startTime}>
                  {slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}
                </option>
              ))}
            </select>
          </>
        )}
        {/* Reason text box */}
        <label className="block mb-2 mt-2">Reason for Treatment:</label>
        <textarea
          className="mb-2 w-full border p-2"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Describe your reason for seeking treatment..."
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button type="button" className="bg-gray-400 text-white px-4 py-1 rounded" onClick={onCancel}>Cancel</button>
        </div>
        {msg && <div className="text-green-600 mt-2">{msg}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
        
        {/* Success message for payment and booking */}
        {paymentInitiated === false && paymentSessionId === null && msg && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-700 font-medium">
                {msg}
              </span>
            </div>
          </div>
        )}
        
        {/* Pay now and book button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePayNowAndBook}
            disabled={paymentLoading || !selectedDate || !selectedTime || !reason}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paymentLoading ? 'Processing...' : 'Pay now and book'}
          </button>
          
          <p className="text-sm text-gray-600 mt-2 text-center">
            Consultation Fee: ₹500
          </p>
          
          {/* Status indicator for payment and booking process */}
          {paymentInitiated && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-700">
                  Payment in progress... Your appointment slot is on hold.
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Please complete the payment to confirm your booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 