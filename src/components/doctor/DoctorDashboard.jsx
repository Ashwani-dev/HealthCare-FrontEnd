import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppointmentsPanel from "../common/AppointmentsPanel";
import { fetchDoctorAppointments, fetchDoctorAvailability, fetchDoctorProfile, cancelAppointment } from "../../api/api";


// DashboardHeader for Doctor
const DashboardHeader = ({ doctorLastName, appointmentsTodayCount, availableSlotsThisWeekCount }) => (
  <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
        Welcome, Dr. {doctorLastName}!
      </h1>
      <div className="text-blue-100 text-lg">
        Here's your quick overview for today and the week.
      </div>
    </div>
    <div className="flex gap-4 mt-4 md:mt-0">
      <div className="bg-white/90 rounded-lg shadow flex flex-col items-center px-6 py-3 min-w-[140px]">
        <span className="text-blue-700 text-2xl font-bold">{appointmentsTodayCount}</span>
        <span className="text-gray-700 text-sm font-medium">Appointments Today</span>
      </div>
      <div className="bg-white/90 rounded-lg shadow flex flex-col items-center px-6 py-3 min-w-[140px]">
        <span className="text-green-600 text-2xl font-bold">{availableSlotsThisWeekCount}</span>
        <span className="text-gray-700 text-sm font-medium">Available Slots This Week</span>
      </div>
    </div>
  </div>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [profile, setProfile] = useState(null);
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
      const response = await fetchDoctorAppointments(user.userId, {
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
      fetchDoctorAvailability(user?.userId),
      fetchDoctorProfile()
    ]).then(([apptsData, avail, prof]) => {
      setAppointments(apptsData.appointments);
      setTotalPages(apptsData.totalPages);
      setTotalElements(apptsData.totalElements);
      setAvailability(avail);
      setProfile(prof);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, fetchAppointments, currentPage, currentSort, currentStatus, currentDateFilter]);

  // Extract last name from profile or user
  const doctorLastName = profile?.full_name?.split(" ").slice(-1)[0] || user?.full_name?.split(" ").slice(-1)[0] || "";

  // Count today's appointments
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const appointmentsTodayCount = safeAppointments.filter(
    (appt) => appt.appointmentDate === today
  ).length;
  

  // Count available slots for the current week
  const availableSlotsThisWeekCount = Array.isArray(availability)
    ? availability.filter((slot) => slot.available).length
    : 0;
    
  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;

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

  // Stub action handler
  const handleAppointmentAction = async (action, appointment) => {
    if (action === "cancel") {
      try {
        const res = await cancelAppointment(appointment.appointmentId);
        // Refresh appointments
        if (user?.userId) {
          const apptsData = await fetchAppointments(currentPage, currentSort, currentStatus, currentDateFilter);
          setAppointments(apptsData.appointments);
          setTotalPages(apptsData.totalPages);
          setTotalElements(apptsData.totalElements);
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.status === "CANCELLED") {
          alert(err.response.data.error || "Appointment already cancelled");
        } else {
          alert("Failed to cancel appointment");
        }
      }
    } else {
      alert(`${action} clicked for appointment with ${appointment.patientName}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-6">
      <DashboardHeader
        doctorLastName={doctorLastName}
        appointmentsTodayCount={appointmentsTodayCount}
        availableSlotsThisWeekCount={availableSlotsThisWeekCount}
      />
      
      {/* Appointments Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Appointments</h2>
        <AppointmentsPanel
          appointments={safeAppointments}
          onAction={handleAppointmentAction}
                        onJoinCall={appt => {
                // Navigate to the video preview page
                navigate(`/video-preview/${appt.appointmentId}/DOCTOR`);
              }}
          currentUserId={user?.userId}
          userRole={user?.role}
          searchField="patientName"
          searchPlaceholder="Search by patient name..."
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
      

    </div>
  );
};

export default DoctorDashboard;
