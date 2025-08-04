import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import VideocamIcon from "@mui/icons-material/Videocam";
import { FaCalendarAlt, FaTrash, FaVideo, FaInfoCircle, FaEdit } from "react-icons/fa";
import { differenceInMinutes, parseISO, addMinutes, subMinutes, format } from "date-fns";

const STATUS_STYLES = {
  SCHEDULED: { color: "success.main", bg: "success.light" },
  PENDING: { color: "warning.main", bg: "warning.light" },
  CANCELLED: { color: "error.main", bg: "error.light" },
  COMPLETED: { color: "info.main", bg: "info.light" },
};

const MAX_REASON_LENGTH = 60;

// Helper function to convert 24-hour format to 12-hour AM/PM format
const formatTimeToAMPM = (time24) => {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Utility: Check if now is within joinable window
function isJoinable(appointmentDate, startTime) {
  try {
    // Combine date and time into ISO string
    const start = parseISO(`${appointmentDate}T${startTime}`);
    const now = new Date();
    const windowStart = subMinutes(start, 10);
    const windowEnd = addMinutes(start, 30);
    return now >= windowStart && now <= windowEnd;
  } catch {
    return false;
  }
}

const AppointmentCard = ({ appointment, onAction, onJoinCall }) => {
  const [expanded, setExpanded] = useState(false);
  const { doctorName, appointmentDate, startTime, endTime, status, description } = appointment;
  const statusStyle = STATUS_STYLES[status] || { color: "grey.700", bg: "grey.100" };
  const showExpand = description && description.length > MAX_REASON_LENGTH;
  const joinable = isJoinable(appointmentDate, startTime);

  return (
    <Card sx={{ 
      mb: 3, 
      boxShadow: 2, 
      borderRadius: 3,
      ':hover': { 
        boxShadow: 6, 
        backgroundColor: 'blue.50',
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
      },
      transition: 'all 0.2s ease-in-out'
    }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
        {/* Header with Doctor Name and Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Typography variant="h6" noWrap title={doctorName} sx={{ color: 'primary.dark', fontWeight: 600, fontSize: '1.25rem' }}>
            Dr. {doctorName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid`,
              borderColor: statusStyle.color,
            }}
          >
            {status}
          </Typography>
        </div>
        
        {/* Date & Time - More Prominent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FaCalendarAlt style={{ color: '#42a5f5', fontSize: '1.2rem' }} />
          <Typography variant="h6" sx={{ 
            color: 'text.primary', 
            fontWeight: 500, 
            fontSize: '1.1rem',
            lineHeight: 1.4
          }}>
            {format(parseISO(`${appointmentDate}T${startTime}`), 'EEEE, MMMM do, yyyy')}
          </Typography>
        </div>
        
        {/* Time Range - Also Prominent */}
        <Typography variant="h6" sx={{ 
          color: 'primary.main', 
          fontWeight: 600, 
          fontSize: '1.1rem',
          marginBottom: 12,
          marginLeft: 4
        }}>
          {formatTimeToAMPM(startTime)} - {formatTimeToAMPM(endTime)}
        </Typography>
        
        {/* Reason */}
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: 'text.primary' }}>Reason:</span>{' '}
          {showExpand && !expanded ? (
            <>
              {description.slice(0, MAX_REASON_LENGTH)}...{' '}
              <Button 
                size="small" 
                onClick={() => setExpanded(true)} 
                sx={{ 
                  textTransform: 'none', 
                  p: 0, 
                  minWidth: 0, 
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Read More
              </Button>
            </>
          ) : description}
          {showExpand && expanded && (
            <Button 
              size="small" 
              onClick={() => setExpanded(false)} 
              sx={{ 
                textTransform: 'none', 
                p: 0, 
                minWidth: 0, 
                ml: 1, 
                color: 'primary.main',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
              }}
            >
              Show Less
            </Button>
          )}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
        p: 3,
        pt: 0
      }}>
        {/* Join Call - Primary Action */}
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<VideocamIcon />}
          disabled={!joinable}
          onClick={() => onJoinCall && onJoinCall(appointment)}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 }
          }}
        >
          Join Call
        </Button>
        
        {/* Details - Secondary Action */}
        <Button
          variant="outlined"
          color="info"
          size="medium"
          startIcon={<FaInfoCircle />}
          onClick={() => onAction && onAction("view", appointment)}
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            borderColor: 'grey.300',
            color: 'grey.700',
            '&:hover': { 
              borderColor: 'info.main', 
              backgroundColor: 'info.50' 
            }
          }}
        >
          Details
        </Button>
        
        {/* Reschedule - Secondary Action */}
        <Button
          variant="outlined"
          color="warning"
          size="medium"
          startIcon={<FaEdit />}
          onClick={() => onAction && onAction("reschedule", appointment)}
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            borderColor: 'grey.300',
            color: 'grey.700',
            '&:hover': { 
              borderColor: 'warning.main', 
              backgroundColor: 'warning.50' 
            }
          }}
        >
          Reschedule
        </Button>
        
        {/* Cancel - Warning Action */}
        <Button
          variant="outlined"
          color="error"
          size="medium"
          startIcon={<FaTrash />}
          disabled={status === "COMPLETED"}
          onClick={() => onAction && onAction("cancel", appointment)}
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            borderColor: status === "COMPLETED" ? 'grey.200' : 'grey.300',
            color: status === "COMPLETED" ? 'grey.400' : 'grey.700',
            opacity: status === "COMPLETED" ? 0.5 : 1,
            cursor: status === "COMPLETED" ? "not-allowed" : "pointer",
            '&:hover': status === "COMPLETED" ? {} : { 
              borderColor: 'error.main', 
              backgroundColor: 'error.50' 
            }
          }}
        >
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
};

export default AppointmentCard; 