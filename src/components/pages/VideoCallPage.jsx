import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoCall from '../common/VideoCall';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const VideoCallPage = () => {
  const { appointmentId, userType, userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <Box sx={{ 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)"
      }}>
        <Typography variant="h6" sx={{ color: "#2C3E50" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Validate userType parameter
  const validUserTypes = ['DOCTOR', 'PATIENT'];
  if (!validUserTypes.includes(userType?.toUpperCase())) {
    return (
      <Box sx={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        p: 2
      }}>
        <Typography variant="h5" sx={{ color: "#E74C3C", mb: 2 }}>
          Invalid User Type
        </Typography>
        <Typography variant="body1" sx={{ color: "#7F8C8D", mb: 3, textAlign: "center" }}>
          The specified user type is not valid. Please check the URL and try again.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            '&:hover': {
              background: "linear-gradient(135deg, #357ABD 0%, #2C5F9E 100%)"
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Validate that the user type matches the logged-in user's role
  const userRole = user.role?.toUpperCase();
  if (userType?.toUpperCase() !== userRole) {
    return (
      <Box sx={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        p: 2
      }}>
        <Typography variant="h5" sx={{ color: "#E74C3C", mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: "#7F8C8D", mb: 3, textAlign: "center" }}>
          You don't have permission to access this video call as a {userType?.toLowerCase()}.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            '&:hover': {
              background: "linear-gradient(135deg, #357ABD 0%, #2C5F9E 100%)"
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Validate that the userId matches the logged-in user
  if (userId !== user.userId?.toString()) {
    return (
      <Box sx={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        p: 2
      }}>
        <Typography variant="h5" sx={{ color: "#E74C3C", mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: "#7F8C8D", mb: 3, textAlign: "center" }}>
          You don't have permission to access this video call.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            '&:hover': {
              background: "linear-gradient(135deg, #357ABD 0%, #2C5F9E 100%)"
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Handle end call - navigate back to dashboard
  const handleEndCall = () => {
    navigate('/dashboard');
  };

  return (
    <VideoCall
      appointmentId={appointmentId}
      userType={userType?.toUpperCase()}
      userId={userId}
      onEnd={handleEndCall}
    />
  );
};

export default VideoCallPage; 