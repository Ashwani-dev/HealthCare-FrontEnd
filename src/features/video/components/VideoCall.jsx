/* eslint-disable no-unused-vars */
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
import { createVideoSession, getVideoSession, getVideoToken, endVideoSession, fetchDoctorProfile, fetchPatientProfile } from "@/api/api";
import { forceStopAllMediaTracks } from "@/utils/mediaUtils";
import Logo from "@/components/common/Logo";

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
        height: { xs: "100dvh", md: "100vh" }, // Use dynamic viewport height on mobile to prevent toolbar overlap
        width: "100vw",
        background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
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
          p: { xs: 1.75, sm: 2.5, md: 3 }, 
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          shrink: 0
        }}
      >
        {/* Logo and Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Logo size="small" variant="default" />
          <Box>
            <Typography variant="subtitle2" sx={{ color: "#0F172A", fontWeight: "800", lineHeight: 1.1 }}>
              TheraConnect
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: "600", fontSize: "0.7rem" }}>
              Private Consultation
            </Typography>
          </Box>
        </Box>
        
        {/* Security / Status badge */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 0.75, 
            background: "rgba(241, 245, 249, 0.8)",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            px: 1.5,
            py: 0.5,
            borderRadius: "9999px"
          }}
        >
          <span 
            className={`w-2 h-2 rounded-full ${
              hasRemoteParticipant ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"
            }`}
          />
          <Typography variant="caption" sx={{ color: "#475569", fontWeight: "750", textTransform: "uppercase", tracking: "0.5px", fontSize: "0.65rem" }}>
            {hasRemoteParticipant ? 'In Session' : 'Lobby'}
          </Typography>
        </Box>
      </Box>

      {/* Main Video Workspace Frame */}
      <Box 
        sx={{ 
          flex: 1,
          position: "relative",
          m: { xs: 0, sm: 2, md: 3 },
          borderRadius: { xs: 0, sm: "24px" },
          overflow: "hidden",
          boxShadow: { xs: "none", sm: "0 10px 30px rgba(15, 23, 42, 0.04)" },
          background: "#0F172A",
          border: { xs: "none", sm: "1px solid rgba(226, 232, 240, 0.8)" },
          display: "flex",
          minHeight: 0
        }}
      >
        {/* Remote participant video (full frame) */}
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
          
          {/* Waiting/Lobby Screen Placeholder */}
          {!hasRemoteParticipant && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
                width: "90%",
                maxWidth: 420,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: "24px",
                p: { xs: 3, md: 5 },
                boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.05)"
              }}
            >
              {/* Pulsing ring wave */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "rgba(37, 99, 235, 0.08)",
                  mb: 2.5,
                  position: "relative"
                }}
              >
                <CircularProgress 
                  size={48} 
                  thickness={3.5}
                  sx={{ color: "#2563EB" }} 
                />
              </Box>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#0F172A", 
                  fontWeight: "800",
                  mb: 1,
                  lineHeight: 1.3,
                  fontSize: { xs: "1.1rem", md: "1.25rem" }
                }}
              >
                Waiting for others to join
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#64748B",
                  fontWeight: "500",
                  lineHeight: 1.4,
                  mb: 2.5,
                  fontSize: { xs: "0.8rem", md: "0.875rem" }
                }}
              >
                The room is encrypted and secure. Once your {userType === 'DOCTOR' ? 'patient' : 'therapist'} connects, the video session will start automatically.
              </Typography>

              <Box 
                sx={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 1, 
                  color: "#10B981", 
                  background: "rgba(16, 185, 129, 0.08)", 
                  px: 2, 
                  py: 0.75, 
                  borderRadius: "8px" 
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <Typography variant="caption" sx={{ fontWeight: "700", letterSpacing: "0.2px", fontSize: "0.7rem" }}>
                  Hardware Connection Active
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
 
        {/* Local participant video (picture-in-picture) */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 12, sm: 20, md: 24 },
            right: { xs: 12, sm: 20, md: 24 },
            width: { xs: 135, sm: 180, md: 240 },
            height: { xs: 101, sm: 135, md: 180 }, // 4:3 Aspect ratio
            background: "#1E293B",
            borderRadius: "16px",
            overflow: "hidden",
            border: "2.5px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2), 0 8px 10px -6px rgba(15, 23, 42, 0.2)",
            zIndex: 5
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
                inset: 0,
                background: "rgba(15, 23, 42, 0.85)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1
              }}
            >
              <VideocamOffIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#EF4444" }} />
              <Typography variant="caption" sx={{ fontWeight: "700", color: "#94A3B8", fontSize: { xs: "8px", sm: "10px" } }}>
                Camera Off
              </Typography>
            </Box>
          )}
          
          {/* Local Participant Name tag */}
          <Typography 
            variant="caption" 
            sx={{ 
              position: "absolute", 
              bottom: 8, 
              left: 8, 
              color: "#0F172A", 
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(6px)", 
              px: 1.5, 
              py: 0.5,
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: { xs: "9px", sm: "11px" },
              border: "1px solid rgba(226, 232, 240, 0.5)"
            }}
          >
            {getUserDisplayName()} (You)
          </Typography>
        </Box>
 
        {/* Controls dock (floating at bottom) */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 20, sm: 24, md: 30 }, // Raised bottom offset to prevent iOS overlay overlaps
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: { xs: 2.25, sm: 3 },
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "9999px",
            p: { xs: 1.5, sm: 1.75 },
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            zIndex: 10
          }}
        >
          {/* Toggle Audio */}
          <IconButton 
            onClick={toggleAudio} 
            sx={{ 
              width: { xs: 50, sm: 54 },
              height: { xs: 50, sm: 54 },
              color: isAudioEnabled ? "#2563EB" : "#EF4444",
              background: isAudioEnabled ? "rgba(37, 99, 235, 0.06)" : "rgba(239, 68, 68, 0.06)",
              border: `1.5px solid ${isAudioEnabled ? "rgba(37, 99, 235, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
              '&:hover': {
                background: isAudioEnabled ? "rgba(37, 99, 235, 0.12)" : "rgba(239, 68, 68, 0.12)",
                transform: "scale(1.04)"
              },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {isAudioEnabled ? <MicIcon sx={{ fontSize: { xs: 22, sm: 24 } }} /> : <MicOffIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          </IconButton>
          
          {/* Toggle Video */}
          <IconButton 
            onClick={toggleVideo} 
            sx={{ 
              width: { xs: 50, sm: 54 },
              height: { xs: 50, sm: 54 },
              color: isVideoEnabled ? "#2563EB" : "#EF4444",
              background: isVideoEnabled ? "rgba(37, 99, 235, 0.06)" : "rgba(239, 68, 68, 0.06)",
              border: `1.5px solid ${isVideoEnabled ? "rgba(37, 99, 235, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
              '&:hover': {
                background: isVideoEnabled ? "rgba(37, 99, 235, 0.12)" : "rgba(239, 68, 68, 0.12)",
                transform: "scale(1.04)"
              },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {isVideoEnabled ? <VideocamIcon sx={{ fontSize: { xs: 22, sm: 24 } }} /> : <VideocamOffIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          </IconButton>
          
          {/* End Call */}
          <IconButton 
            onClick={handleEndCall} 
            sx={{ 
              width: { xs: 50, sm: 54 },
              height: { xs: 50, sm: 54 },
              color: "white",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              '&:hover': {
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                transform: "scale(1.04)"
              },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <CallEndIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCall; 