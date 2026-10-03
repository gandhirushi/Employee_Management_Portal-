import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { leaveService } from "../services/leaveService";

export function useLeave() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyLeaves = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await leaveService.getMyLeaves(token);
      const list = res?.leaves || [];
      setLeaves(list);
      return list;
    } catch (err) {
      console.error("Failed to load user leaves:", err);
      setError(err.message || "Failed to load leave applications");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchLeaveRequests = useCallback(
    async (queryParams = {}) => {
      if (!token) return [];
      setLoading(true);
      setError(null);
      try {
        const res = await leaveService.getAll(token, queryParams);
        const list = res?.leaves || [];
        setLeaves(list);
        return list;
      } catch (err) {
        console.error("Failed to load all leave requests:", err);
        setError(err.message || "Failed to load leave requests");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const applyLeave = useCallback(
    async (data) => {
      if (!token) throw new Error("User not authenticated");
      setSubmitting(true);
      setError(null);
      try {
        const res = await leaveService.apply(token, data);
        const newLeave = res?.leave;
        if (newLeave) {
          setLeaves((prev) => [newLeave, ...prev]);
        }
        return res;
      } catch (err) {
        console.error("Failed to apply for leave:", err);
        setError(err.message || "Failed to submit leave application");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [token]
  );

  const updateLeaveStatus = useCallback(
    async (id, data) => {
      if (!token || !id) throw new Error("Invalid request");
      setActionLoading(true);
      setError(null);
      try {
        const res = await leaveService.updateStatus(token, id, data);
        const updated = res?.leave;
        if (updated) {
          setLeaves((prev) =>
            prev.map((l) => (l.id === id ? updated : l))
          );
        }
        return res;
      } catch (err) {
        console.error("Failed to update leave status:", err);
        setError(err.message || "Failed to update leave status");
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [token]
  );

  return {
    leaves,
    setLeaves,
    loading,
    actionLoading,
    submitting,
    error,
    fetchMyLeaves,
    fetchLeaveRequests,
    fetchAllLeaves: fetchLeaveRequests,
    applyLeave,
    updateLeaveStatus,
  };
}

export default useLeave;
