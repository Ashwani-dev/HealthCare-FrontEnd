import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import AppointmentsPanel from "../common/AppointmentsPanel";
import { fetchPatientAppointments, fetchPatientProfile, cancelAppointment, rescheduleAppointment } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";
import { Spinner } from "../ui";
import { formatTimeToAMPM } from "../../utils/dateTime";
import { 
  Activity, 
  Calendar, 
  Compass, 
  User, 
  Wallet, 
  ArrowRight 
} from "lucide-react";

// Refined dashboard header with calming colors and better spacing
const DashboardHeader = ({ patientName, appointments }) => {
  // Determine summary line
  let summary = "";
  let isUpcoming = false;
  let nextAppointment = null;
  
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
      nextAppointment = upcoming[0];
      const dateStr = nextAppointment.dateObj.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      summary = `Your next appointment is scheduled with Dr. ${nextAppointment.doctorName || nextAppointment.doctor_name || "-"} on ${dateStr}.`;
      isUpcoming = true;
    } else {
      summary = `All caught up! No upcoming appointments.`;
    }
  } else {
    summary = `You have no appointments scheduled.`;
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-3xl p-8 mb-10 overflow-hidden shadow-lg border border-blue-500/20">
      {/* Radial glow background blobs */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-grow">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
            Patient Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {patientName ? `Welcome back, ${patientName}!` : "Welcome!"}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base font-semibold max-w-xl">
            {summary}
          </p>
        </div>
        
        {isUpcoming && nextAppointment && (
          <div className="bg-white/10 border border-white/25 backdrop-blur-lg rounded-2xl p-4 w-full md:w-auto md:min-w-[220px] flex items-start gap-3 shadow-inner">
            <div className="p-2.5 bg-white/15 text-white rounded-xl border border-white/25 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Next Session</span>
              <h4 className="text-sm font-bold text-white">Dr. {nextAppointment.doctorName}</h4>
              <p className="text-xs text-blue-100 font-semibold">{formatTimeToAMPM(nextAppointment.startTime)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-100/30 pb-16">
        <div className="max-w-5xl mx-auto pt-8 px-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" text="Loading your dashboard..." />
            </div>
          ) : (
            <>
              <DashboardHeader patientName={profile?.full_name || 'User'} appointments={appointments} />
              
              {/* Quick Actions Panel */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Action 1: Find Therapist */}
                  <div 
                    onClick={() => navigate("/find-therapist")}
                    className="group relative bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">Find a Therapist</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Browse and book licensed mental health experts.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Explore Practitioners</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Action 2: Billing & Payments */}
                  <div 
                    onClick={() => navigate("/payments")}
                    className="group relative bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-amber-600 transition-colors">Billing & Payments</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Review your payment details and billing history.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>View Transaction History</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Action 3: Profile Settings */}
                  <div 
                    onClick={() => navigate("/profile")}
                    className="group relative bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors">Profile Settings</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Update your medical records and contact info.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Manage Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Appointments Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Appointments</h2>
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
      </div>
    </>
  );
};

export default PatientDashboard;