import React, { useState } from "react";
import { 
  Card, CardContent, CardActions, Button, Typography, 
  Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Snackbar, Alert, Box, Divider, Chip 
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import { FaCalendarAlt, FaTrash, FaEdit, FaClock } from "react-icons/fa";
import { differenceInMinutes, parseISO, addMinutes, subMinutes, format } from "date-fns";
import { formatTimeToAMPM } from "../../utils/dateTime";

const STATUS_STYLES = {
  SCHEDULED: { color: "#008a7b", bg: "#e0f2f1", border: "#b2dfdb", accent: "#00bfa5" },
  PENDING: { color: "#f57c00", bg: "#fff3e0", border: "#ffe0b2", accent: "#ffb74d" },
  CANCELLED: { color: "#d32f2f", bg: "#ffebee", border: "#ffcdd2", accent: "#ef5350" },
  COMPLETED: { color: "#283593", bg: "#e8eaf6", border: "#c5cae9", accent: "#3f51b5" },
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
  const [expanded, setExpanded] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const { doctorName, appointmentDate, startTime, endTime, status, description } = appointment;
  const theme = STATUS_STYLES[status] || { color: "#546e7a", bg: "#f5f7f9", border: "#cfd8dc", accent: "#90a4ae" };
  
  const showExpand = description && description.length > MAX_REASON_LENGTH;
  const appointmentDateTime = parseISO(`${appointmentDate}T${startTime}`);
  
  const joinable = isJoinable(appointmentDate, startTime) && status === "SCHEDULED";
  const isWithin24Hours = differenceInMinutes(appointmentDateTime, new Date()) < 24 * 60;
  const normalizedRole = userRole?.toLowerCase?.() || "";
  const appointmentPatientId = appointment.patientId ?? appointment.patient_id ?? appointment.patient?.id;
  const belongsToCurrentUser = normalizedRole === "patient" ? String(appointmentPatientId) === String(currentUserId) : false;
  const canCancel = status === "SCHEDULED" && normalizedRole === "patient" && belongsToCurrentUser && !isWithin24Hours;

  const handleConfirmCancel = () => {
    onAction && onAction("cancel", appointment);
    setOpenCancelDialog(false);
    setSnackbar({ open: true, message: "Appointment cancelled successfully." });
  };

  const getCancelTooltip = () => {
    if (canCancel) return "Cancel appointment";
    if (status !== "SCHEDULED") return "Only scheduled sessions can be cancelled";
    if (isWithin24Hours) return "Cancellations restricted within 24 hours";
    return "Action unavailable";
  };

  return (
    <>
      <Card sx={{ 
        mb: 3, borderRadius: { xs: 2, md: 3 }, overflow: 'hidden',
        borderLeft: `5px solid ${theme.accent}`, 
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        backgroundColor: "#ffffff",
        transition: 'all 0.2s ease-in-out',
        '&:hover': { boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
            <Box>
              <Typography variant="overline" color="#78909c" fontWeight={800} sx={{ letterSpacing: 1.2, fontSize: '0.65rem' }}>PRACTITIONER</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#283593', fontSize: { xs: '1.25rem', md: '1.45rem' } }}>Dr. {doctorName}</Typography>
            </Box>
            <Chip label={status} size="small" sx={{ bgcolor: theme.bg, color: theme.color, fontWeight: 700, borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '0.75rem' }} />
          </Box>

          <Divider sx={{ my: 2, opacity: 0.4 }} />

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, md: 6 }} mb={2.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: '#008a7b', display: 'flex' }}><FaCalendarAlt size={18} /></Box>
              <Box>
                <Typography variant="caption" color="#90a4ae" display="block" fontWeight={700} sx={{ fontSize: '0.65rem' }}>DATE</Typography>
                <Typography variant="body2" fontWeight={700} color="#455a64">{format(appointmentDateTime, 'EEEE, MMM do, yyyy')}</Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: '#7e57c2', display: 'flex' }}><FaClock size={18} /></Box>
              <Box>
                <Typography variant="caption" color="#90a4ae" display="block" fontWeight={700} sx={{ fontSize: '0.65rem' }}>TIME SLOT</Typography>
                <Typography variant="body2" fontWeight={700} color="#455a64">{formatTimeToAMPM(startTime)} — {formatTimeToAMPM(endTime)}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px dashed #e2e8f0' }}>
            <Typography variant="body2" sx={{ color: '#455a64', lineHeight: 1.6, fontSize: '0.875rem' }}>
              <Box component="span" fontWeight={800} color="#94a3b8" mr={1} sx={{ fontSize: '0.7rem' }}>NOTES:</Box>
              {showExpand && !expanded ? `${description.slice(0, MAX_REASON_LENGTH)}...` : description}
              {showExpand && (
                <Button size="small" onClick={() => setExpanded(!expanded)} sx={{ textTransform: 'none', ml: 0.5, fontWeight: 800, minWidth: 0, p: 0, color: '#2563eb' }}>
                  {expanded ? "Less" : "View More"}
                </Button>
              )}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end', pt: 0 }}>
          
          {/* Cancel Button with Border and Radius */}
          <Tooltip title={getCancelTooltip()} arrow placement="top">
            <Box sx={{ width: { xs: '50%', sm: 'auto' } }}>
              <Button 
                variant="outlined" 
                fullWidth 
                disabled={!canCancel} 
                onClick={() => setOpenCancelDialog(true)} 
                startIcon={<FaTrash size={12} />}
                sx={{ 
                  fontWeight: 700, 
                  textTransform: 'none', 
                  borderRadius: 1.5, // Added radius
                  px: 3,
                  color: canCancel ? '#ef5350' : '#cfd8dc',
                  borderColor: canCancel ? '#ffcdd2' : '#f1f1f1', // Added border color
                  '&:hover': { 
                    bgcolor: '#fff5f5',
                    borderColor: '#ef5350' 
                  },
                  '&.Mui-disabled': {
                    borderColor: '#f1f1f1',
                    color: '#cfd8dc'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Tooltip>

          <Button 
            variant="outlined" 
            fullWidth={{ xs: true, sm: false }} 
            onClick={() => onAction("reschedule", appointment)} 
            startIcon={<FaEdit size={12} />}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, color: '#475569', borderColor: '#cbd5e1', px: 3, '&:hover': { borderColor: '#283593', bgcolor: '#f0f2ff' } }}
          >
            Reschedule
          </Button>

          <Tooltip title={getJoinTooltip(joinable, status)} arrow placement="top">
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button 
                variant="contained" 
                fullWidth={{ xs: true, sm: false }} 
                disableElevation 
                disabled={!joinable} 
                onClick={() => onJoinCall?.(appointment)} 
                startIcon={<VideocamIcon />}
                sx={{ 
                  borderRadius: 1.5, textTransform: 'none', fontWeight: 700, px: 4, bgcolor: '#283593', 
                  '&:hover': { bgcolor: '#1a237e' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' } 
                }}
              >
                Join Consultation
              </Button>
            </Box>
          </Tooltip>
        </CardActions>
      </Card>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pt: 3, color: '#283593' }}>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>Are you sure you want to cancel your session with <strong>Dr. {doctorName}</strong>?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
          <Button onClick={() => setOpenCancelDialog(false)} sx={{ color: '#94a3b8', fontWeight: 700 }}>No, Keep It</Button>
          <Button onClick={handleConfirmCancel} variant="contained" disableElevation color="error" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Yes, Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 1.5, fontWeight: 700 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentCard;