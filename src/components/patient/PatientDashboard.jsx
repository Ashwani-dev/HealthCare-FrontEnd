import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import AppointmentsPanel from "../common/AppointmentsPanel";
import { fetchPatientAppointments, fetchPatientProfile, cancelAppointment, rescheduleAppointment } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";


// Refined dashboard header with calming colors and better spacing
const DashboardHeader = ({ patientName, appointments }) => {
  // Determine summary line
  let summary = "";
  if (appointments && appointments.length > 0) {
    // Find the next upcoming appointment
    const now = new Date();
    const upcoming = appointments
      .map(a => {
        // Combine appointmentStartDate and startTime to create a Date object
        const dateTimeStr = `${a.appointmentStartDate}T${a.startTime}`;
        return { ...a, dateObj: new Date(dateTimeStr) };
      })
      .filter(a => a.dateObj > now)
      .sort((a, b) => a.dateObj - b.dateObj);
    if (upcoming.length > 0) {
      const next = upcoming[0];
      const dateStr = next.dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      summary = `Your next appointment is with Dr. ${next.doctorName || next.doctor_name || "-"} on ${dateStr}.`;
    } else {
      summary = `All caught up! No upcoming appointments.`;
    }
  } else {
    summary = `You have no appointments scheduled.`;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-8 mb-12 shadow-sm">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
        {patientName ? `Welcome back, ${patientName}!` : "Welcome!"}
      </h1>
      <div className="text-lg text-gray-600 leading-relaxed">{summary}</div>
    </div>
  );
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [currentSort, setCurrentSort] = useState("appointmentDate,startTime,desc");

  // Filter state
  const [currentStatus, setCurrentStatus] = useState("ALL");
  const [currentDateFilter, setCurrentDateFilter] = useState("all");

  const fetchAppointments = useCallback(async (page = 0, sort = "appointmentDate,startTime,desc", status = "ALL", dateFilter = "all") => {
    if (!user?.userId) return { appointments: [], totalPages: 0, totalElements: 0 };
    
    try {
      const response = await fetchPatientAppointments(user.userId, {
        page,
        size: pageSize,
        sort,
        status,
        dateFilter
      });
      
      // Extract appointments from the paginated response
      const appointmentsList = response._embedded?.patientAppointmentResponseList || [];
      const pageInfo = response.page || {};
      
      return {
        appointments: appointmentsList,
        totalPages: pageInfo.totalPages || 0,
        totalElements: pageInfo.totalElements || 0
      };
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      return { appointments: [], totalPages: 0, totalElements: 0 };
    }
  }, [user?.userId, pageSize]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter),
      fetchPatientProfile(user?.userId)
    ]).then(([apptsData, prof]) => {
      setAppointments(apptsData.appointments);
      setTotalPages(apptsData.totalPages);
      setTotalElements(apptsData.totalElements);
      setProfile(prof);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, fetchAppointments, currentPage, currentSort, currentStatus, currentDateFilter]);

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = async (newSort) => {
    setCurrentSort(newSort);
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  const handleFilterChange = async (filters) => {
    setCurrentStatus(filters.status);
    setCurrentDateFilter(filters.dateFilter);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  const handleBooked = async () => {
    setShowBooking(false);
    setSelectedDoctor(null);
    // Refresh appointments
    if (user?.userId) {
      const apptsData = await fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter);
      setAppointments(apptsData.appointments);
      setTotalPages(apptsData.totalPages);
      setTotalElements(apptsData.totalElements);
    }
  };

  const handleCancel = () => {
    setShowBooking(false);
    setSelectedDoctor(null);
  };

  // Stub action handler
  const handleAppointmentAction = async (action, appointment, updateData) => {
    if (action === "cancel") {
      try {
        await cancelAppointment(appointment.appointmentId);
        // Refresh appointments
        if (user?.userId) {
          const apptsData = await fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter);
          setAppointments(apptsData.appointments);
          setTotalPages(apptsData.totalPages);
          setTotalElements(apptsData.totalElements);
        }
      } catch (err) {
        if (err.response?.data?.status === "CANCELLED") {
          alert(err.response.data.error || "Appointment already cancelled");
        } else {
          alert("Failed to cancel appointment");
        }
      }
    } else if (action === "reschedule") {
      try {
        // Handle reschedule with the provided updateData
        await rescheduleAppointment(
          appointment.appointmentId,
          updateData.appointmentDate,
          updateData.startTime,
          updateData.endTime
        );
        
        // Refresh appointments list
        if (user?.userId) {
          const apptsData = await fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter);
          setAppointments(apptsData.appointments);
          setTotalPages(apptsData.totalPages);
          setTotalElements(apptsData.totalElements);
        }
      } catch (err) {
        console.error("Failed to reschedule:", err);
        throw err; // Re-throw to let child handle error display
      }
    } else if (action === "refresh") {
      // Legacy refresh support
      console.log(`Refresh triggered for appointment with ${appointment.doctorName || appointment.patientName}`);
      if (user?.userId) {
        const apptsData = await fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter);
        setAppointments(apptsData.appointments);
        setTotalPages(apptsData.totalPages);
        setTotalElements(apptsData.totalElements);
      }
    }
  };

  return (
    <>
      <SEO {...seoConfig.dashboard.patient} />
      <div className="max-w-5xl mx-auto mt-12 px-6">
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-600 text-lg">Loading your dashboard...</div>
      ) : (
        <>
          <DashboardHeader patientName={profile?.full_name || 'User'} appointments={appointments} />
          
          {/* Quick Actions Section */}
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02]"
                onClick={() => navigate("/find-therapist")}
              >
                Find a Therapist
              </button>
            </div>
          </div>
          
          {/* Appointments Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Appointments</h2>
            <AppointmentsPanel
              appointments={appointments}
              onAction={handleAppointmentAction}
              onJoinCall={appt => {
                // Navigate to the video preview page
                navigate(`/video-preview/${appt.appointmentId}/PATIENT`);
              }}
              currentUserId={user?.userId}
              userRole={user?.role}
              searchField="doctorName"
              searchPlaceholder="Search by doctor name..."
              // Pagination props
              isPaginated={true}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              currentSort={currentSort}
              // Filter props
              onFilterChange={handleFilterChange}
              currentStatus={currentStatus}
              currentDateFilter={currentDateFilter}
              // Hide search bar
              showSearch={false}
            />
          </div>
          

        </>
      )}
    </div>
    </>
  );
};

export default PatientDashboard;