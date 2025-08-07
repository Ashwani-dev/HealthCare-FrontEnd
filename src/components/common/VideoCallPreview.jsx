import React, { useEffect, useRef, useState, useCallback } from "react";
import Video from "twilio-video";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import Logo from "./Logo";

/**
 * VideoCallPreview component for testing microphone and camera before joining a call.
 * 
 * Props:
 * - onJoinCall: function to call when user clicks "Join Call"
 * - onGoBack: function to call when user wants to go back (optional)
 * - userType: 'DOCTOR' | 'PATIENT'
 * - isInitializing: boolean indicating if call is being initialized
 * - joinError: string error message to display for join call errors
 */
const VideoCallPreview = ({ onJoinCall, onGoBack, userType, isInitializing = false, joinError = null }) => {
  const [localStream, setLocalStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const localVideoRef = useRef();
  const theme = useTheme();

  // Get local media stream for preview
  useEffect(() => {
    const getLocalStream = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        setLocalStream(stream);
        
        // Attach stream to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setLoading(false);
      } catch (err) {
        setError(
          err.name === 'NotAllowedError' 
            ? "Camera/microphone permission denied. Please allow access and refresh the page."
            : "Could not access camera/microphone. Please check your device settings."
        );
        setLoading(false);
      }
    };

    getLocalStream();

    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Attach stream to video element when ref becomes available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Device controls
  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !isAudioEnabled;
    });
    
    setIsAudioEnabled(!isAudioEnabled);
  }, [localStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    
    const videoTracks = localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !isVideoEnabled;
    });
    
    setIsVideoEnabled(!isVideoEnabled);
  }, [localStream, isVideoEnabled]);

  const handleJoinCall = useCallback(() => {
    // Stop the preview stream before joining the call
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (onJoinCall) {
      onJoinCall();
    }
  }, [localStream, onJoinCall]);

  if (loading) {
    return (
      <Box 
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0
        }}
      >
        <Typography variant="h6" mb={2} sx={{ color: "#2C3E50", fontWeight: "600" }}>
          Setting up your camera and microphone...
        </Typography>
        <Typography variant="body2" sx={{ color: "#7F8C8D" }}>
          Please allow camera and microphone access when prompted
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          p: 2
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500, mb: 3 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            '&:hover': {
              background: "linear-gradient(135deg, #357ABD 0%, #2C5F9E 100%)"
            }
          }}
        >
          Refresh Page
        </Button>
      </Box>
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
          p: { xs: 2, sm: 3 }, 
          background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Left side - Back button and Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          {onGoBack && (
            <IconButton
              onClick={onGoBack}
              sx={{
                color: "white",
                mr: 1,
                '&:hover': {
                  background: "rgba(255, 255, 255, 0.1)"
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Logo size="medium" variant="white" />
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}>
              TheraConnect
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }}>
              Video Consultation
            </Typography>
          </Box>
        </Box>
        
        {/* Status */}
        <Typography variant="body2" sx={{ 
          fontWeight: "500", 
          opacity: 0.9,
          fontSize: { xs: "0.75rem", sm: "0.875rem" }
        }}>
          Device Test
        </Typography>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 1, sm: 2, md: 3 },
          overflow: "auto"
        }}
      >
        {/* Top Section - Title and Video */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          width: "100%",
          flex: 1
        }}>
                  {/* Title Section */}
        <Box sx={{ 
          textAlign: "center", 
          mb: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 }
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: "#2C3E50", 
              fontWeight: "600",
              mb: 1,
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" }
            }}
          >
            Test Your Camera & Microphone
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#4A90E2", 
              fontWeight: "500",
              mb: 0.5,
              fontSize: { xs: "0.875rem", sm: "1rem" }
            }}
          >
            {userType === 'DOCTOR' ? 'Doctor' : 'Patient'} Preview
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#7F8C8D",
              maxWidth: 400,
              mx: "auto",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1, sm: 0 }
            }}
          >
            Make sure your camera and microphone are working properly before joining the consultation
          </Typography>
        </Box>

          <Card 
            sx={{ 
              maxWidth: { xs: "85%", sm: 450, md: 600 }, 
              width: "100%", 
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
          <CardContent sx={{ p: 0 }}>
            {/* Video Preview */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 150, sm: 200, md: 280 },
                background: "#2C3E50",
                borderRadius: "12px 12px 0 0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.1)"
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
                  transform: "scaleX(-1)" // Mirror the video
                }} 
              />
              
              {/* Status overlays */}
              {!isVideoEnabled && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backdropFilter: "blur(10px)"
                  }}
                >
                  <VideocamOffIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  <Typography sx={{ 
                    fontWeight: "500",
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}>Camera Off</Typography>
                </Box>
              )}
              
              {!isAudioEnabled && (
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: 12, sm: 16 },
                    right: { xs: 12, sm: 16 },
                    background: "rgba(231, 76, 60, 0.9)",
                    color: "white",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.5, sm: 1 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backdropFilter: "blur(10px)"
                  }}
                >
                  <MicOffIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                  <Typography variant="caption" sx={{ 
                    fontWeight: "500",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                  }}>Muted</Typography>
                </Box>
              )}
              
              {/* You label */}
              <Typography 
                variant="body2" 
                sx={{ 
                  position: "absolute", 
                  bottom: { xs: 12, sm: 16 }, 
                  left: { xs: 12, sm: 16 }, 
                  background: "rgba(0,0,0,0.7)", 
                  color: "white", 
                  px: { xs: 2, sm: 3 }, 
                  py: { xs: 0.5, sm: 1 },
                  borderRadius: 2,
                  fontWeight: "500",
                  backdropFilter: "blur(10px)",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}
              >
                You (Preview)
              </Typography>
            </Box>
          </CardContent>

          {/* Controls */}
          <CardActions sx={{ 
            justifyContent: "center", 
            gap: { xs: 2, sm: 3 }, 
            p: { xs: 2, sm: 3 },
            minHeight: { xs: 60, sm: 80 }
          }}>
            <IconButton 
              onClick={toggleAudio} 
              sx={{ 
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                color: isAudioEnabled ? "#4A90E2" : "#E74C3C",
                background: isAudioEnabled ? "rgba(74, 144, 226, 0.15)" : "rgba(231, 76, 60, 0.15)",
                border: `2px solid ${isAudioEnabled ? "#4A90E2" : "#E74C3C"}`,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                '&:hover': {
                  background: isAudioEnabled ? "rgba(74, 144, 226, 0.25)" : "rgba(231, 76, 60, 0.25)",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                },
                transition: "all 0.2s ease-in-out"
              }}
            >
              {isAudioEnabled ? <MicIcon sx={{ fontSize: { xs: 22, sm: 26 } }} /> : <MicOffIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />}
            </IconButton>
            
            <IconButton 
              onClick={toggleVideo} 
              sx={{ 
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                color: isVideoEnabled ? "#4A90E2" : "#E74C3C",
                background: isVideoEnabled ? "rgba(74, 144, 226, 0.15)" : "rgba(231, 76, 60, 0.15)",
                border: `2px solid ${isVideoEnabled ? "#4A90E2" : "#E74C3C"}`,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                '&:hover': {
                  background: isVideoEnabled ? "rgba(74, 144, 226, 0.25)" : "rgba(231, 76, 60, 0.25)",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                },
                transition: "all 0.2s ease-in-out"
              }}
            >
              {isVideoEnabled ? <VideocamIcon sx={{ fontSize: { xs: 22, sm: 26 } }} /> : <VideocamOffIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />}
            </IconButton>
          </CardActions>
        </Card>
        </Box>

        {/* Bottom Section - Controls and Join Button */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          width: "100%",
          mt: { xs: 1, sm: 2 }
        }}>
          {/* Error Message */}
          {joinError && (
            <Box sx={{ mb: 3, textAlign: "center", px: { xs: 1, sm: 0 } }}>
              <Alert severity="error" sx={{ 
                maxWidth: 500, 
                mx: "auto", 
                borderRadius: 2,
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }}>
                {joinError}
              </Alert>
            </Box>
          )}

          {/* Join Call Button */}
          <Box sx={{ 
            textAlign: "center",
            px: { xs: 1, sm: 0 }
          }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={isInitializing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )}
              onClick={handleJoinCall}
              disabled={isInitializing}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: "bold",
                borderRadius: 2,
                background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
                '&:hover': {
                  background: "linear-gradient(135deg, #357ABD 0%, #2C5F9E 100%)",
                  boxShadow: "0 6px 16px rgba(74, 144, 226, 0.4)",
                  transform: "translateY(-1px)"
                },
                '&:disabled': {
                  background: "#B0BEC5",
                  boxShadow: "none",
                  transform: "none"
                },
                transition: "all 0.3s ease-in-out"
              }}
            >
              {isInitializing ? 'Joining Call...' : 'Join Call Now'}
            </Button>
            
            <Typography variant="body2" sx={{ 
              color: "#7F8C8D", 
              mt: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1, sm: 0 }
            }}>
              {isInitializing 
                ? 'Initializing video session...' 
                : `Click to join the video consultation with ${userType === 'DOCTOR' ? 'your patient' : 'your doctor'}`
              }
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCallPreview; 