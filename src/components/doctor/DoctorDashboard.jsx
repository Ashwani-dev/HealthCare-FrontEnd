import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppointmentsPanel from "../common/AppointmentsPanel";
import { fetchDoctorAppointments, fetchDoctorAvailability, fetchDoctorProfile, cancelAppointment, rescheduleAppointment } from "../../api/api";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";
import { Spinner } from "../ui";
import { Activity } from "lucide-react";

// DashboardHeader for Doctor
const DashboardHeader = ({ doctorLastName, appointmentsTodayCount, availableSlotsThisWeekCount }) => (
  <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-3xl p-8 mb-10 overflow-hidden shadow-lg border border-blue-500/20">
    {/* Radial glow background blobs */}
    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="space-y-3 flex-grow">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
          Practitioner Workspace
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome, Dr. {doctorLastName}!
        </h1>
        <p className="text-blue-100 text-sm sm:text-base font-semibold max-w-xl">
          Here is your overview of appointments and availability settings for this week.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 md:mt-0 w-full md:w-auto">
        <div className="bg-white/10 border border-white/25 backdrop-blur-lg rounded-2xl px-4 sm:px-6 py-4 flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px] hover:bg-white/15 transition-all duration-300 shadow-sm shadow-inner">
          <span className="text-white text-2xl sm:text-3xl font-black">{appointmentsTodayCount}</span>
          <span className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 text-center">Appointments Today</span>
        </div>
        <div className="bg-white/10 border border-white/25 backdrop-blur-lg rounded-2xl px-4 sm:px-6 py-4 flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px] hover:bg-white/15 transition-all duration-300 shadow-sm shadow-inner">
          <span className="text-white text-2xl sm:text-3xl font-black">{availableSlotsThisWeekCount}</span>
          <span className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 text-center">Available Slots</span>
        </div>
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
    (appt) => appt.appointmentStartDate === today
  ).length;
  

  // Count available slots for the current week
  const availableSlotsThisWeekCount = Array.isArray(availability)
    ? availability.filter((slot) => slot.isAvailable || slot.available).length
    : 0;
    
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" text="Loading dashboard..." />
    </div>
  );

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
      <SEO {...seoConfig.dashboard.doctor} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-100/30 pb-16">
        <div className="max-w-5xl mx-auto pt-8 px-6">
          <DashboardHeader
            doctorLastName={doctorLastName}
            appointmentsTodayCount={appointmentsTodayCount}
            availableSlotsThisWeekCount={availableSlotsThisWeekCount}
          />
          
          {/* Appointments Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Appointments</h2>
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
      </div>
    </>
  );
};

export default DoctorDashboard;
