import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
import Logo from '@/components/common/Logo';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  VideoIcon,
  ShieldAlert,
  Sliders,
  ShieldCheck
} from 'lucide-react';

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
        setMediaError('Unable to access camera or microphone. Please check your system/browser permissions.');
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
      <div className="h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center">
        <Spinner size="lg" text="Loading context..." />
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
      <div className="h-screen bg-[#0B0F19] flex items-center justify-center px-4">
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="inline-block p-4 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Invalid User Type</h1>
          <p className="text-slate-400 mb-6">The specified user role context is incorrect.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
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
      <div className="h-screen bg-[#0B0F19] flex items-center justify-center px-4">
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="inline-block p-4 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Access Denied</h1>
          <p className="text-slate-400 mb-6">You don't have permission to access this consultation room.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen w-full md:overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#E2E8F0] flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
      {/* Decorative Light Blur Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area - Grid on desktop, stack on mobile */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch z-10 md:h-full md:max-h-[530px] my-auto">
        
        {/* Left Column: Video Feed (Mirrored) */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-center relative min-h-0">
          <div className="relative w-full aspect-video bg-[#1E293B] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 flex items-center justify-center">
            
            {/* Mirror Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isCameraEnabled ? 'hidden' : ''}`}
            />
            
            {/* Camera Off State */}
            {!isCameraEnabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A] space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
                  <VideoOff className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-slate-200 font-semibold">Camera is Turned Off</p>
                  <p className="text-xs text-slate-500">Unmute video to show preview</p>
                </div>
              </div>
            )}

            {/* Float Overlay: You (Preview) Tag */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-200/60 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 text-xs font-bold tracking-wide">Live Feed</span>
            </div>

            {/* Float Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3.5 bg-white/90 backdrop-blur-lg px-5 py-3 rounded-full border border-slate-200/80 shadow-lg">
              <button
                onClick={toggleMicrophone}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                  isMicEnabled
                    ? 'bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60'
                }`}
                title={isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                  isCameraEnabled
                    ? 'bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60'
                }`}
                title={isCameraEnabled ? 'Stop Video' : 'Start Video'}
              >
                {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Subtitle / Note */}
          <div className="mt-3 text-center md:text-left text-slate-500 text-[11px] flex items-center justify-center md:justify-start gap-1.5 px-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Mirror view is active for natural perspective. Your stream will appear standard on-call.</span>
          </div>
        </div>

        {/* Right Column: Title and Joining Panel */}
        <div className="col-span-1 md:col-span-5 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative min-h-0">
          
          {/* Main Info */}
          <div className="space-y-5">
            {/* Header Brand and Secure badge */}
            <div className="flex items-center justify-between mb-2">
              <Logo size="medium" showText={true} text="TheraConnect" />
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SECURE</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-100 mb-3">
                <VideoIcon className="w-3 h-3" />
                Hardware Test
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Ready to Join?
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed font-medium">
                Check your camera and microphone status. When you are ready, step inside the private workspace.
              </p>
            </div>

            {/* Error Message banner */}
            {mediaError && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs font-semibold leading-relaxed">{mediaError}</p>
              </div>
            )}

            {/* Hardware Status Checklist */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Device Checklist</h3>
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Microphone Status</span>
                  <div className="flex items-center gap-2">
                    {isMicEnabled ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                        Muted
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Camera Stream</span>
                  <div className="flex items-center gap-2">
                    {isCameraEnabled ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Transmitting
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-650 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="mt-6 space-y-3 shrink-0">
            <button
              onClick={handleJoinCall}
              disabled={!!mediaError}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>Join Session Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-3 rounded-xl border border-slate-200/50 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPreviewPage;