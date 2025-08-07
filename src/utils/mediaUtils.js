/**
 * Utility functions for managing media streams and permissions
 */

/**
 * Force stop all media tracks on the page
 * This function stops all video and audio tracks to ensure camera/microphone are released
 */
export const forceStopAllMediaTracks = () => {
  try {
    // Stop all video elements
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject;
        if (stream && stream.getTracks) {
                  stream.getTracks().forEach(track => {
          track.stop();
        });
        }
        video.srcObject = null;
      }
    });

    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.srcObject) {
        const stream = audio.srcObject;
        if (stream && stream.getTracks) {
                  stream.getTracks().forEach(track => {
          track.stop();
        });
        }
        audio.srcObject = null;
      }
    });

    // Force stop any remaining getUserMedia streams
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // This will force stop any active media streams
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
                  stream.getTracks().forEach(track => {
          track.stop();
        });
        })
        .catch(() => {
          // Ignore errors as this is just for cleanup
        });
    }

    // All media tracks stopped successfully
  } catch (error) {
    // Error stopping media tracks
  }
};

/**
 * Stop specific media stream
 * @param {MediaStream} stream - The media stream to stop
 */
export const stopMediaStream = (stream) => {
  if (stream && stream.getTracks) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};

/**
 * Check if any media tracks are currently active
 * @returns {boolean} True if any media tracks are active
 */
export const hasActiveMediaTracks = () => {
  const videoElements = document.querySelectorAll('video');
  const audioElements = document.querySelectorAll('audio');
  
  for (const video of videoElements) {
    if (video.srcObject && video.srcObject.getTracks) {
      const tracks = video.srcObject.getTracks();
      if (tracks.some(track => track.readyState === 'live')) {
        return true;
      }
    }
  }
  
  for (const audio of audioElements) {
    if (audio.srcObject && audio.srcObject.getTracks) {
      const tracks = audio.srcObject.getTracks();
      if (tracks.some(track => track.readyState === 'live')) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Request camera and microphone permissions
 * @returns {Promise<MediaStream>} Promise that resolves to the media stream
 */
export const requestMediaPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    });
    // Media permissions granted
    return stream;
  } catch (error) {
    throw error;
  }
};

/**
 * Clean up all media and refresh the page
 * This is a nuclear option when other cleanup methods fail
 */
export const forceCleanupAndRefresh = () => {
  forceStopAllMediaTracks();
  
  // Wait a bit then refresh
  setTimeout(() => {
    window.location.reload();
  }, 300);
}; 