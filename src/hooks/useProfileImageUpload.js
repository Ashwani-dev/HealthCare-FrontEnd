import { useState, useRef } from "react";
import { patchProfileImage, uploadFileToS3 } from "@/api/api";

/**
 * Custom React Hook to manage profile image upload, removal, and trigger actions.
 * Encapsulates file size validation (6MB limit), file type validation, S3 upload process,
 * database sync, local state synchronization, local storage updates, and loading state management.
 * 
 * @param {Object} params - Hook parameters
 * @param {"patient"|"doctor"} params.role - User role
 * @param {Object} params.profile - Current profile state object
 * @param {Object} params.form - Current form state object
 * @param {Function} params.setProfile - Profile state setter
 * @param {Function} params.setForm - Form state setter
 * @param {Function} params.showToast - Toast/Notification trigger callback
 * @returns {Object} Reusable state and action callbacks
 */
export const useProfileImageUpload = ({
  role,
  profile,
  form,
  setProfile,
  setForm,
  showToast
}) => {
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 6MB maximum file size limit
    if (file.size > 6 * 1024 * 1024) {
      showToast("File size must be under 6MB.", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file.", "error");
      return;
    }

    setImageUploading(true);
    try {
      // Step 1: Request presigned S3 URL
      const patchRes = await patchProfileImage(role, null);
      const { presignedUploadUrl, s3ObjectKey } = patchRes;

      if (!presignedUploadUrl || !s3ObjectKey) {
        throw new Error("Invalid presigned upload response");
      }

      // Step 2: Upload file to AWS S3 using direct PUT method
      await uploadFileToS3(presignedUploadUrl, file);

      // Step 3: Confirm upload backend reference update
      const updatedProfile = await patchProfileImage(role, s3ObjectKey);
      const newProfile = { ...profile, ...updatedProfile };
      
      setProfile(newProfile);
      setForm({ ...form, ...updatedProfile });
      sessionStorage.setItem('profileData', JSON.stringify(newProfile));

      showToast("Profile picture updated successfully!", "success");
    } catch (err) {
      console.error("Image upload error:", err);
      showToast("Failed to upload profile picture.", "error");
    } finally {
      setImageUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setImageUploading(true);
    try {
      const updatedProfile = await patchProfileImage(role, "remove");
      const newProfile = { ...profile, ...updatedProfile };
      
      setProfile(newProfile);
      setForm({ ...form, ...updatedProfile });
      sessionStorage.setItem('profileData', JSON.stringify(newProfile));
      
      showToast("Profile picture removed successfully!", "success");
    } catch (err) {
      console.error("Image removal error:", err);
      showToast("Failed to remove profile picture.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    imageUploading,
    fileInputRef,
    handleImageUpload,
    handleRemoveImage,
    triggerFileInput
  };
};
