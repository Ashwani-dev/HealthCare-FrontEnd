import React, { useState, useEffect } from "react";
import { bookAppointment, fetchDoctorAvailability, fetchDoctorAvailableSlots } from "../../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const weekdayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const BookAppointment = ({ doctor, patientId, onBooked, onCancel }) => {
  const [availability, setAvailability] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // [{date: Date, slots: [{start, end, rawStart, rawEnd}]}]
  const [selectedDate, setSelectedDate] = useState(null); // now a Date object
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState([]); // [0, 1, ...]
  const [timeSlots, setTimeSlots] = useState([]); // [{startTime, endTime}]
  const [slotsLoading, setSlotsLoading] = useState(false);

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

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    setError("");
    setMsg("");
    
    try {
      const dateStr = selectedDate.getFullYear() + '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(selectedDate.getDate()).padStart(2, '0');
      
      // Format time to remove seconds if present (e.g., "14:30:00" -> "14:30")
      const formattedTime = selectedTime.includes(':') ? selectedTime.split(':').slice(0, 2).join(':') : selectedTime;
      
      await bookAppointment(
        doctor.id,
        patientId,
        dateStr,
        formattedTime,
        reason
      );
      
      setMsg("Appointment booked!");
      if (onBooked) onBooked();
    } catch (err) {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // Disable all days except available weekdays
  const filterDate = (date) => availableWeekdays.includes(date.getDay());

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-bold mb-2">Book Appointment with {doctor.full_name || doctor.name}</h3>
      <form onSubmit={handleBook}>
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
          required
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
              required
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
          required
        />
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded" disabled={!selectedDate || !selectedTime || !reason || loading || booking}>Book Now</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-1 rounded" onClick={onCancel}>Cancel</button>
        </div>
        {msg && <div className="text-green-600 mt-2">{msg}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default BookAppointment; 