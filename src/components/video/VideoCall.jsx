import React, { useEffect, useRef, useState, useCallback } from "react";
import Video from "twilio-video";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useTheme } from "@mui/material/styles";
import { createVideoSession, getVideoSession, getVideoToken, endVideoSession, fetchDoctorProfile, fetchPatientProfile } from "../../api/api";
import { forceStopAllMediaTracks } from "../../utils/mediaUtils";
import Logo from "./Logo";

/**
 * VideoCall component for telehealth video sessions.
 * Handles Twilio Video connection, device controls, and error states.
 *
 * Props:
 * - appointmentId: number/string
 * - userType: 'DOCTOR' | 'PATIENT'
 * - userId: number/string
 * - onEnd: function to call when call ends
 * - sessionData: Object containing existing session data (optional)
 */
const VideoCall = ({ appointmentId, userType, userId, onEnd, sessionData }) => {
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
  const [userProfile, setUserProfile] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const theme = useTheme();

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    // Fallback names if profile fetch fails
    return userType === 'DOCTOR' ? 'Dr. Lynx' : 'Alex Johnson';
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let profileData;
        if (userType === 'DOCTOR') {
          profileData = await fetchDoctorProfile();
        } else {
          profileData = await fetchPatientProfile();
        }
        setUserProfile(profileData);
      } catch (error) {
        // If profile fetch fails, we'll use fallback names
        setUserProfile(null);
      }
    };
    
    fetchUserProfile();
  }, [userType]);

  // Initialize session and get token
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const initializeSession = async () => {
      try {
        let session;
        
        if (sessionData) {
          // Use provided session data
          session = sessionData;
        } else {
          // Fallback: try to get session, if not found, create it
          try {
            session = await getVideoSession(appointmentId);
          } catch (err) {
            session = await createVideoSession(appointmentId);
          }
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
    
    initializeSession();
    return () => {
      isMounted = false;
    };
  }, [appointmentId, userType, userId, sessionData]);

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
            if (localVideoRef.current) {
              publication.track.attach(localVideoRef.current);
            }
          }
        });

        // Listen for local track unpublications
        room.localParticipant.on('trackUnpublished', (publication) => {
          if (publication.track && publication.track.kind === 'video') {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = null;
            }
          }
        });

        // Attach remote video (first participant)
        const handleParticipant = (participant) => {
          setHasRemoteParticipant(true);
          
          // Handle existing tracks
                      participant.tracks.forEach((publication) => {
              if (publication.isSubscribed) {
                if (publication.track.kind === "video") {
                  if (remoteVideoRef.current) {
                    publication.track.attach(remoteVideoRef.current);
                  }
                } else if (publication.track.kind === "audio") {
                  if (remoteAudioRef.current) {
                    publication.track.attach(remoteAudioRef.current);
                  }
                }
              }
            });
          
          // Handle new track subscriptions
          participant.on("trackSubscribed", (track) => {
            if (track.kind === "video") {
              if (remoteVideoRef.current) {
                track.attach(remoteVideoRef.current);
              }
            } else if (track.kind === "audio") {
              if (remoteAudioRef.current) {
                track.attach(remoteAudioRef.current);
              }
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

  // Retry video attachment if elements aren't ready
  useEffect(() => {
    if (room && isVideoEnabled) {
      const retryAttachment = () => {
        if (localVideoRef.current) {
          const localTrack = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
          if (localTrack) {
            localTrack.attach(localVideoRef.current);
          }
        }
      };

      // Try immediately
      retryAttachment();
      
      // Retry after a short delay to ensure DOM is ready
      const timeoutId = setTimeout(retryAttachment, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [room, isVideoEnabled]);

  // Keep video streams active even when tab is not visible
  useEffect(() => {
    if (!room) return;

    const keepStreamsActive = () => {
      // Ensure local video is still attached
      if (localVideoRef.current && isVideoEnabled) {
        const localTrack = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
        if (localTrack && !localVideoRef.current.srcObject) {
          localTrack.attach(localVideoRef.current);
        }
      }

      // Ensure remote video is still attached
      if (remoteVideoRef.current && hasRemoteParticipant) {
        const remoteTracks = Array.from(room.participants.values()).flatMap(p => 
          Array.from(p.videoTracks.values())
        );
        if (remoteTracks.length > 0 && !remoteVideoRef.current.srcObject) {
          remoteTracks[0].track.attach(remoteVideoRef.current);
        }
      }
    };

    // Check every 2 seconds to ensure streams stay active
    const intervalId = setInterval(keepStreamsActive, 2000);

    return () => clearInterval(intervalId);
  }, [room, isVideoEnabled, hasRemoteParticipant]);

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

    // Handle tab visibility changes without stopping media
    const handleVisibilityChange = () => {
      // Tab visibility changed, but we keep media active
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [room, appointmentId]);

  // Cleanup effect to stop all media tracks when component unmounts
  useEffect(() => {
    return () => {
      // Use utility function for comprehensive cleanup
      forceStopAllMediaTracks();
    };
  }, []);

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
    // Comprehensive function to stop all media tracks
    const stopAllMediaTracks = () => {
      try {
        // Stop all Twilio room tracks first
        if (room && room.localParticipant) {
          room.localParticipant.audioTracks.forEach(publication => {
            if (publication.track) {
              publication.track.stop();
            }
          });
          
          room.localParticipant.videoTracks.forEach(publication => {
            if (publication.track) {
              publication.track.stop();
            }
          });
        }

        // Stop all remote participant tracks
        if (room) {
          room.participants.forEach(participant => {
            participant.audioTracks.forEach(publication => {
              if (publication.track) {
                publication.track.stop();
              }
            });
            
            participant.videoTracks.forEach(publication => {
              if (publication.track) {
                publication.track.stop();
              }
            });
          });
        }

        // Stop any streams attached to video/audio elements
        const elements = [localVideoRef.current, remoteVideoRef.current, remoteAudioRef.current];
        elements.forEach(element => {
          if (element && element.srcObject) {
            const stream = element.srcObject;
            if (stream && stream.getTracks) {
              stream.getTracks().forEach(track => {
                track.stop();
              });
            }
            element.srcObject = null;
          }
        });

        // Force stop any remaining getUserMedia streams
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // This will force stop any active media streams
          navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
              stream.getTracks().forEach(track => track.stop());
            })
            .catch(() => {
              // Ignore errors as this is just for cleanup
            });
        }

        // Clear any stored streams in the component state
        setRemoteParticipants([]);
        setHasRemoteParticipant(false);
        
              } catch (error) {
          // Error stopping media tracks
        }
    };

    // Disconnect from Twilio room first
    if (room) {
      try {
        room.disconnect();
        endVideoSession(appointmentId);
      } catch (error) {
        // Error disconnecting from room
      }
    }
    
    // Stop all media tracks using utility function
    forceStopAllMediaTracks();
    
    // Force a small delay to ensure cleanup is complete
    setTimeout(() => {
      // Call the onEnd callback
      if (onEnd) onEnd();
    }, 200);
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
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 3, 
          background: "white",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Logo and Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ mr: 1 }}>
            <Logo size="medium" variant="default" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold" }}>
              TheraConnect
            </Typography>
            <Typography variant="body2" sx={{ color: "#7F8C8D", fontSize: "0.875rem" }}>
              Video Consultation
            </Typography>
          </Box>
        </Box>
        
        {/* Status */}
        <Typography variant="body2" sx={{ color: "#7F8C8D", fontWeight: "500" }}>
          {hasRemoteParticipant ? 'In Session' : `Waiting for ${userType === 'DOCTOR' ? 'patient' : 'therapist'}`}
        </Typography>
      </Box>

      {/* Main Video Area */}
      <Box 
        sx={{ 
          flex: 1,
          position: "relative",
          background: "transparent"
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
            muted={false}
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
                zIndex: 1
              }}
            >
              {/* Calming background element */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 50%, transparent 100%)",
                  animation: "pulse 3s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      transform: "translate(-50%, -50%) scale(1)",
                      opacity: 0.3
                    },
                    "50%": {
                      transform: "translate(-50%, -50%) scale(1.1)",
                      opacity: 0.5
                    }
                  }
                }}
              />
              
              <Typography 
                variant="h4" 
                sx={{ 
                  color: "#2C3E50", 
                  fontWeight: "600",
                  mb: 2,
                  position: "relative",
                  zIndex: 2
                }}
              >
                Waiting for your {userType === 'DOCTOR' ? 'patient' : 'therapist'} to join...
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
            width: 240,
            height: 180,
            background: "white",
            borderRadius: 3,
            overflow: "hidden",
            border: "2px solid #ADD8E6",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
          }}
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted={true}
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
                px: 3,
                py: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <VideocamOffIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: "500" }}>Camera Off</Typography>
            </Box>
          )}
          
          {/* Patient name label */}
          <Typography 
            variant="body2" 
            sx={{ 
              position: "absolute", 
              bottom: 8, 
              left: 12, 
              color: "#2C3E50", 
              background: "rgba(255,255,255,0.9)", 
              px: 2, 
              py: 0.5,
              borderRadius: 1.5,
              fontWeight: "500",
              fontSize: "0.875rem"
            }}
          >
            {getUserDisplayName()}
          </Typography>
        </Box>

        {/* Controls (floating at bottom) */}
        <Box
          sx={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 3,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 4,
            p: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            zIndex: 1000
          }}
        >
          <IconButton 
            onClick={toggleAudio} 
            sx={{ 
              width: 56,
              height: 56,
              color: isAudioEnabled ? "#4A90E2" : "#E74C3C",
              background: isAudioEnabled ? "rgba(74, 144, 226, 0.1)" : "rgba(231, 76, 60, 0.1)",
              border: `2px solid ${isAudioEnabled ? "#4A90E2" : "#E74C3C"}`,
              '&:hover': {
                background: isAudioEnabled ? "rgba(74, 144, 226, 0.2)" : "rgba(231, 76, 60, 0.2)",
                transform: "scale(1.05)"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            {isAudioEnabled ? <MicIcon sx={{ fontSize: 24 }} /> : <MicOffIcon sx={{ fontSize: 24 }} />}
          </IconButton>
          
          <IconButton 
            onClick={toggleVideo} 
            sx={{ 
              width: 56,
              height: 56,
              color: isVideoEnabled ? "#4A90E2" : "#E74C3C",
              background: isVideoEnabled ? "rgba(74, 144, 226, 0.1)" : "rgba(231, 76, 60, 0.1)",
              border: `2px solid ${isVideoEnabled ? "#4A90E2" : "#E74C3C"}`,
              '&:hover': {
                background: isVideoEnabled ? "rgba(74, 144, 226, 0.2)" : "rgba(231, 76, 60, 0.2)",
                transform: "scale(1.05)"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            {isVideoEnabled ? <VideocamIcon sx={{ fontSize: 24 }} /> : <VideocamOffIcon sx={{ fontSize: 24 }} />}
          </IconButton>
          
          <IconButton 
            onClick={handleEndCall} 
            sx={{ 
              width: 56,
              height: 56,
              color: "white",
              background: "#E74C3C",
              border: "2px solid #E74C3C",
              '&:hover': {
                background: "#C0392B",
                borderColor: "#C0392B",
                transform: "scale(1.05)"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            <CallEndIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCall; 