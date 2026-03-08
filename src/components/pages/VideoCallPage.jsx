import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VideoCallPage = () => {
  const { appointmentId, userType, userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Video call states
  const [isPatientJoined, setIsPatientJoined] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Initialize media devices
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    if (!loading && user) {
      initializeMedia();
      
      // Simulate patient joining after 3 seconds (for demo)
      // In production, this would be handled by real WebRTC signaling
      const timer = setTimeout(() => {
        setIsPatientJoined(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, user]);
  
  // Sync video element with stream
  useEffect(() => {
    if (localStream && localVideoRef.current && isCameraEnabled) {
      localVideoRef.current.srcObject = localStream;
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
        
        if (newState && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    }
  };
  
  // Handle end call
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center">
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
      <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center px-4">
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
      <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-4">Access Denied</h1>
          <p className="text-[#64748B] mb-6">You don't have permission to access this video call.</p>
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

  // Validate userId
  if (userId !== user.userId?.toString()) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-4">Access Denied</h1>
          <p className="text-[#64748B] mb-6">You don't have permission to access this video call.</p>
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
    <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex flex-col overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-7xl h-full">
          {/* Main Video Container */}
          <div className="w-full h-full bg-[#111827] rounded-2xl overflow-hidden shadow-2xl relative">
            
            {!isPatientJoined ? (
              /* Waiting State */
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-8 md:p-12 text-center max-w-md">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#DBEAFE] rounded-full mb-6">
                    <svg className="w-10 h-10 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  {/* Message */}
                  <h2 className="text-2xl font-bold text-[#1E293B] mb-3">
                    Waiting for {userType === 'DOCTOR' ? 'your patient' : 'doctor'} to join…
                  </h2>
                  <p className="text-[#64748B] text-sm">
                    Please wait while they connect to the consultation
                  </p>
                  
                  {/* Loading Animation */}
                  <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Call State */
              <>
                {/* Remote Video (Patient/Doctor) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video Preview (Floating) */}
                <div className="absolute bottom-6 right-6 w-48 md:w-64 aspect-video bg-[#111827] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCameraEnabled ? 'hidden' : ''}`}
                  />
                  
                  {/* Camera Off Overlay */}
                  {!isCameraEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#111827]">
                      <div className="text-center">
                        <svg className="w-10 h-10 text-[#9CA3AF] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Label */}
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    <p className="text-white text-xs font-medium">You</p>
                  </div>
                </div>
                
                {/* Participant Info */}
                <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <p className="text-white text-sm font-medium">
                    {userType === 'DOCTOR' ? 'Patient' : 'Dr. Smith'} • Connected
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Floating Control Dock */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-4 shadow-2xl flex items-center gap-4">
              {/* Microphone Button */}
              <button
                onClick={toggleMicrophone}
                className={`w-14 h-14 rounded-full transition-all transform hover:scale-105 flex items-center justify-center ${
                  isMicEnabled
                    ? 'bg-[#DBEAFE] hover:bg-[#BFDBFE]'
                    : 'bg-[#FEE2E2] hover:bg-[#FECACA]'
                }`}
                title={isMicEnabled ? 'Mute' : 'Unmute'}
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
                className={`w-14 h-14 rounded-full transition-all transform hover:scale-105 flex items-center justify-center ${
                  isCameraEnabled
                    ? 'bg-[#DBEAFE] hover:bg-[#BFDBFE]'
                    : 'bg-[#FEE2E2] hover:bg-[#FECACA]'
                }`}
                title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
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
              
              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-14 h-14 bg-[#EF4444] hover:bg-[#DC2626] rounded-full transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
                title="End call"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call Duration Timer (Optional) */}
      {isPatientJoined && (
        <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
          <p className="text-white text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording...
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage; 