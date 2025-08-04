import React, { useState } from "react";
import VideoCallPreview from "./VideoCallPreview";
import VideoCall from "./VideoCall";

/**
 * VideoCallWrapper component that manages preview and actual call states.
 * 
 * Props:
 * - appointmentId: number/string
 * - userType: 'DOCTOR' | 'PATIENT'
 * - userId: number/string
 * - onEnd: function to call when call ends
 */
const VideoCallWrapper = ({ appointmentId, userType, userId, onEnd }) => {
  const [isInCall, setIsInCall] = useState(false);

  const handleJoinCall = () => {
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    if (onEnd) {
      onEnd();
    }
  };

  if (isInCall) {
    return (
      <VideoCall
        appointmentId={appointmentId}
        userType={userType}
        userId={userId}
        onEnd={handleEndCall}
      />
    );
  }

  return (
    <VideoCallPreview
      userType={userType}
      onJoinCall={handleJoinCall}
    />
  );
};

export default VideoCallWrapper; 