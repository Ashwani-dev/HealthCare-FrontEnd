import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoCall from '../video/VideoCall';

const VideoCallPage = () => {
  const { appointmentId, userType, userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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