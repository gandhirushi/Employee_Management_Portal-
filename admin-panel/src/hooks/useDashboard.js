import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { dashboardService } from "../services/dashboardService";

export function useDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getStats(token);
      setStats(result);
      return result;
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to fetch dashboard stats");
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
  };
}

export default useDashboard;
