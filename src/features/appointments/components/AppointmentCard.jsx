import React, { useState } from "react";
import { 
  Card, CardContent, CardActions, Button, Typography, 
  Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Snackbar, Alert, Box, Divider, Chip,
  CircularProgress, IconButton, useMediaQuery, useTheme
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import CloseIcon from "@mui/icons-material/Close";
import { FaCalendarAlt, FaTrash, FaEdit, FaClock } from "react-icons/fa";
import { differenceInMinutes, parseISO, addMinutes, subMinutes, format, addDays } from "date-fns";
import { formatTimeToAMPM } from "@/utils/dateTime";
import { fetchDoctorAvailability, fetchDoctorAvailableSlots } from "@/api/api";

const STATUS_STYLES = {
  SCHEDULED: { color: "#0f766e", bg: "#f0fdfa", border: "#ccfbf1", accent: "#0d9488" },
  PENDING: { color: "#b45309", bg: "#fffbeb", border: "#fef3c7", accent: "#d97706" },
  CANCELLED: { color: "#b91c1c", bg: "#fef2f2", border: "#fee2e2", accent: "#dc2626" },
  COMPLETED: { color: "#1e3a8a", bg: "#eff6ff", border: "#dbeafe", accent: "#3b82f6" },
};

const MAX_REASON_LENGTH = 80;

function isJoinable(appointmentDate, startTime) {
  try {
    const start = parseISO(`${appointmentDate}T${startTime}`);
    const now = new Date();
    const windowStart = subMinutes(start, 10);
    const windowEnd = addMinutes(start, 30);
    return now >= windowStart && now <= windowEnd;
  } catch {
    return false;
  }
}

function getJoinTooltip(joinable, status) {
  if (status === "CANCELLED") return "This appointment has been cancelled";
  if (status === "COMPLETED") return "This session is already finished";
  if (joinable) return "Click to enter the consultation room";
  return "Link becomes active 10 minutes before the scheduled start time";
}

const AppointmentCard = ({ appointment, onAction, onJoinCall, currentUserId, userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expanded, setExpanded] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Reschedule state
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

  const { doctorName, appointmentDate, startTime, endTime, status, description } = appointment;
  const statusTheme = STATUS_STYLES[status] || { color: "#546e7a", bg: "#f5f7f9", border: "#cfd8dc", accent: "#90a4ae" };
  
  const showExpand = description && description.length > MAX_REASON_LENGTH;
  const appointmentDateTime = parseISO(`${appointmentDate}T${startTime}`);
  
  const joinable = isJoinable(appointmentDate, startTime) && status === "SCHEDULED";
  const isWithin24Hours = differenceInMinutes(appointmentDateTime, new Date()) < 24 * 60;
  const normalizedRole = userRole?.toLowerCase?.() || "";
  
  // Check if appointment belongs to current user
  const appointmentPatientId = appointment.patientId ?? appointment.patient_id ?? appointment.patient?.id;
  const appointmentDoctorId = appointment.doctorId ?? appointment.doctor_id ?? appointment.doctor?.id;
  
  const belongsToCurrentUser = 
    (normalizedRole === "patient" && String(appointmentPatientId) === String(currentUserId)) ||
    (normalizedRole === "doctor" && String(appointmentDoctorId) === String(currentUserId));
  
  const canCancel = status === "SCHEDULED" && belongsToCurrentUser && !isWithin24Hours;
  const canReschedule = status === "SCHEDULED" && belongsToCurrentUser && !isWithin24Hours;

  const handleConfirmCancel = () => {
    onAction && onAction("cancel", appointment);
    setOpenCancelDialog(false);
    setSnackbar({ open: true, message: "Appointment cancelled successfully.", severity: "success" });
  };

  // Step 1: Open dialog and fetch doctor's weekly availability
  const handleOpenReschedule = async () => {
    setOpenRescheduleDialog(true);
    setLoadingAvailability(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setTimeSlots([]);
    
    try {
      const doctorId = appointment.doctorId || appointment.doctor_id || appointment.doctor?.id;
      const availData = await fetchDoctorAvailability(doctorId);
      setAvailability(availData || []);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to load doctor's availability. Please try again.", 
        severity: "error" 
      });
      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Generate next 14 days based on doctor's availability
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = format(date, 'EEEE').toUpperCase();
      
      // Check if doctor has slots on this day
      const hasSlots = availability.some(slot => 
        slot.dayOfWeek === dayOfWeek && (slot.isAvailable || slot.available)
      );
      
      if (hasSlots) {
        dates.push({
          date: dateStr,
          display: format(date, 'EEE, MMM d'),
          dayOfWeek: dayOfWeek
        });
      }
    }
    return dates;
  };

  // Step 2: When user clicks a date, fetch available time slots for that specific date
  const handleDateSelect = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setTimeSlots([]);

    try {
      const doctorId = appointment.doctorId || appointment.doctor_id || appointment.doctor?.id;
      const slots = await fetchDoctorAvailableSlots(doctorId, dateStr);
      setTimeSlots(slots || []);
      
      if (!slots || slots.length === 0) {
        setSnackbar({ 
          open: true, 
          message: "No available slots for this date", 
          severity: "info" 
        });
      }
    } catch (error) {
      console.error("Failed to fetch time slots:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to load time slots. Please try again.", 
        severity: "error" 
      });
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedSlot) {
      setSnackbar({ 
        open: true, 
        message: "Please select both date and time slot", 
        severity: "warning" 
      });
      return;
    }

    setRescheduling(true);
    
    // Call onAction with reschedule data - let parent handle the API call
    if (onAction) {
      try {
        await onAction("reschedule", appointment, {
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime
        });
        
        setSnackbar({ 
          open: true, 
          message: "Appointment rescheduled successfully!", 
          severity: "success" 
        });
        
        setOpenRescheduleDialog(false);
        setSelectedDate(null);
        setSelectedSlot(null);
        setTimeSlots([]);
      } catch (error) {
        console.error("Reschedule error:", error);
        const errorMsg = error?.message || "Failed to reschedule appointment";
        setSnackbar({ 
          open: true, 
          message: errorMsg, 
          severity: "error" 
        });
      }
    }
    
    setRescheduling(false);
  };

  const getCancelTooltip = () => {
    if (canCancel) return "Cancel appointment";
    if (status !== "SCHEDULED") return "Only scheduled sessions can be cancelled";
    if (!belongsToCurrentUser) return "You can only cancel your own appointments";
    if (isWithin24Hours) return "Cancellations restricted within 24 hours";
    return "Action unavailable";
  };

  const getRescheduleTooltip = () => {
    if (canReschedule) return "Reschedule appointment";
    if (status !== "SCHEDULED") return "Only scheduled sessions can be rescheduled";
    if (!belongsToCurrentUser) return "You can only reschedule your own appointments";
    if (isWithin24Hours) return "Rescheduling restricted within 24 hours";
    return "Action unavailable";
  };

  const availableDates = getAvailableDates();

  return (
    <>
      <Card sx={{ 
        mb: { xs: 2, sm: 3 }, 
        borderRadius: { xs: 3, md: 4 }, 
        overflow: 'hidden',
        borderLeft: `6px solid ${statusTheme.accent}`, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.02)",
        backgroundColor: "#ffffff",
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #f1f5f9',
        borderLeftWidth: '6px',
        '&:hover': { 
          boxShadow: "0 10px 25px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
          {/* Header Section - Mobile Optimized */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 1.5, sm: 2 }} mb={{ xs: 1.5, sm: 2 }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <Typography variant="overline" color="#4f46e5" fontWeight={800} sx={{ letterSpacing: 1.5, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                  {normalizedRole === "doctor" ? "PATIENT" : "THERAPIST"}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.45rem' } }}>
                {normalizedRole === "doctor" ? (appointment.patientName || "Patient") : `Dr. ${doctorName}`}
              </Typography>
            </Box>
            <Chip 
              label={status} 
              size="small" 
              sx={{ 
                bgcolor: statusTheme.bg, 
                color: statusTheme.color, 
                fontWeight: 700, 
                borderRadius: '6px', 
                border: `1px solid ${statusTheme.border}`, 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '24px', sm: '28px' }
              }} 
            />
          </Box>

          <Divider sx={{ my: { xs: 1.5, sm: 2 }, opacity: 0.4 }} />

          {/* Date & Time Info - Mobile Optimized */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 1.5, sm: 3, md: 6 }} mb={{ xs: 2, sm: 2.5 }}>
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 1.5 }}>
              <Box sx={{ color: '#008a7b', display: 'flex' }}><FaCalendarAlt size={isMobile ? 16 : 18} /></Box>
              <Box>
                <Typography variant="caption" color="#90a4ae" display="block" fontWeight={700} sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>DATE</Typography>
                <Typography variant="body2" fontWeight={700} color="#455a64" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  {format(appointmentDateTime, isMobile ? 'MMM d, yyyy' : 'EEEE, MMM do, yyyy')}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 1.5 }}>
              <Box sx={{ color: '#7e57c2', display: 'flex' }}><FaClock size={isMobile ? 16 : 18} /></Box>
              <Box>
                <Typography variant="caption" color="#90a4ae" display="block" fontWeight={700} sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>TIME SLOT</Typography>
                <Typography variant="body2" fontWeight={700} color="#455a64" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  {formatTimeToAMPM(startTime)} — {formatTimeToAMPM(endTime)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Description/Notes - Mobile Optimized */}
          <Box sx={{ bgcolor: '#f8fafc', p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#455a64', lineHeight: 1.6, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              <Box component="span" fontWeight={800} color="#94a3b8" mr={1} sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>NOTES:</Box>
              {showExpand && !expanded ? `${description.slice(0, MAX_REASON_LENGTH)}...` : description}
              {showExpand && (
                <Button 
                  size="small" 
                  onClick={() => setExpanded(!expanded)} 
                  sx={{ 
                    textTransform: 'none', 
                    ml: 0.5, 
                    fontWeight: 800, 
                    minWidth: 0, 
                    p: 0, 
                    color: '#2563eb',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }}
                >
                  {expanded ? "Less" : "View More"}
                </Button>
              )}
            </Typography>
          </Box>
        </CardContent>

        {/* Action Buttons - Mobile Optimized with better alignment */}
        <CardActions sx={{ 
          px: { xs: 2, sm: 2.5, md: 3 }, 
          pb: { xs: 2, sm: 2.5, md: 3 }, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: { xs: 1.5, sm: 2 }, 
          justifyContent: 'space-between', 
          pt: 0 
        }}>
          
          {/* Left Side: Cancel & Reschedule Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 1.5, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            {/* Cancel Button - Consistent sizing */}
            <Tooltip title={getCancelTooltip()} arrow placement="top">
              <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '120px' } }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  disabled={!canCancel} 
                  onClick={() => setOpenCancelDialog(true)} 
                  startIcon={<FaTrash size={isMobile ? 12 : 14} />}
                  sx={{ 
                    fontWeight: 700, 
                    textTransform: 'none', 
                    borderRadius: 2.5,
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    color: canCancel ? '#ef4444' : '#cfd8dc',
                    borderColor: canCancel ? '#fee2e2' : '#f1f5f9',
                    '&:hover': { 
                      bgcolor: '#fef2f2',
                      borderColor: '#ef4444' 
                    },
                    '&.Mui-disabled': {
                      borderColor: '#f8fafc',
                      color: '#cbd5e1'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Tooltip>

            {/* Reschedule Button - Consistent sizing */}
            <Tooltip title={getRescheduleTooltip()} arrow placement="top">
              <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '140px' } }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  disabled={!canReschedule}
                  onClick={handleOpenReschedule} 
                  startIcon={<FaEdit size={isMobile ? 12 : 14} />}
                  sx={{ 
                    borderRadius: 2.5, 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    color: canReschedule ? '#4f46e5' : '#cfd8dc', 
                    borderColor: canReschedule ? '#e0e7ff' : '#f1f5f9', 
                    '&:hover': { borderColor: '#4f46e5', bgcolor: '#f5f3ff' },
                    '&.Mui-disabled': {
                      borderColor: '#f8fafc',
                      color: '#cbd5e1'
                    }
                  }}
                >
                  Reschedule
                </Button>
              </Box>
            </Tooltip>
          </Box>

          {/* Right Side: Join Call Button */}
          <Tooltip title={getJoinTooltip(joinable, status)} arrow placement="top">
            <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '180px' } }}>
              <Button 
                variant="contained" 
                fullWidth
                disableElevation 
                disabled={!joinable} 
                onClick={() => onJoinCall?.(appointment)} 
                startIcon={<VideocamIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem' } }} />}
                sx={{ 
                  borderRadius: 2.5, 
                  textTransform: 'none', 
                  fontWeight: 700, 
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  bgcolor: joinable ? '#283593' : '#e2e8f0', 
                  backgroundImage: joinable ? 'linear-gradient(to right, #4f46e5, #3b82f6)' : 'none',
                  color: joinable ? '#ffffff' : '#94a3b8',
                  boxShadow: joinable ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none',
                  '&:hover': { 
                    bgcolor: '#1a237e',
                    backgroundImage: joinable ? 'linear-gradient(to right, #4338ca, #2563eb)' : 'none',
                    boxShadow: joinable ? '0 6px 20px rgba(79, 70, 229, 0.6)' : 'none',
                  },
                  animation: joinable ? 'pulse-glow 2s infinite ease-in-out' : 'none',
                  '@keyframes pulse-glow': {
                    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' },
                    '50%': { transform: 'scale(1.02)', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.55)' },
                  },
                  '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' } 
                }}
              >
                Join Consultation
              </Button>
            </Box>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Cancel Dialog - Mobile Optimized */}
      <Dialog 
        open={openCancelDialog} 
        onClose={() => setOpenCancelDialog(false)}
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: { 
              borderRadius: isMobile ? 0 : 3,
              m: isMobile ? 0 : 2
            }
          }
        }}
      >
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setOpenCancelDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <DialogTitle sx={{ fontWeight: 800, pt: isMobile ? 2 : 3, px: { xs: 2, sm: 3 }, color: '#283593', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Confirm Cancellation
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ color: '#64748b', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            Are you sure you want to cancel your session with <strong>{normalizedRole === "doctor" ? appointment.patientName : `Dr. ${doctorName}`}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button 
            onClick={() => setOpenCancelDialog(false)} 
            fullWidth={isMobile}
            sx={{ color: '#94a3b8', fontWeight: 700, py: { xs: 1.25, sm: 1 } }}
          >
            No, Keep It
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            variant="contained" 
            disableElevation 
            color="error" 
            fullWidth={isMobile}
            sx={{ borderRadius: 1.5, fontWeight: 700, py: { xs: 1.25, sm: 1 } }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog - Mobile Optimized */}
      <Dialog 
        open={openRescheduleDialog} 
        onClose={() => !rescheduling && setOpenRescheduleDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: { 
              borderRadius: isMobile ? 0 : 3, 
              p: isMobile ? 0 : 2,
              m: isMobile ? 0 : 2
            }
          }
        }}
      >
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={800} color="#283593">
              Reschedule Appointment
            </Typography>
            <IconButton onClick={() => !rescheduling && setOpenRescheduleDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        
        {!isMobile && (
          <DialogTitle sx={{ fontWeight: 800, pt: 2, color: '#283593', pb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Reschedule Appointment
          </DialogTitle>
        )}
        
        <DialogContent sx={{ pt: isMobile ? 2 : 2, px: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ color: '#64748b', mb: 3, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            Select a new date and time for your appointment with <strong>{normalizedRole === "doctor" ? appointment.patientName : `Dr. ${doctorName}`}</strong>
          </DialogContentText>

          {loadingAvailability ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 150, sm: 200 }, flexDirection: 'column', gap: 2 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
              <Typography color="text.secondary" fontSize={{ xs: '0.85rem', sm: '0.875rem' }}>Loading doctor's availability...</Typography>
            </Box>
          ) : availableDates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
              <Typography color="text.secondary" fontSize={{ xs: '0.9rem', sm: '1rem' }}>No available dates found for the next 14 days.</Typography>
            </Box>
          ) : (
            <Box>
              {/* Date Selection - Mobile Optimized */}
              <Box mb={{ xs: 2.5, sm: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="#475569" fontSize={{ xs: '0.9rem', sm: '1rem' }}>
                  Select New Date
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(120px, 1fr))' },
                  gap: { xs: 1.25, sm: 1.5 }, 
                  maxHeight: { xs: 250, sm: 300 }, 
                  overflowY: 'auto', 
                  pr: 1 
                }}>
                  {availableDates.map((dateObj) => (
                    <Button
                      key={dateObj.date}
                      variant={selectedDate === dateObj.date ? "contained" : "outlined"}
                      onClick={() => handleDateSelect(dateObj.date)}
                      sx={{
                        py: { xs: 1.25, sm: 1.5 },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        ...(selectedDate === dateObj.date && {
                          bgcolor: '#283593',
                          '&:hover': { bgcolor: '#1a237e' }
                        })
                      }}
                    >
                      {dateObj.display}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Time Slot Selection - Mobile Optimized */}
              {selectedDate && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="#475569" fontSize={{ xs: '0.9rem', sm: '1rem' }}>
                    Select New Time
                  </Typography>
                  {loadingSlots ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 80, sm: 100 }, flexDirection: 'column', gap: 1 }}>
                      <CircularProgress size={isMobile ? 24 : 32} />
                      <Typography color="text.secondary" fontSize={{ xs: '0.8rem', sm: '0.875rem' }}>Loading available slots...</Typography>
                    </Box>
                  ) : timeSlots.length > 0 ? (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(auto-fill, minmax(100px, 1fr))' },
                      gap: { xs: 1.25, sm: 1.5 }, 
                      maxHeight: { xs: 200, sm: 250 }, 
                      overflowY: 'auto', 
                      pr: 1 
                    }}>
                      {timeSlots.map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={selectedSlot?.startTime === slot.startTime ? "contained" : "outlined"}
                          onClick={() => setSelectedSlot(slot)}
                          sx={{
                            py: { xs: 1.25, sm: 1.5 },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            ...(selectedSlot?.startTime === slot.startTime && {
                              bgcolor: '#008a7b',
                              '&:hover': { bgcolor: '#006d5b' }
                            })
                          }}
                        >
                          {formatTimeToAMPM(slot.startTime)}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary" fontSize={{ xs: '0.85rem', sm: '0.875rem' }} textAlign="center" py={2}>
                      No available time slots for this date
                    </Typography>
                  )}
                </Box>
              )}

              {!selectedDate && (
                <Typography color="text.secondary" fontSize={{ xs: '0.85rem', sm: '0.875rem' }} textAlign="center" mt={2}>
                  Please select a date to view available time slots
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          pb: { xs: 2, sm: 2 }, 
          px: { xs: 2, sm: 3 }, 
          gap: { xs: 1.25, sm: 1.5 }, 
          pt: 2,
          flexDirection: { xs: 'column-reverse', sm: 'row' }
        }}>
          <Button 
            onClick={() => {
              setOpenRescheduleDialog(false);
              setSelectedDate(null);
              setSelectedSlot(null);
              setTimeSlots([]);
            }} 
            disabled={rescheduling}
            fullWidth={isMobile}
            sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'none', py: { xs: 1.25, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReschedule} 
            variant="contained" 
            disableElevation 
            disabled={!selectedDate || !selectedSlot || rescheduling}
            startIcon={rescheduling ? <CircularProgress size={16} color="inherit" /> : null}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 700, 
              textTransform: 'none',
              bgcolor: '#283593',
              '&:hover': { bgcolor: '#1a237e' },
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.25, sm: 1 }
            }}
          >
            {rescheduling ? "Updating..." : "Confirm Reschedule"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar - Mobile Optimized */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          bottom: { xs: 80, sm: 24 }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ 
            borderRadius: 1.5, 
            fontWeight: 700,
            fontSize: { xs: '0.85rem', sm: '0.875rem' },
            width: { xs: '90vw', sm: 'auto' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentCard;