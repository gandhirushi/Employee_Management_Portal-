import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { authService } from "../services/authService";

export function useProfile() {
  const { token, updateUserSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(
    async (patch) => {
      if (!token) {
        return { ok: false, error: "You are not logged in." };
      }

      setLoading(true);
      setError(null);
      try {
        const result = await authService.updateProfile(token, patch);
        if (result?.user && updateUserSession) {
          updateUserSession(result.user);
        }
        return { ok: true, user: result.user };
      } catch (err) {
        const msg = err.message || "Failed to update profile";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [token, updateUserSession]
  );

  const changePassword = useCallback(
    async (newPassword) => {
      if (!token) {
        return { ok: false, error: "You are not logged in." };
      }

      setLoading(true);
      setError(null);
      try {
        const result = await authService.changePassword(token, newPassword);
        return { ok: true, message: result.message };
      } catch (err) {
        const msg = err.message || "Failed to change password";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const updateProfilePhoto = useCallback(
    async (file) => {
      if (!token) {
        return { ok: false, error: "You are not logged in." };
      }

      setLoading(true);
      setError(null);
      try {
        const result = await authService.updateProfilePhoto(token, file);
        if (result?.user && updateUserSession) {
          updateUserSession(result.user);
        }
        return { ok: true, user: result.user };
      } catch (err) {
        const msg = err.message || "Failed to upload photo";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [token, updateUserSession]
  );

  const deleteProfilePhoto = useCallback(
    async () => {
      if (!token) {
        return { ok: false, error: "You are not logged in." };
      }

      setLoading(true);
      setError(null);
      try {
        const result = await authService.deleteProfilePhoto(token);
        if (result?.user && updateUserSession) {
          updateUserSession(result.user);
        }
        return { ok: true, user: result.user };
      } catch (err) {
        const msg = err.message || "Failed to delete photo";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [token, updateUserSession]
  );

  return {
    loading,
    error,
    updateProfile,
    changePassword,
    updateProfilePhoto,
    deleteProfilePhoto,
  };
}

export default useProfile;
