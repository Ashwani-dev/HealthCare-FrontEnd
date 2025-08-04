import React, { useEffect, useRef, useState, useCallback } from "react";
import Video from "twilio-video";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useTheme } from "@mui/material/styles";
import { createVideoSession, getVideoSession, getVideoToken, endVideoSession } from "../../api/api";

/**
 * VideoCall component for telehealth video sessions.
 * Handles Twilio Video connection, device controls, and error states.
 *
 * Props:
 * - appointmentId: number/string
 * - userType: 'DOCTOR' | 'PATIENT'
 * - userId: number/string
 * - onEnd: function to call when call ends
 */
const VideoCall = ({ appointmentId, userType, userId, onEnd }) => {
  const [room, setRoom] = useState(null);
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const theme = useTheme();

  // Fetch or create session, then get token, then connect
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    let session;
    // Helper: get or create session
    const getSession = async () => {
      try {
        // Try to get session, if not found, create it
        try {
          session = await getVideoSession(appointmentId);
        } catch (err) {
          session = await createVideoSession(appointmentId);
        }
        if (!isMounted) return;
        setRoomName(session.twilioRoomName);
        // Get token
        const tk = await getVideoToken(appointmentId, userType, userId);
        if (!isMounted) return;
        setToken(tk);
      } catch (err) {
        setError("Could not start video session. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getSession();
    return () => {
      isMounted = false;
    };
  }, [appointmentId, userType, userId]);

  // Connect to Twilio room when token and roomName are available
  useEffect(() => {
    if (!token || !roomName) return;
    setConnecting(true);
    Video.connect(token, {
      name: roomName,
      audio: true,
      video: { width: 640 },
    })
      .then((room) => {
        setRoom(room);
        setConnecting(false);
        
        // Handle local participant tracks
        const attachLocalVideo = () => {
          const localTrack = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
          if (localTrack && localVideoRef.current) {
            localTrack.attach(localVideoRef.current);
          }
        };

        // Attach local video immediately if available
        attachLocalVideo();

        // Listen for local track publications
        room.localParticipant.on('trackPublished', (publication) => {
          if (publication.track && publication.track.kind === 'video') {
            publication.track.attach(localVideoRef.current);
          }
        });

        // Attach remote video (first participant)
        const handleParticipant = (participant) => {
          setHasRemoteParticipant(true);
          
          // Handle existing tracks
          participant.tracks.forEach((publication) => {
            if (publication.isSubscribed) {
              if (publication.track.kind === "video") {
                publication.track.attach(remoteVideoRef.current);
              } else if (publication.track.kind === "audio") {
                publication.track.attach(remoteAudioRef.current);
              }
            }
          });
          
          // Handle new track subscriptions
          participant.on("trackSubscribed", (track) => {
            if (track.kind === "video") {
              track.attach(remoteVideoRef.current);
            } else if (track.kind === "audio") {
              track.attach(remoteAudioRef.current);
            }
          });
          
          // Handle track unsubscriptions
          participant.on("trackUnsubscribed", (track) => {
            if (track.kind === "video" && remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            } else if (track.kind === "audio" && remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = null;
            }
          });
        };
        
        room.participants.forEach(handleParticipant);
        room.on("participantConnected", handleParticipant);
        
        // Remove video on disconnect
        room.on("participantDisconnected", (participant) => {
          setHasRemoteParticipant(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
          }
        });
        
        setRemoteParticipants(Array.from(room.participants.values()));
      })
      .catch((err) => {
        setError(
          err.message.includes("permission")
            ? "Camera/microphone permission denied. Please allow access."
            : "Could not connect to video room. Please check your network and try again."
        );
        setConnecting(false);
      });
    // Clean up on unmount
    return () => {
      if (room) {
        room.disconnect();
      }
    };
    // eslint-disable-next-line
  }, [token, roomName]);

  // Ensure local video is attached when ref becomes available
  useEffect(() => {
    if (room && localVideoRef.current && isVideoEnabled) {
      const localTrack = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
      if (localTrack) {
        localTrack.attach(localVideoRef.current);
      }
    }
  }, [room, isVideoEnabled]);

  // Sync UI state with actual track states
  useEffect(() => {
    if (!room) return;
    
    const syncTrackStates = () => {
      const audioTracks = Array.from(room.localParticipant.audioTracks.values());
      const videoTracks = Array.from(room.localParticipant.videoTracks.values());
      
      // Check if audio is actually enabled
      const audioEnabled = audioTracks.length > 0 && audioTracks.some(pub => pub.track && pub.track.isEnabled);
      if (audioEnabled !== isAudioEnabled) {
        setIsAudioEnabled(audioEnabled);
      }
      
      // Check if video is actually enabled
      const videoEnabled = videoTracks.length > 0 && videoTracks.some(pub => pub.track && pub.track.isEnabled);
      if (videoEnabled !== isVideoEnabled) {
        setIsVideoEnabled(videoEnabled);
      }
    };
    
    // Sync immediately
    syncTrackStates();
    
    // Listen for track publications and unpublications
    const handleTrackPublished = () => syncTrackStates();
    const handleTrackUnpublished = () => syncTrackStates();
    
    room.localParticipant.on('trackPublished', handleTrackPublished);
    room.localParticipant.on('trackUnpublished', handleTrackUnpublished);
    
    return () => {
      room.localParticipant.off('trackPublished', handleTrackPublished);
      room.localParticipant.off('trackUnpublished', handleTrackUnpublished);
    };
  }, [room, isAudioEnabled, isVideoEnabled]);

  // Clean disconnect on manual end or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (room) {
        room.disconnect();
        endVideoSession(appointmentId);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [room, appointmentId]);

  // Device controls
  const toggleAudio = useCallback(() => {
    if (!room) return;
    
    const audioTracks = Array.from(room.localParticipant.audioTracks.values());
    
    if (audioTracks.length === 0) {
      // If no audio tracks exist, try to publish one
      if (!isAudioEnabled) {
        room.localParticipant.setMicrophoneEnabled(true);
        setIsAudioEnabled(true);
      }
      return;
    }
    
    audioTracks.forEach((publication) => {
      if (publication.track) {
        if (isAudioEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      }
    });
    
    setIsAudioEnabled((prev) => !prev);
  }, [room, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (!room) return;
    
    const videoTracks = Array.from(room.localParticipant.videoTracks.values());
    
    if (videoTracks.length === 0) {
      // If no video tracks exist, try to publish one
      if (!isVideoEnabled) {
        room.localParticipant.setCameraEnabled(true);
        setIsVideoEnabled(true);
      }
      return;
    }
    
    videoTracks.forEach((publication) => {
      if (publication.track) {
        if (isVideoEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      }
    });
    
    setIsVideoEnabled((prev) => !prev);
  }, [room, isVideoEnabled]);

  const handleEndCall = useCallback(() => {
    if (room) {
      room.disconnect();
      endVideoSession(appointmentId);
    }
    if (onEnd) onEnd();
  }, [room, appointmentId, onEnd]);

  // Optimization tip (for seniors):
  // - Memoize participant video rendering with useMemo if you expect many participants.
  // - Use bandwidth detection (room.stats) to adapt video quality.

  // UI rendering
  if (loading || connecting) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
        <CircularProgress />
        <Typography variant="body2" mt={2}>Connecting to video call...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }
  return (
    <Box 
      sx={{ 
        minHeight: "100vh",
        background: theme.palette.background.default,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          background: theme.palette.primary.main, 
          color: "white",
          textAlign: "center"
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Video Consultation
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {userType === 'DOCTOR' ? 'Doctor' : 'Patient'} Session
        </Typography>
      </Box>

      {/* Main Video Area */}
      <Box 
        sx={{ 
          flex: 1,
          position: "relative",
          background: theme.palette.grey[900]
        }}
      >
        {/* Remote participant video (full screen) */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover" 
            }} 
          />
          <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />
          
          {!hasRemoteParticipant && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "white"
              }}
            >
              <Typography variant="h6" mb={1}>
                Waiting for {userType === 'DOCTOR' ? 'patient' : 'doctor'} to join...
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Please wait while the other participant connects
              </Typography>
            </Box>
          )}
        </Box>

        {/* Local participant video (picture-in-picture) */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 200,
            height: 150,
            background: theme.palette.grey[800],
            borderRadius: 2,
            overflow: "hidden",
            border: "2px solid white",
            boxShadow: 3
          }}
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              transform: "scaleX(-1)" // Mirror the local video
            }} 
          />
          
          {/* Status overlays for local video */}
          {!isVideoEnabled && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}
            >
              <VideocamOffIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">Off</Typography>
            </Box>
          )}
          
          <Typography 
            variant="caption" 
            sx={{ 
              position: "absolute", 
              bottom: 4, 
              left: 8, 
              color: "white", 
              background: "rgba(0,0,0,0.7)", 
              px: 1, 
              borderRadius: 0.5 
            }}
          >
            You
          </Typography>
        </Box>

        {/* Controls (floating at bottom) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
            background: "rgba(0,0,0,0.8)",
            borderRadius: 3,
            p: 1
          }}
        >
          <IconButton 
            onClick={toggleAudio} 
            sx={{ 
              color: isAudioEnabled ? "white" : "red",
              background: isAudioEnabled ? "rgba(255,255,255,0.2)" : "rgba(255,0,0,0.3)",
              '&:hover': {
                background: isAudioEnabled ? "rgba(255,255,255,0.3)" : "rgba(255,0,0,0.4)"
              }
            }}
          >
            {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
          
          <IconButton 
            onClick={toggleVideo} 
            sx={{ 
              color: isVideoEnabled ? "white" : "red",
              background: isVideoEnabled ? "rgba(255,255,255,0.2)" : "rgba(255,0,0,0.3)",
              '&:hover': {
                background: isVideoEnabled ? "rgba(255,255,255,0.3)" : "rgba(255,0,0,0.4)"
              }
            }}
          >
            {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
          
          <IconButton 
            onClick={handleEndCall} 
            sx={{ 
              color: "white",
              background: "rgba(255,0,0,0.8)",
              '&:hover': {
                background: "rgba(255,0,0,0.9)"
              }
            }}
          >
            <CallEndIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCall; 