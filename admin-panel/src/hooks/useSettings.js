import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { settingsService } from "../services/settingsService";

export function useSettings() {
  const { token, user } = useAuth();
  const userId = user?.id ?? null;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!token || !userId) {
      setSettings(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await settingsService.get(token);
      const data = result?.settings || null;
      setSettings(data);
      return data;
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.message || "Failed to load settings");
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (patch) => {
      if (!token) return null;
      setSaving(true);
      setError(null);
      try {
        const result = await settingsService.update(token, patch);
        const updated = result?.settings || null;
        if (updated) {
          setSettings(updated);
        }
        return updated;
      } catch (err) {
        console.error("Failed to update settings:", err);
        setError(err.message || "Failed to update settings");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [token]
  );

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    fetchSettings,
    updateSettings,
    changeSettings: updateSettings,
  };
}

export default useSettings;
