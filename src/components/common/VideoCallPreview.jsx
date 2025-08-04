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
import { useTheme } from "@mui/material/styles";

/**
 * VideoCallPreview component for testing microphone and camera before joining a call.
 * 
 * Props:
 * - onJoinCall: function to call when user clicks "Join Call"
 * - userType: 'DOCTOR' | 'PATIENT'
 */
const VideoCallPreview = ({ onJoinCall, userType }) => {
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
        console.error('Error accessing media devices:', err);
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
    if (onJoinCall) {
      onJoinCall();
    }
  }, [onJoinCall]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        sx={{ background: theme.palette.background.default }}
      >
        <Typography variant="h6" mb={2}>Setting up your camera and microphone...</Typography>
        <Typography variant="body2" color="text.secondary">Please allow camera and microphone access when prompted</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        sx={{ background: theme.palette.background.default }}
      >
        <Alert severity="error" sx={{ maxWidth: 500, mb: 3 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Box>
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
          p: 3, 
          background: theme.palette.primary.main, 
          color: "white",
          textAlign: "center"
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Test Your Camera & Microphone
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
          {userType === 'DOCTOR' ? 'Doctor' : 'Patient'} Preview - Make sure everything is working before joining the call
        </Typography>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 800, width: "100%", boxShadow: 4 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Video Preview */}
            <Box
              sx={{
                width: "100%",
                height: 450,
                background: theme.palette.grey[900],
                borderRadius: "4px 4px 0 0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
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
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <VideocamOffIcon />
                  <Typography>Camera Off</Typography>
                </Box>
              )}
              
              {!isAudioEnabled && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(255,0,0,0.8)",
                    color: "white",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <MicOffIcon />
                  <Typography variant="caption">Muted</Typography>
                </Box>
              )}
              
              {/* You label */}
              <Typography 
                variant="caption" 
                sx={{ 
                  position: "absolute", 
                  bottom: 16, 
                  left: 16, 
                  background: "rgba(0,0,0,0.7)", 
                  color: "white", 
                  px: 2, 
                  py: 1, 
                  borderRadius: 1 
                }}
              >
                You (Preview)
              </Typography>
            </Box>
          </CardContent>

          {/* Controls */}
          <CardActions sx={{ justifyContent: "center", gap: 2, p: 3 }}>
            <IconButton 
              onClick={toggleAudio} 
              color={isAudioEnabled ? "primary" : "default"}
              sx={{ 
                background: isAudioEnabled ? theme.palette.primary.light : theme.palette.grey[200],
                '&:hover': {
                  background: isAudioEnabled ? theme.palette.primary.main : theme.palette.grey[300]
                }
              }}
            >
              {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            
            <IconButton 
              onClick={toggleVideo} 
              color={isVideoEnabled ? "primary" : "default"}
              sx={{ 
                background: isVideoEnabled ? theme.palette.primary.light : theme.palette.grey[200],
                '&:hover': {
                  background: isVideoEnabled ? theme.palette.primary.main : theme.palette.grey[300]
                }
              }}
            >
              {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </CardActions>
        </Card>

        {/* Join Call Button */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleJoinCall}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 3,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            Join Call Now
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Click to join the video consultation with {userType === 'DOCTOR' ? 'your patient' : 'your doctor'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCallPreview; 