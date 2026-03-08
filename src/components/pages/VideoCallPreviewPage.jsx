import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VideoCallPreviewPage = () => {
  const { appointmentId, userType } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Media stream states
  const [localStream, setLocalStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const videoRef = useRef(null);

  // Initialize media devices
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setMediaError('Unable to access camera/microphone. Please check permissions.');
      }
    };

    if (!loading && user) {
      initializeMedia();
    }

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, user]);

  // Sync video element with stream when camera state changes
  useEffect(() => {
    if (localStream && videoRef.current && isCameraEnabled) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraEnabled]);

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicEnabled;
        setIsMicEnabled(!isMicEnabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !isCameraEnabled;
        videoTrack.enabled = newState;
        setIsCameraEnabled(newState);
        
        // Ensure video element updates when re-enabling camera
        if (newState && videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      }
    }
  };

  // Handle join call
  const handleJoinCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate(`/video-call/${appointmentId}/${userType}/${user.userId}`);
  };

  // Handle go back
  const handleGoBack = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mb-4"></div>
          <p className="text-lg text-[#1E293B]">Loading...</p>
        </div>
      </div>
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
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-4">Invalid User Type</h1>
          <p className="text-[#64748B] mb-6">The specified user type is not valid.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Validate user role
  const userRole = user.role?.toUpperCase();
  if (userType?.toUpperCase() !== userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-4">Access Denied</h1>
          <p className="text-[#64748B] mb-6">You don't have permission to access this preview.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Camera Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DBEAFE] rounded-full mb-4">
              <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-[#1E293B] mb-3">
              Test Your Camera & Microphone
            </h1>
            
            {/* Helper Text */}
            <p className="text-[#64748B] text-sm max-w-md mx-auto">
              Make sure your devices are working properly before joining the consultation session
            </p>
          </div>

          {/* Video Preview Container */}
          <div className="relative bg-[#111827] rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            {/* Video element - always rendered but hidden when camera is off */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraEnabled ? 'hidden' : ''}`}
            />
            
            {/* Camera Off State */}
            {!isCameraEnabled && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#111827]">
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#9CA3AF] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  <p className="text-[#9CA3AF] text-sm">Camera Off</p>
                </div>
              </div>
            )}
            
            {/* Preview Label */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <p className="text-[#9CA3AF] text-sm font-medium">You (Preview)</p>
            </div>
          </div>

          {/* Error Message */}
          {mediaError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{mediaError}</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {/* Microphone Button */}
            <button
              onClick={toggleMicrophone}
              className={`w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center ${
                isMicEnabled
                  ? 'bg-[#DBEAFE] hover:bg-[#BFDBFE]'
                  : 'bg-[#FEE2E2] hover:bg-[#FECACA]'
              }`}
              title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicEnabled ? (
                <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Camera Button */}
            <button
              onClick={toggleCamera}
              className={`w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center ${
                isCameraEnabled
                  ? 'bg-[#DBEAFE] hover:bg-[#BFDBFE]'
                  : 'bg-[#FEE2E2] hover:bg-[#FECACA]'
              }`}
              title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraEnabled ? (
                <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Join Call Button */}
            <button
              onClick={handleJoinCall}
              disabled={!!mediaError}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Join Call Now
            </button>

            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="w-full bg-[#F1F5F9] text-[#64748B] font-semibold py-3 rounded-xl hover:bg-[#E2E8F0] transition-all"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-[#64748B] text-sm">
            Having trouble? Check your browser permissions for camera and microphone access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPreviewPage; 